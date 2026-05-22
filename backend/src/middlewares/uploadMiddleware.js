const multer = require('multer');
const limits = require('../config/mediaLimits');

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        files: limits.MAX_IMAGES + limits.MAX_VIDEOS,
        fileSize: limits.MAX_VIDEO_BYTES,
    },
});

const uploadPropertyMedia = upload.fields([
    { name: 'images', maxCount: limits.MAX_IMAGES },
    { name: 'videos', maxCount: limits.MAX_VIDEOS },
]);

module.exports = { uploadPropertyMedia };
