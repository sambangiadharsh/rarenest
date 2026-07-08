const { randomUUID } = require('crypto');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const propertySchema = require('../models/propertyModel');
const limits = require('../config/mediaLimits');
const propertyService = require('./propertyService');
const builderRepository = require('../repositories/builderRepository');
const propertyDraftRepository = require('../repositories/propertyDraftRepository');
const propertyDraftMediaRepository = require('../repositories/propertyDraftMediaRepository');
const propertyMediaRepository = require('../repositories/propertyMediaRepository');
const storageService = require('./storageService');

function mapDraftToPropertyData(draftData = {}) {
    const data = { ...draftData };
    if (data.city !== undefined) { data.location_city = data.city; delete data.city; }
    if (data.state !== undefined) { data.location_state = data.state; delete data.state; }
    if (data.district !== undefined) { data.location_district = data.district; delete data.district; }
    if (data.area !== undefined) { data.Area = data.area; delete data.area; }
    if (data.pincode !== undefined) { data.Pincode = data.pincode; delete data.pincode; }
    delete data.images;
    delete data.videos;
    return data;
}

function validateImage(file) {
    if (!limits.IMAGE_MIMES.includes(file.mimetype)) {
        throw Object.assign(new Error(`Invalid image type: ${file.mimetype}`), { statusCode: 400 });
    }
    if (file.size > limits.MAX_IMAGE_BYTES) {
        throw Object.assign(new Error(`Image exceeds ${limits.MAX_IMAGE_BYTES / (1024 * 1024)}MB limit`), { statusCode: 400 });
    }
}

function validateVideo(file) {
    if (!limits.VIDEO_MIMES.includes(file.mimetype)) {
        throw Object.assign(new Error(`Invalid video type: ${file.mimetype}`), { statusCode: 400 });
    }
    if (file.size > limits.MAX_VIDEO_BYTES) {
        throw Object.assign(new Error(`Video exceeds ${limits.MAX_VIDEO_BYTES / (1024 * 1024)}MB limit`), { statusCode: 400 });
    }
}

async function compressImage(buffer) {
    return await sharp(buffer)
        .rotate()
        .resize({ width: limits.MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: limits.IMAGE_QUALITY })
        .toBuffer();
}

function compressVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-c:v libx264',
                '-preset fast',
                '-crf 28',
                '-movflags +faststart',
                '-vf', `scale='min(${limits.VIDEO_MAX_WIDTH},iw)':-2`,
                '-c:a aac',
                '-b:a 128k',
            ])
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(outputPath);
    });
}

function assertDraftOwner(draft, user) {
    if (!draft) {
        throw Object.assign(new Error('Draft not found'), { statusCode: 404 });
    }
    if (String(draft.seller_id).toLowerCase() !== String(user.id).toLowerCase() && user.role !== 'Admin') {
        throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }
}

class PropertyDraftService {
    async upsertDraft({ sellerId, propertyId, draftType, currentStep, draftData }) {
        if (draftType === 'Edit') {
            const isOwner = await propertyService.checkOwnership(propertyId, sellerId);
            if (isOwner === null) {
                throw Object.assign(new Error('Property not found'), { statusCode: 404 });
            }
            if (!isOwner) {
                throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
            }
        }

        return propertyDraftRepository.upsert({
            seller_id: sellerId,
            property_id: draftType === 'Edit' ? propertyId : null,
            draft_type: draftType,
            current_step: currentStep || 1,
            draft_data: draftData || {},
        });
    }

    async getDraft({ sellerId, draftType, propertyId }) {
        const draft = await propertyDraftRepository.findForSeller({
            seller_id: sellerId,
            draft_type: draftType,
            property_id: draftType === 'Edit' ? propertyId : null,
        });
        if (!draft) return null;
        draft.media = await propertyDraftMediaRepository.findByDraftId(draft.id);
        return draft;
    }

    async deleteDraft(draftId, user) {
        const draft = await propertyDraftRepository.findById(draftId);
        assertDraftOwner(draft, user);
        await this.deleteDraftUploads(draftId);
        return propertyDraftRepository.deleteById(draftId);
    }

