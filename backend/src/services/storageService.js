const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
const TEMP_ROOT = path.join(UPLOADS_ROOT, 'temp');

class StorageService {
    constructor() {
        this.ensureDir(UPLOADS_ROOT);
        this.ensureDir(TEMP_ROOT);
    }

    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    generatePropertyMediaKey(propertyId, type, filename) {
        return `properties/${propertyId}/${type}/${filename}`;
    }

    generateDraftMediaKey(draftId, type, filename) {
        return `property-drafts/${draftId}/${type}/${filename}`;
    }

    generateBuilderApplicationKey(userId, fieldName, filename) {
        const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
        return `builder-applications/${userId}/${fieldName}/${randomUUID()}-${safeName}`;
    }

    getPublicUrl(fileKey) {
        return `/uploads/${fileKey}`.replace(/\\/g, '/');
    }

    async saveBuffer(fileKey, buffer) {
        const fullPath = path.join(UPLOADS_ROOT, fileKey);
        this.ensureDir(path.dirname(fullPath));
        await fs.promises.writeFile(fullPath, buffer);
        return this.getPublicUrl(fileKey);
    }

    async saveLocalFile(fileKey, localFilePath) {
        const fullPath = path.join(UPLOADS_ROOT, fileKey);
        this.ensureDir(path.dirname(fullPath));
        await fs.promises.copyFile(localFilePath, fullPath);
        return this.getPublicUrl(fileKey);
    }

    async deleteFileByUrl(mediaUrl) {
        const relativeUrl = mediaUrl.replace(/^\/?uploads\//, '');
        const fullPath = path.join(UPLOADS_ROOT, relativeUrl);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    }

    async deletePropertyDirectory(propertyId) {
        const dir = path.join(UPLOADS_ROOT, 'properties', propertyId.toString());
        if (fs.existsSync(dir)) {
            await fs.promises.rm(dir, { recursive: true, force: true });
        }
    }

    async deleteDraftDirectory(draftId) {
        const dir = path.join(UPLOADS_ROOT, 'property-drafts', draftId.toString());
        if (fs.existsSync(dir)) {
            await fs.promises.rm(dir, { recursive: true, force: true });
        }
    }

    async moveFileByUrl(sourceUrl, destinationKey) {
        const relativeSourceUrl = sourceUrl.replace(/^\/?uploads\//, '');
        const fullSourcePath = path.join(UPLOADS_ROOT, relativeSourceUrl);
        const fullDestPath = path.join(UPLOADS_ROOT, destinationKey);
        
        if (fs.existsSync(fullSourcePath)) {
            this.ensureDir(path.dirname(fullDestPath));
            await fs.promises.rename(fullSourcePath, fullDestPath);
            return this.getPublicUrl(destinationKey);
        }
        return null;
    }

    async writeTempFile(buffer, extension) {
        const tempPath = path.join(TEMP_ROOT, `${randomUUID()}${extension}`);
        await fs.promises.writeFile(tempPath, buffer);
        return tempPath;
    }

    generateTempFilePath(extension) {
        return path.join(TEMP_ROOT, `${randomUUID()}${extension}`);
    }

    async getFileSize(filePath) {
        if (!fs.existsSync(filePath)) return 0;
        const stat = await fs.promises.stat(filePath);
        return stat.size;
    }

    async cleanupTempFiles(filePaths) {
        for (const filePath of filePaths) {
            if (filePath && fs.existsSync(filePath)) {
                try {
                    await fs.promises.unlink(filePath);
                } catch (err) {
                    console.error(`Failed to cleanup temp file: ${filePath}`, err);
                }
            }
        }
    }
}

module.exports = new StorageService();
