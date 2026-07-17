const Joi = require('joi');

const VALID_CATEGORIES = [
    'Account', 'Property Listing', 'Builder Verification',
    'Report Listing', 'Technical Issue', 'Payments',
    'Feature Request', 'Other',
];

const createTicket = Joi.object({
    category: Joi.string().valid(...VALID_CATEGORIES).required(),
    subject: Joi.string().trim().min(3).max(255).required(),
    description: Joi.string().trim().min(10).max(5000).required(),
});

const updateStatus = Joi.object({
    status: Joi.string().valid(
        'Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed',
    ).required(),
});

const updatePriority = Joi.object({
    priority: Joi.string().valid('Low', 'Medium', 'High').required(),
});

const assignTicket = Joi.object({
    admin_id: Joi.string().uuid().required(),
});

const internalNote = Joi.object({
    message: Joi.string().trim().min(1).max(5000).required(),
});

const sendMessage = Joi.object({
    message: Joi.string().trim().min(1).max(5000).required(),
});

module.exports = {
    createTicket,
    updateStatus,
    updatePriority,
    assignTicket,
    internalNote,
    sendMessage,
    VALID_CATEGORIES,
};
