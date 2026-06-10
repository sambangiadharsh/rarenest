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

const uploadBannerImage = multer({
    storage,
    limits: { files: 1, fileSize: limits.MAX_IMAGE_BYTES },
    fileFilter(req, file, cb) {
        if (limits.IMAGE_MIMES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(Object.assign(new Error('Only JPEG, PNG, or WebP images are allowed'), { statusCode: 400 }));
        }
    },
}).single('image');

module.exports = { uploadPropertyMedia, uploadBannerImage };
