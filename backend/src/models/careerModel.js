const Joi = require('joi');

const careerSchema = {
    create: Joi.object({
        title: Joi.string().trim().max(255).required(),
        department: Joi.string().trim().max(100).allow('', null),
        location: Joi.string().trim().max(100).allow('', null),
        employment_type: Joi.string().trim().max(50).allow('', null),
        experience_level: Joi.string().trim().max(100).allow('', null),
        description: Joi.string().allow('', null),
        requirements: Joi.string().allow('', null),
        salary_range: Joi.string().trim().max(100).allow('', null),
        application_email: Joi.string().trim().email().max(255).allow('', null),
        status: Joi.string().valid('Open', 'Closed').default('Open'),
    }),
    update: Joi.object({
        title: Joi.string().trim().max(255),
        department: Joi.string().trim().max(100).allow('', null),
        location: Joi.string().trim().max(100).allow('', null),
        employment_type: Joi.string().trim().max(50).allow('', null),
        experience_level: Joi.string().trim().max(100).allow('', null),
        description: Joi.string().allow('', null),
        requirements: Joi.string().allow('', null),
        salary_range: Joi.string().trim().max(100).allow('', null),
        application_email: Joi.string().trim().email().max(255).allow('', null),
        status: Joi.string().valid('Open', 'Closed'),
    }).min(1),
};

module.exports = careerSchema;
