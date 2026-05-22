const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const limits = require('../config/mediaLimits');
const propertyMediaRepository = require('../repositories/propertyMediaRepository');

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

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

async function compressImage(buffer, outputPath) {
    await sharp(buffer)
        .rotate()
        .resize({ width: limits.MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: limits.IMAGE_QUALITY })
        .toFile(outputPath);
}

function postValidateFile(filePath, maxBytes, label) {
    if (!fs.existsSync(filePath)) {
        throw Object.assign(new Error(`${label} compression failed`), { statusCode: 500 });
    }
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
        fs.unlinkSync(filePath);
        throw Object.assign(new Error(`${label} output is empty`), { statusCode: 400 });
    }
    if (stat.size > maxBytes) {
        fs.unlinkSync(filePath);
        throw Object.assign(new Error(`${label} still exceeds size limit after compression`), { statusCode: 400 });
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

class MediaService {
    getPropertyMediaDir(propertyId, subfolder) {
        return path.join(UPLOADS_ROOT, 'properties', propertyId, subfolder);
    }

    toPublicUrl(relativePath) {
        return relativePath.replace(/\\/g, '/');
    }

    async processAndStoreImages(propertyId, imageFiles, thumbnailIndex = 0) {
        const existingCount = await propertyMediaRepository.countByPropertyAndType(propertyId, 'Image');
        if (existingCount + imageFiles.length > limits.MAX_IMAGES) {
            throw Object.assign(
                new Error(`Maximum ${limits.MAX_IMAGES} images allowed per property`),
                { statusCode: 400 },
            );
        }

        const imageDir = this.getPropertyMediaDir(propertyId, 'images');
        ensureDir(imageDir);

        const saved = [];
        const thumbIdx = Number.isFinite(thumbnailIndex) && !Number.isNaN(thumbnailIndex)
            ? Math.max(0, Math.min(thumbnailIndex, imageFiles.length - 1))
            : 0;

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            preValidateImage(file);

            const filename = `${randomUUID()}.webp`;
            const outputPath = path.join(imageDir, filename);
            const relativeUrl = this.toPublicUrl(`/uploads/properties/${propertyId}/images/${filename}`);

            try {
                await compressImage(file.buffer, outputPath);
                postValidateFile(outputPath, limits.MAX_IMAGE_OUTPUT_BYTES, 'Image');
            } catch (err) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                throw err.statusCode ? err : Object.assign(new Error(err.message || 'Image processing failed'), { statusCode: 500 });
            }

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

        const videoDir = this.getPropertyMediaDir(propertyId, 'videos');
        ensureDir(videoDir);

        const saved = [];
        const tempDir = path.join(UPLOADS_ROOT, 'temp');
        ensureDir(tempDir);

        for (const file of videoFiles) {
            preValidateVideo(file);

            const tempInput = path.join(tempDir, `${randomUUID()}-in`);
            const filename = `${randomUUID()}.mp4`;
            const outputPath = path.join(videoDir, filename);
            const relativeUrl = this.toPublicUrl(`/uploads/properties/${propertyId}/videos/${filename}`);

            fs.writeFileSync(tempInput, file.buffer);

            try {
                await compressVideo(tempInput, outputPath);
                postValidateFile(outputPath, limits.MAX_VIDEO_OUTPUT_BYTES, 'Video');
            } catch (err) {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                throw Object.assign(new Error(err.message || 'Video processing failed'), { statusCode: 500 });
            } finally {
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
            }

            const row = await propertyMediaRepository.insert({
                property_id: propertyId,
                media_url: relativeUrl,
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
        const relative = media.media_url.replace(/^\/?uploads\//, '');
        const resolved = path.join(UPLOADS_ROOT, relative);
        if (fs.existsSync(resolved)) {
            fs.unlinkSync(resolved);
        }
        return propertyMediaRepository.deleteById(media.id);
    }

    deletePropertyUploads(propertyId) {
        const dir = path.join(UPLOADS_ROOT, 'properties', propertyId);
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }
}

module.exports = new MediaService();
