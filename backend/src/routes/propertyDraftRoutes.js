const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { uploadPropertyMedia } = require('../middlewares/uploadMiddleware');
const controller = require('../controllers/propertyDraftController');

router.use(protect);

router.get('/', controller.getDraft);
router.post('/', controller.upsertDraft);
router.delete('/:id', controller.deleteDraft);
router.post('/:id/media', uploadPropertyMedia, controller.uploadDraftMedia);
router.patch('/:id/media/:mediaId/thumbnail', controller.setDraftThumbnail);
router.delete('/:id/media/:mediaId', controller.deleteDraftMedia);
router.post('/:id/publish', controller.publishCreateDraft);
router.post('/:id/apply-edit', controller.applyEditDraft);

module.exports = router;
