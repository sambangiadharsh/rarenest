const fs = require('fs');
const path = require('path');
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

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function toPublicUrl(relativePath) {
    return relativePath.replace(/\\/g, '/');
}

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

async function compressImage(buffer, outputPath) {
    await sharp(buffer)
        .rotate()
        .resize({ width: limits.MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: limits.IMAGE_QUALITY })
        .toFile(outputPath);
}

function postValidateFile(filePath, maxBytes, label) {
    if (!fs.existsSync(filePath)) {
        throw Object.assign(new Error(`${label} processing failed`), { statusCode: 500 });
    }
    const stat = fs.statSync(filePath);
    if (stat.size === 0 || stat.size > maxBytes) {
        fs.unlinkSync(filePath);
        throw Object.assign(new Error(`${label} exceeds output size limit`), { statusCode: 400 });
    }
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
        this.deleteDraftUploads(draftId);
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

        const imageDir = path.join(UPLOADS_ROOT, 'property-drafts', draftId, 'images');
        const videoDir = path.join(UPLOADS_ROOT, 'property-drafts', draftId, 'videos');
        ensureDir(imageDir);
        ensureDir(videoDir);

        const thumbIdx = Number.isFinite(thumbnailIndex) && !Number.isNaN(thumbnailIndex)
            ? Math.max(0, Math.min(thumbnailIndex, images.length - 1))
            : 0;

        for (let i = 0; i < images.length; i++) {
            const file = images[i];
            validateImage(file);
            const filename = `${randomUUID()}.webp`;
            const outputPath = path.join(imageDir, filename);
            await compressImage(file.buffer, outputPath);
            postValidateFile(outputPath, limits.MAX_IMAGE_OUTPUT_BYTES, 'Image');
            const row = await propertyDraftMediaRepository.insert({
                draft_id: draftId,
                media_url: toPublicUrl(`/uploads/property-drafts/${draftId}/images/${filename}`),
                media_type: 'Image',
                is_thumbnail: existingImages === 0 && i === thumbIdx,
                sort_order: existingImages + i,
            });
            saved.push(row);
        }

        const tempDir = path.join(UPLOADS_ROOT, 'temp');
        ensureDir(tempDir);
        for (let i = 0; i < videos.length; i++) {
            const file = videos[i];
            validateVideo(file);
            const sourceExt = path.extname(file.originalname || '').toLowerCase() || '.mp4';
            const tempInput = path.join(tempDir, `${randomUUID()}-in${sourceExt}`);
            const filename = `${randomUUID()}.mp4`;
            const outputPath = path.join(videoDir, filename);
            fs.writeFileSync(tempInput, file.buffer);
            try {
                await compressVideo(tempInput, outputPath);
                postValidateFile(outputPath, limits.MAX_VIDEO_OUTPUT_BYTES, 'Video');
            } catch {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                fs.copyFileSync(tempInput, outputPath);
                postValidateFile(outputPath, limits.MAX_VIDEO_OUTPUT_BYTES, 'Video');
            } finally {
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            }
            const row = await propertyDraftMediaRepository.insert({
                draft_id: draftId,
                media_url: toPublicUrl(`/uploads/property-drafts/${draftId}/videos/${filename}`),
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
        this.deleteUploadFile(media.media_url);
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
        this.deleteDraftUploads(draftId);
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
        this.deleteDraftUploads(draftId);
        return property;
    }

    async promoteDraftMedia(draftId, propertyId) {
        const media = await propertyDraftMediaRepository.findByDraftId(draftId);
        if (!media.length) return [];

        const promoted = [];
        for (const item of media) {
            const subfolder = item.media_type === 'Video' ? 'videos' : 'images';
            const source = path.join(UPLOADS_ROOT, item.media_url.replace(/^\/?uploads\//, ''));
            const filename = path.basename(source);
            const destDir = path.join(UPLOADS_ROOT, 'properties', propertyId, subfolder);
            const dest = path.join(destDir, filename);
            ensureDir(destDir);
            if (fs.existsSync(source)) {
                fs.renameSync(source, dest);
            }
            const row = await propertyMediaRepository.insert({
                property_id: propertyId,
                media_url: toPublicUrl(`/uploads/properties/${propertyId}/${subfolder}/${filename}`),
                media_type: item.media_type,
                is_thumbnail: item.is_thumbnail,
            });
            promoted.push(row);
        }
        return promoted;
    }

    deleteUploadFile(mediaUrl) {
        const relative = mediaUrl.replace(/^\/?uploads\//, '');
        const resolved = path.join(UPLOADS_ROOT, relative);
        if (fs.existsSync(resolved)) fs.unlinkSync(resolved);
    }

    deleteDraftUploads(draftId) {
        const dir = path.join(UPLOADS_ROOT, 'property-drafts', draftId);
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }
}

module.exports = new PropertyDraftService();
