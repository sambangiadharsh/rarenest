const Joi = require('joi');

const ALLOWED_PAGE_KEYS = ['about_us', 'terms_and_conditions', 'privacy_policy'];

const cmsSchema = {
    upsert: Joi.object({
        title: Joi.string().trim().max(255).required(),
        content: Joi.string().required(),
        meta_title: Joi.string().trim().max(255).allow('', null),
        meta_description: Joi.string().allow('', null),
        status: Joi.string().valid('Draft', 'Published').default('Published'),
    }),
};

module.exports = { cmsSchema, ALLOWED_PAGE_KEYS };
