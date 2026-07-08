const AppError = require('../utils/AppError');

function normalizeError(err) {
    if (err instanceof AppError) {
        return err;
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return new AppError('File too large', 400);
    }

    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return new AppError(err.message || 'Invalid upload', 400);
    }

    if (err.statusCode || err.status) {
        return new AppError(err.message || 'Invalid request', err.statusCode || err.status);
    }

    return err;
}

const errorMiddleware = (err, req, res, next) => {
    const normalizedError = normalizeError(err);
    const statusCode = normalizedError.statusCode || 500;
    const isExpected = normalizedError instanceof AppError || normalizedError.isOperational;

    if (statusCode >= 500) {
        console.error(err.stack || err);
    }
   
    const response = {
        success: false,
        message: isExpected ? normalizedError.message : 'Internal Server Error',
    };

    if (isExpected && normalizedError.details && Object.keys(normalizedError.details).length > 0) {
        Object.assign(response, normalizedError.details);
    }

    res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
