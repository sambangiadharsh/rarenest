const { randomUUID } = require('crypto');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const limits = require('../config/mediaLimits');
const propertyMediaRepository = require('../repositories/propertyMediaRepository');
const storageService = require('./storageService');

function preValidateImage(file) {
    if (!limits.IMAGE_MIMES.includes(file.mimetype)) {
        throw Object.assign(new Error(`Invalid image type: ${file.mimetype}`), { statusCode: 400 });
    }
    if (file.size > limits.MAX_IMAGE_BYTES) {
        throw Object.assign(new Error(`Image exceeds ${limits.MAX_IMAGE_BYTES / (1024 * 1024)}MB limit`), { statusCode: 400 });
    }
}

function preValidateVideo(file) {
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

class MediaService {
    async processAndStoreImages(propertyId, imageFiles, thumbnailIndex = 0) {
        const existingCount = await propertyMediaRepository.countByPropertyAndType(propertyId, 'Image');
        if (existingCount + imageFiles.length > limits.MAX_IMAGES) {
            throw Object.assign(
                new Error(`Maximum ${limits.MAX_IMAGES} images allowed per property`),
                { statusCode: 400 },
            );
        }

        const saved = [];
        const thumbIdx = Number.isFinite(thumbnailIndex) && !Number.isNaN(thumbnailIndex)
            ? Math.max(0, Math.min(thumbnailIndex, imageFiles.length - 1))
            : 0;

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            preValidateImage(file);

            const filename = `${randomUUID()}.webp`;
            const fileKey = storageService.generatePropertyMediaKey(propertyId, 'images', filename);

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

            const row = await propertyMediaRepository.insert({
                property_id: propertyId,
                media_url: relativeUrl,
                media_type: 'Image',
                is_thumbnail: false,
            });
            saved.push(row);
        }

        if (saved.length > 0) {
            const thumbRow = await propertyMediaRepository.setThumbnail(propertyId, saved[thumbIdx].id);
            if (thumbRow) {
                saved[thumbIdx] = thumbRow;
            }
        }

        return saved;
    }

    async processAndStoreVideos(propertyId, videoFiles) {
        const existingCount = await propertyMediaRepository.countByPropertyAndType(propertyId, 'Video');
        if (existingCount + videoFiles.length > limits.MAX_VIDEOS) {
            throw Object.assign(
                new Error(`Maximum ${limits.MAX_VIDEOS} videos allowed per property`),
                { statusCode: 400 },
            );
        }

        const saved = [];

        for (const file of videoFiles) {
            preValidateVideo(file);

            const originalName = file.originalname || '';
            const match = originalName.match(/\.[0-9a-z]+$/i);
            const sourceExt = match ? match[0].toLowerCase() : '.mp4';
            const inputExt = sourceExt.startsWith('.') ? sourceExt : '.mp4';
            
            const tempInput = await storageService.writeTempFile(file.buffer, `-in${inputExt}`);
            const tempOutput = storageService.generateTempFilePath('.mp4');

            const filename = `${randomUUID()}.mp4`;
            const fileKey = storageService.generatePropertyMediaKey(propertyId, 'videos', filename);
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

            const row = await propertyMediaRepository.insert({
                property_id: propertyId,
                media_url: finalUrl,
                media_type: 'Video',
                is_thumbnail: false,
            });
            saved.push(row);
        }

        return saved;
    }

    async setThumbnail(propertyId, mediaId) {
        const media = await propertyMediaRepository.findById(mediaId);
        if (!media || media.property_id !== propertyId) {
            throw Object.assign(new Error('Media not found'), { statusCode: 404 });
        }
        if (media.media_type !== 'Image') {
            throw Object.assign(new Error('Only images can be set as thumbnail'), { statusCode: 400 });
        }
        return propertyMediaRepository.setThumbnail(propertyId, mediaId);
    }

    async deleteMedia(media) {
        await storageService.deleteFileByUrl(media.media_url);
        return propertyMediaRepository.deleteById(media.id);
    }

    async deletePropertyUploads(propertyId) {
        await storageService.deletePropertyDirectory(propertyId);
    }
}

module.exports = new MediaService();