    async uploadMedia(draftId, user, { images = [], videos = [], thumbnailIndex = 0 }) {
        const draft = await propertyDraftRepository.findById(draftId);
        assertDraftOwner(draft, user);

        const saved = [];
        const existingImages = await propertyDraftMediaRepository.countByDraftAndType(draftId, 'Image');
        const existingVideos = await propertyDraftMediaRepository.countByDraftAndType(draftId, 'Video');
        if (existingImages + images.length > limits.MAX_IMAGES) {
            throw Object.assign(new Error(`Maximum ${limits.MAX_IMAGES} images allowed per draft`), { statusCode: 400 });
        }
        if (existingVideos + videos.length > limits.MAX_VIDEOS) {
            throw Object.assign(new Error(`Maximum ${limits.MAX_VIDEOS} videos allowed per draft`), { statusCode: 400 });
        }

        const thumbIdx = Number.isFinite(thumbnailIndex) && !Number.isNaN(thumbnailIndex)
            ? Math.max(0, Math.min(thumbnailIndex, images.length - 1))
            : 0;

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            validateImage(file);
            const filename = `${randomUUID()}.webp`;
            const fileKey = storageService.generateDraftMediaKey(draftId, 'images', filename);

            let bufferToSave;
            try {
                bufferToSave = await compressImage(file.buffer);
                if (!bufferToSave || bufferToSave.length === 0) {
                    throw Object.assign(new Error('Image output is empty'), { statusCode: 400 });
                }
                if (bufferToSave.length > limits.MAX_IMAGE_OUTPUT_BYTES) {
                    throw Object.assign(new Error('Image still exceeds size limit after compression'), { statusCode: 400 });
                }
            } catch (err) {
                throw err.statusCode ? err : Object.assign(new Error(err.message || 'Image processing failed'), { statusCode: 500 });
            }

            const relativeUrl = await storageService.saveBuffer(fileKey, bufferToSave);

            const row = await propertyDraftMediaRepository.insert({
                draft_id: draftId,
                media_url: relativeUrl,
                media_type: 'Image',
                is_thumbnail: existingImages === 0 && i === thumbIdx,
                sort_order: existingImages + i,
            });
            saved.push(row);
        }

        for (let i = 0; i < videos.length; i++) {
            const file = videos[i];
            validateVideo(file);

            const originalName = file.originalname || '';
            const match = originalName.match(/\.[0-9a-z]+$/i);
            const sourceExt = match ? match[0].toLowerCase() : '.mp4';
            const inputExt = sourceExt.startsWith('.') ? sourceExt : '.mp4';
            
            const tempInput = await storageService.writeTempFile(file.buffer, `-in${inputExt}`);
            const tempOutput = storageService.generateTempFilePath('.mp4');

            const filename = `${randomUUID()}.mp4`;
            const fileKey = storageService.generateDraftMediaKey(draftId, 'videos', filename);
            let finalUrl;

            try {
                await compressVideo(tempInput, tempOutput);
                
                const outSize = await storageService.getFileSize(tempOutput);
                if (outSize === 0) throw Object.assign(new Error(`Video output is empty`), { statusCode: 400 });
                if (outSize > limits.MAX_VIDEO_OUTPUT_BYTES) throw Object.assign(new Error(`Video still exceeds size limit after compression`), { statusCode: 400 });
                
                finalUrl = await storageService.saveLocalFile(fileKey, tempOutput);
            } catch (err) {
                try {
                    const inSize = await storageService.getFileSize(tempInput);
                    if (inSize === 0) throw Object.assign(new Error(`Video output is empty`), { statusCode: 400 });
                    if (inSize > limits.MAX_VIDEO_OUTPUT_BYTES) throw Object.assign(new Error(`Video still exceeds size limit after compression`), { statusCode: 400 });

                    finalUrl = await storageService.saveLocalFile(fileKey, tempInput);
                } catch (fallbackErr) {
                    throw Object.assign(
                        new Error(fallbackErr.message || err.message || 'Video processing failed'),
                        { statusCode: fallbackErr.statusCode || 400 },
                    );
                }
            } finally {
                await storageService.cleanupTempFiles([tempInput, tempOutput]);
            }

            const row = await propertyDraftMediaRepository.insert({
                draft_id: draftId,
                media_url: finalUrl,
                media_type: 'Video',
                is_thumbnail: false,
                sort_order: existingVideos + i,
            });
            saved.push(row);
        }

