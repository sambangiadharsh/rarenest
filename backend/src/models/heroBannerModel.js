const Joi = require('joi');

const heroBannerSchema = {
    // Used when no file is uploaded — image_url required
    create: Joi.object({
        title: Joi.string().trim().max(255).required(),
        subtitle: Joi.string().trim().max(500).allow('', null).optional(),
        image_url: Joi.string().uri().max(1000).required(),
        display_order: Joi.number().integer().min(1).default(1),
        is_active: Joi.boolean().default(true),
    }),
    // Used when a file IS uploaded — image_url not required
    createWithFile: Joi.object({
        title: Joi.string().trim().max(255).required(),
        subtitle: Joi.string().trim().max(500).allow('', null).optional(),
        image_url: Joi.string().uri().max(1000).optional(),
        display_order: Joi.number().integer().min(1).default(1),
        is_active: Joi.boolean().default(true),
    }),
    update: Joi.object({
        title: Joi.string().trim().max(255),
        subtitle: Joi.string().trim().max(500).allow('', null),
        image_url: Joi.string().uri().max(1000),
        display_order: Joi.number().integer().min(1),
        is_active: Joi.boolean(),
    }),
    reorder: Joi.object({
        items: Joi.array().items(
            Joi.object({
                id: Joi.string().guid({ version: 'uuidv4' }).required(),
                display_order: Joi.number().integer().min(1).required(),
            })
        ).min(1).required(),
    }),
};

module.exports = heroBannerSchema;
