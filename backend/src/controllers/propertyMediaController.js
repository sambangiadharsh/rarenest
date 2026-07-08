const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const propertyService = require('../services/propertyService');
const mediaService = require('../services/mediaService');
const propertyMediaRepository = require('../repositories/propertyMediaRepository');

async function assertOwnerOrAdmin(propertyId, user) {
    const isOwner = await propertyService.checkOwnership(propertyId, user.id);
    if (isOwner === null) {
        return { status: 404, message: 'Property not found' };
    }
    if (!isOwner && user.role !== 'Admin') {
        return { status: 403, message: 'Not authorized' };
    }
    return null;
}

// @route POST /api/properties/:id/media
exports.uploadPropertyMedia = asyncHandler(async (req, res) => {
        const authError = await assertOwnerOrAdmin(req.params.id, req.user);
        if (authError) {
            throw new AppError(authError.message, authError.status);
        }

        const images = req.files?.images || [];
        const videos = req.files?.videos || [];

        if (images.length === 0 && videos.length === 0) {
            throw new AppError('No files uploaded', 400);
        }

        const thumbnailIndex = req.body.thumbnail_index !== undefined
            ? parseInt(req.body.thumbnail_index, 10)
            : 0;

        if (videos.length > 0 && Number.isFinite(thumbnailIndex) && thumbnailIndex >= images.length && images.length > 0) {
            // thumbnail_index only applies to images in this batch
        }

        const savedImages = images.length
            ? await mediaService.processAndStoreImages(req.params.id, images, thumbnailIndex)
            : [];
        const savedVideos = videos.length
            ? await mediaService.processAndStoreVideos(req.params.id, videos)
            : [];

        res.status(201).json({
            success: true,
            data: [...savedImages, ...savedVideos],
        });
});

// @route PATCH /api/properties/:id/media/:mediaId/thumbnail
exports.setThumbnail = asyncHandler(async (req, res) => {
        const authError = await assertOwnerOrAdmin(req.params.id, req.user);
        if (authError) {
            throw new AppError(authError.message, authError.status);
        }
        
        const updated = await mediaService.setThumbnail(req.params.id, req.params.mediaId);
        if (!updated) {
            throw new AppError('Media not found', 404);
        }

        res.status(200).json({ success: true, data: updated });
});

// @route DELETE /api/properties/:id/media/:mediaId
exports.deleteMedia = asyncHandler(async (req, res) => {
        const authError = await assertOwnerOrAdmin(req.params.id, req.user);
        if (authError) {
            throw new AppError(authError.message, authError.status);
        }

        const media = await propertyMediaRepository.findById(req.params.mediaId);
        if (!media || media.property_id !== req.params.id) {
            throw new AppError('Media not found', 404);
        }

        await mediaService.deleteMedia(media);
        res.status(200).json({ success: true, message: 'Media deleted' });
});
