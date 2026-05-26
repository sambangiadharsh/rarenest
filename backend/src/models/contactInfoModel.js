const Joi = require('joi');

const contactInfoSchema = {
    upsert: Joi.object({
        support_email: Joi.string().trim().email().max(255).allow('', null),
        support_phone: Joi.string().trim().max(20).allow('', null),
        office_address: Joi.string().allow('', null),
        facebook_url: Joi.string().trim().max(500).allow('', null),
        instagram_url: Joi.string().trim().max(500).allow('', null),
        linkedin_url: Joi.string().trim().max(500).allow('', null),
        twitter_url: Joi.string().trim().max(500).allow('', null),
    }),
};

module.exports = contactInfoSchema;
