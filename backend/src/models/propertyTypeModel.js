const Joi = require('joi');

const propertyTypeSchema = {
    create: Joi.object({
        name: Joi.string().trim().max(100).required(),
    }),
    update: Joi.object({
        name: Joi.string().trim().max(100),
        is_active: Joi.boolean(),
        display_order: Joi.number().integer().min(0),
    }).min(1),
};

module.exports = propertyTypeSchema;
