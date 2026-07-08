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

const BUILDER_APPLICATION_MIMES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
];

const uploadBuilderApplicationFiles = multer({
    storage,
    limits: { files: 5, fileSize: limits.MAX_DOCUMENT_BYTES },
    fileFilter(req, file, cb) {
        if (BUILDER_APPLICATION_MIMES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(Object.assign(new Error('Only PDF, JPG, JPEG, or PNG files are allowed'), { statusCode: 400 }));
        }
    },
}).fields([
    { name: 'company_logo', maxCount: 1 },
    { name: 'business_registration_certificate', maxCount: 1 },
    { name: 'applicant_government_id', maxCount: 1 },
    { name: 'gst_certificate', maxCount: 1 },
    { name: 'rera_certificate', maxCount: 1 },
]);

module.exports = { uploadPropertyMedia, uploadBannerImage, uploadBuilderApplicationFiles };
