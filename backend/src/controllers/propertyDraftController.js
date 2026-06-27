const propertyDraftService = require('../services/propertyDraftService');

function sendError(res, err) {
    const status = err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ success: false, message: err.message || 'Server Error' });
}

exports.upsertDraft = async (req, res) => {
    try {
        const { draft_type, property_id, current_step, draft_data } = req.body;
        if (!['Create', 'Edit'].includes(draft_type)) {
            return res.status(400).json({ success: false, message: 'Invalid draft_type' });
        }
        if (draft_type === 'Edit' && !property_id) {
            return res.status(400).json({ success: false, message: 'property_id is required for edit drafts' });
        }

        const draft = await propertyDraftService.upsertDraft({
            sellerId: req.user.id,
            propertyId: property_id,
            draftType: draft_type,
            currentStep: current_step,
            draftData: draft_data,
        });
        res.status(200).json({ success: true, data: draft });
    } catch (err) {
        sendError(res, err);
    }
};

exports.getDraft = async (req, res) => {
    try {
        const { draft_type = 'Create', property_id } = req.query;
        if (!['Create', 'Edit'].includes(draft_type)) {
            return res.status(400).json({ success: false, message: 'Invalid draft_type' });
        }
        const draft = await propertyDraftService.getDraft({
            sellerId: req.user.id,
            draftType: draft_type,
            propertyId: property_id,
        });
        res.status(200).json({ success: true, data: draft });
    } catch (err) {
        sendError(res, err);
    }
};

exports.deleteDraft = async (req, res) => {
    try {
        await propertyDraftService.deleteDraft(req.params.id, req.user);
        res.status(200).json({ success: true, message: 'Draft deleted' });
    } catch (err) {
        sendError(res, err);
    }
};

exports.uploadDraftMedia = async (req, res) => {
    try {
        const images = req.files?.images || [];
        const videos = req.files?.videos || [];
        if (images.length === 0 && videos.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
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
    } catch (err) {
        sendError(res, err);
    }
};

exports.setDraftThumbnail = async (req, res) => {
    try {
        const updated = await propertyDraftService.setThumbnail(req.params.id, req.params.mediaId, req.user);
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        sendError(res, err);
    }
};

exports.deleteDraftMedia = async (req, res) => {
    try {
        await propertyDraftService.deleteMedia(req.params.id, req.params.mediaId, req.user);
        res.status(200).json({ success: true, message: 'Media deleted' });
    } catch (err) {
        sendError(res, err);
    }
};

exports.publishCreateDraft = async (req, res) => {
    try {
        const property = await propertyDraftService.publishCreateDraft(req.params.id, req.user);
        res.status(201).json({ success: true, data: property });
    } catch (err) {
        sendError(res, err);
    }
};

exports.applyEditDraft = async (req, res) => {
    try {
        const property = await propertyDraftService.applyEditDraft(req.params.id, req.user);
        res.status(200).json({ success: true, data: property });
    } catch (err) {
        sendError(res, err);
    }
};