        return saved;
    }

    async setThumbnail(draftId, mediaId, user) {
        const draft = await propertyDraftRepository.findById(draftId);
        assertDraftOwner(draft, user);
        const updated = await propertyDraftMediaRepository.setThumbnail(draftId, mediaId);
        if (!updated) {
            throw Object.assign(new Error('Media not found'), { statusCode: 404 });
        }
        return updated;
    }

    async deleteMedia(draftId, mediaId, user) {
        const draft = await propertyDraftRepository.findById(draftId);
        assertDraftOwner(draft, user);
        const media = await propertyDraftMediaRepository.findById(mediaId);
        if (!media || String(media.draft_id).toLowerCase() !== String(draftId).toLowerCase()) {
            throw Object.assign(new Error('Media not found'), { statusCode: 404 });
        }
        await this.deleteUploadFile(media.media_url);
        return propertyDraftMediaRepository.deleteById(mediaId);
    }

    async publishCreateDraft(draftId, user) {
        const draft = await propertyDraftRepository.findById(draftId);
        assertDraftOwner(draft, user);
        if (draft.draft_type !== 'Create') {
            throw Object.assign(new Error('Draft is not a create draft'), { statusCode: 400 });
        }

        const propertyData = mapDraftToPropertyData(draft.draft_data);
        const { error } = propertySchema.create.validate(propertyData);
        if (error) {
            throw Object.assign(new Error(error.details[0].message), { statusCode: 400 });
        }
        if (propertyData.listing_type === 'BuilderProject') {
            const builder = await builderRepository.findProfileByUserId(user.id);
            if (!builder || builder.builder_status !== 'Approved') {
                throw Object.assign(
                    new Error('Builder approval required to create a Builder Project listing.'),
                    { statusCode: 403 },
                );
            }
        }

        const property = await propertyService.createProperty({ ...propertyData, seller_id: user.id });
        await this.promoteDraftMedia(draftId, property.id);
        await propertyDraftRepository.deleteById(draftId);
        await this.deleteDraftUploads(draftId);
        return propertyService.getPropertyById(property.id);
    }

    async applyEditDraft(draftId, user) {
        const draft = await propertyDraftRepository.findById(draftId);
        assertDraftOwner(draft, user);
        if (draft.draft_type !== 'Edit' || !draft.property_id) {
            throw Object.assign(new Error('Draft is not an edit draft'), { statusCode: 400 });
        }

        const propertyData = mapDraftToPropertyData(draft.draft_data);
        const { error } = propertySchema.update.validate(propertyData);
        if (error) {
            throw Object.assign(new Error(error.details[0].message), { statusCode: 400 });
        }

        const property = await propertyService.updateProperty(draft.property_id, propertyData);
        await this.promoteDraftMedia(draftId, draft.property_id);
        await propertyDraftRepository.deleteById(draftId);
        await this.deleteDraftUploads(draftId);
        return property;
    }

    async promoteDraftMedia(draftId, propertyId) {
        const media = await propertyDraftMediaRepository.findByDraftId(draftId);
        if (!media.length) return [];

        const promoted = [];
        for (const item of media) {
            const subfolder = item.media_type === 'Video' ? 'videos' : 'images';
            // Extract filename from URL (e.g. /uploads/property-drafts/1/images/uuid.webp -> uuid.webp)
            const parts = item.media_url.split('/');
            const filename = parts[parts.length - 1];
            
            const destKey = storageService.generatePropertyMediaKey(propertyId, subfolder, filename);
            const newUrl = await storageService.moveFileByUrl(item.media_url, destKey);

            if (newUrl) {
                const row = await propertyMediaRepository.insert({
                    property_id: propertyId,
                    media_url: newUrl,
                    media_type: item.media_type,
                    is_thumbnail: item.is_thumbnail,
                });
                promoted.push(row);
            }
        }
        return promoted;
    }

    async deleteUploadFile(mediaUrl) {
        await storageService.deleteFileByUrl(mediaUrl);
    }

    async deleteDraftUploads(draftId) {
        await storageService.deleteDraftDirectory(draftId);
    }
}

module.exports = new PropertyDraftService();
