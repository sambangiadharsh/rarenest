const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const propertyDraftService = require('../services/propertyDraftService');

function sendError(res, err) {
    const status = err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ success: false, message: err.message || 'Server Error' });
}

exports.upsertDraft = asyncHandler(async (req, res) => {
        const { draft_type, property_id, current_step, draft_data } = req.body;
        if (!['Create', 'Edit'].includes(draft_type)) {
            throw new AppError('Invalid draft_type', 400);
        }
        if (draft_type === 'Edit' && !property_id) {
            throw new AppError('property_id is required for edit drafts', 400);
        }

        const draft = await propertyDraftService.upsertDraft({
            sellerId: req.user.id,
            propertyId: property_id,
            draftType: draft_type,
            currentStep: current_step,
            draftData: draft_data,
        });
        res.status(200).json({ success: true, data: draft });
});

exports.getDraft = asyncHandler(async (req, res) => {
        const { draft_type = 'Create', property_id } = req.query;
        if (!['Create', 'Edit'].includes(draft_type)) {
            throw new AppError('Invalid draft_type', 400);
        }
        const draft = await propertyDraftService.getDraft({
            sellerId: req.user.id,
            draftType: draft_type,
            propertyId: property_id,
        });
        res.status(200).json({ success: true, data: draft });
});

exports.deleteDraft = asyncHandler(async (req, res) => {
        await propertyDraftService.deleteDraft(req.params.id, req.user);
        res.status(200).json({ success: true, message: 'Draft deleted' });
});

exports.uploadDraftMedia = asyncHandler(async (req, res) => {
        const images = req.files?.images || [];
        const videos = req.files?.videos || [];
        if (images.length === 0 && videos.length === 0) {
            throw new AppError('No files uploaded', 400);
        }
        const thumbnailIndex = req.body.thumbnail_index !== undefined
            ? parseInt(req.body.thumbnail_index, 10)
            : 0;
        const media = await propertyDraftService.uploadMedia(req.params.id, req.user, {
            images,
            videos,
            thumbnailIndex,
        });
        res.status(201).json({ success: true, data: media });
});

exports.setDraftThumbnail = asyncHandler(async (req, res) => {
        const updated = await propertyDraftService.setThumbnail(req.params.id, req.params.mediaId, req.user);
        res.status(200).json({ success: true, data: updated });
});

exports.deleteDraftMedia = asyncHandler(async (req, res) => {
        await propertyDraftService.deleteMedia(req.params.id, req.params.mediaId, req.user);
        res.status(200).json({ success: true, message: 'Media deleted' });
});

exports.publishCreateDraft = asyncHandler(async (req, res) => {
        const property = await propertyDraftService.publishCreateDraft(req.params.id, req.user);
        res.status(201).json({ success: true, data: property });
});

exports.applyEditDraft = asyncHandler(async (req, res) => {
        const property = await propertyDraftService.applyEditDraft(req.params.id, req.user);
        res.status(200).json({ success: true, data: property });
});
