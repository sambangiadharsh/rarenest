const Joi = require('joi');

const sendMessage = Joi.object({
    message: Joi.string().trim().max(5000).allow('', null),
    message_type: Joi.string().valid('TEXT', 'IMAGE', 'FILE').default('TEXT'),
});

const markRead = Joi.object({
    message_id: Joi.string().uuid().required(),
});

const archive = Joi.object({
    is_archived: Joi.boolean().required(),
});

module.exports = { sendMessage, markRead, archive };
