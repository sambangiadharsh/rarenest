const Joi = require('joi');

const categorySchema = {
    create: Joi.object({
        name: Joi.string().trim().max(100).required(),
        display_order: Joi.number().integer().min(0).default(0),
    }),
    update: Joi.object({
        name: Joi.string().trim().max(100),
        is_active: Joi.boolean(),
        display_order: Joi.number().integer().min(0),
    }).min(1),
};

const featureSchema = {
    create: Joi.object({
        name: Joi.string().trim().max(150).required(),
        category_id: Joi.string().guid({ version: ['uuidv4'] }).required(),
        is_popular: Joi.boolean().default(false),
        display_order: Joi.number().integer().min(0).default(0),
        is_active: Joi.boolean().default(true),
    }),
    update: Joi.object({
        name: Joi.string().trim().max(150),
        category_id: Joi.string().guid({ version: ['uuidv4'] }),
        is_popular: Joi.boolean(),
        display_order: Joi.number().integer().min(0),
        is_active: Joi.boolean(),
    }).min(1),
};

module.exports = {
    categorySchema,
    featureSchema,
};
