const Joi = require('joi');

const faqSchema = {
    create: Joi.object({
        question: Joi.string().trim().required(),
        answer: Joi.string().required(),
        is_active: Joi.boolean().default(true),
    }),
    update: Joi.object({
        question: Joi.string().trim(),
        answer: Joi.string(),
        is_active: Joi.boolean(),
    }).min(1),
};

module.exports = faqSchema;
