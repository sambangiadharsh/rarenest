const Joi = require('joi');

const faqSchema = {
    create: Joi.object({
        question: Joi.string().trim().max(1000).required(),
        answer: Joi.string().max(5000).required(),
        is_active: Joi.boolean().default(true),
    }),
    update: Joi.object({
        question: Joi.string().trim().max(1000),
        answer: Joi.string().max(5000),
        is_active: Joi.boolean(),
    }).min(1),
};

module.exports = faqSchema;
