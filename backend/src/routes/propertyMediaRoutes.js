const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    uploadPropertyMedia,
    setThumbnail,
    deleteMedia,
} = require('../controllers/propertyMediaController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadPropertyMedia: uploadMw } = require('../middlewares/uploadMiddleware');

router.post('/', protect, uploadMw, uploadPropertyMedia);
router.patch('/:mediaId/thumbnail', protect, setThumbnail);
router.delete('/:mediaId', protect, deleteMedia);

module.exports = router;
