const Joi = require('joi');

const propertyTypeSchema = {
    create: Joi.object({
        name: Joi.string().trim().max(100).required(),
    }),
};

module.exports = propertyTypeSchema;
