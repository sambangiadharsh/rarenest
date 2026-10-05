const Joi = require('joi');

const builderApplicationSchema = {
    submit: Joi.object({
        company_name: Joi.string().trim().max(255).required(),
        company_description: Joi.string().trim().max(10000).required(),
        company_registration_number: Joi.string().trim().max(100).required(),
        website: Joi.string().trim().max(255).uri().allow('', null).optional(),
        contact_person_name: Joi.string().trim().max(150).required(),
        business_email: Joi.string().trim().email().max(255).required(),
        business_phone: Joi.string().trim().max(30).required(),
        office_address: Joi.string().trim().max(1000).required(),
        city: Joi.string().trim().max(100).required(),
        state: Joi.string().trim().max(100).required(),
        is_primary_contact: Joi.any().optional(),
        gst_number: Joi.string().trim().max(50).allow('', null).optional(),
        rera_number: Joi.string().trim().max(50).allow('', null).optional(),
        social_links: Joi.string().trim().max(1000).allow('', null).optional(),
        declaration_accepted: Joi.any().required(),
    }),
};

module.exports = builderApplicationSchema;
