const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const sharp = require('sharp');
const heroBannerRepository = require('../repositories/heroBannerRepository');

const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
const BANNER_DIR = path.join(UPLOADS_ROOT, 'hero-banners');

function ensureBannerDir() {
    fs.mkdirSync(BANNER_DIR, { recursive: true });
}

async function processBannerImage(file) {
    ensureBannerDir();
    const filename = `${randomUUID()}.webp`;
    const outputPath = path.join(BANNER_DIR, filename);

    await sharp(file.buffer)
        .rotate()
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

    return `/uploads/hero-banners/${filename}`;
}

function deleteBannerFile(imageUrl) {
    if (!imageUrl || !imageUrl.startsWith('/uploads/hero-banners/')) return;
    const filePath = path.join(UPLOADS_ROOT, imageUrl.replace(/^\/uploads\//, ''));
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
        // Non-critical — file may already be gone
    }
}

class HeroBannerService {
    getActiveBanners() {
        return heroBannerRepository.findAll({ activeOnly: true });
    }

    getAllBanners() {
        return heroBannerRepository.findAll();
    }

    async createBanner(data, file) {
        let imageUrl = data.image_url;

        if (file) {
            imageUrl = await processBannerImage(file);
        }

        if (!imageUrl) {
            const err = new Error('image_url or an uploaded image file is required');
            err.statusCode = 400;
            throw err;
        }

        return heroBannerRepository.create({ ...data, image_url: imageUrl });
    }

    async updateBanner(id, data, file) {
        const banner = await heroBannerRepository.findById(id);
        if (!banner) {
            const err = new Error('Hero banner not found');
            err.statusCode = 404;
            throw err;
        }

        let imageUrl = data.image_url;

        if (file) {
            imageUrl = await processBannerImage(file);
            // Delete old uploaded file if it was a local one
            deleteBannerFile(banner.image_url);
        }

        const updateData = { ...data };
        if (imageUrl !== undefined) updateData.image_url = imageUrl;

        return heroBannerRepository.update(id, updateData);
    }

    async deleteBanner(id) {
        const banner = await heroBannerRepository.findById(id);
        if (!banner) {
            const err = new Error('Hero banner not found');
            err.statusCode = 404;
            throw err;
        }
        await heroBannerRepository.delete(id);
        deleteBannerFile(banner.image_url);
    }

    async toggleActive(id) {
        const banner = await heroBannerRepository.findById(id);
        if (!banner) {
            const err = new Error('Hero banner not found');
            err.statusCode = 404;
            throw err;
        }
        return heroBannerRepository.update(id, { is_active: !banner.is_active });
    }

    async reorderBanners(items) {
        await heroBannerRepository.reorder(items);
    }
}

module.exports = new HeroBannerService();
