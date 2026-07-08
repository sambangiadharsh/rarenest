const MB = 1024 * 1024;

module.exports = {
    MAX_IMAGES: 10,
    MAX_VIDEOS: 2,
    MAX_IMAGE_BYTES: 5 * MB,
    MAX_DOCUMENT_BYTES: 5 * MB,
    MAX_VIDEO_BYTES: 50 * MB,
    MAX_IMAGE_OUTPUT_BYTES: 3 * MB,
    MAX_VIDEO_OUTPUT_BYTES: 50 * MB,
    MAX_IMAGE_WIDTH: 1920,
    IMAGE_QUALITY: 80,
    IMAGE_MIMES: ['image/jpeg', 'image/png', 'image/webp'],
    VIDEO_MIMES: ['video/mp4', 'video/webm', 'video/quicktime'],
    VIDEO_MAX_WIDTH: 1280,
};
