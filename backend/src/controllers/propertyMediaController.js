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
exports.uploadPropertyMedia = async (req, res) => {
    try {
        const authError = await assertOwnerOrAdmin(req.params.id, req.user);
        if (authError) {
            return res.status(authError.status).json({ success: false, message: authError.message });
        }

        const images = req.files?.images || [];
        const videos = req.files?.videos || [];

        if (images.length === 0 && videos.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
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
    } catch (err) {
        console.error(err);
        const status = err.statusCode || 500;
        res.status(status).json({
            success: false,
            message: err.message || 'Upload failed',
        });
    }
};

// @route PATCH /api/properties/:id/media/:mediaId/thumbnail
exports.setThumbnail = async (req, res) => {
    try {
        const authError = await assertOwnerOrAdmin(req.params.id, req.user);
        if (authError) {
            return res.status(authError.status).json({ success: false, message: authError.message });
        }

        const updated = await mediaService.setThumbnail(req.params.id, req.params.mediaId);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        console.error(err);
        const status = err.statusCode || 500;
        res.status(status).json({ success: false, message: err.message || 'Server Error' });
    }
};

// @route DELETE /api/properties/:id/media/:mediaId
exports.deleteMedia = async (req, res) => {
    try {
        const authError = await assertOwnerOrAdmin(req.params.id, req.user);
        if (authError) {
            return res.status(authError.status).json({ success: false, message: authError.message });
        }

        const media = await propertyMediaRepository.findById(req.params.mediaId);
        if (!media || media.property_id !== req.params.id) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        await mediaService.deleteMedia(media);
        res.status(200).json({ success: true, message: 'Media deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
