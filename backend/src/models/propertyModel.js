const Joi = require('joi');
const { ALLOWED_SPECIAL_FEATURES } = require('../config/specialFeatures');

const uuid = Joi.string().guid({ version: 'uuidv4' });

const specialFeaturesSchema = Joi.array()
    .items(Joi.string().valid(...ALLOWED_SPECIAL_FEATURES))
    .max(20)
    .optional();

const propertySchema = {
    create: Joi.object({
        title: Joi.string().max(255).required(),
        property_type_id: uuid.required(),
        asking_price: Joi.number().precision(2).required(),
        size_sqft: Joi.number().precision(2).required(),
        location_city: Joi.string().max(100).required(),
        location_state: Joi.string().max(100).required(),
        location_district: Joi.string().max(100).required(),
        contact_email: Joi.string().email().required(),
        contact_phone: Joi.string().max(20).required(),
        property_story: Joi.string().required(),
        special_features: specialFeaturesSchema,
    }),
    update: Joi.object({
        title: Joi.string().max(255),
        property_type_id: uuid,
        asking_price: Joi.number().precision(2),
        size_sqft: Joi.number().precision(2),
        location_city: Joi.string().max(100),
        location_state: Joi.string().max(100),
        location_district: Joi.string().max(100),
        contact_email: Joi.string().email().allow('', null),
        contact_phone: Joi.string().max(20).allow('', null),
        property_story: Joi.string().allow('', null),
        special_features: specialFeaturesSchema,
        status: Joi.string().valid('Available', 'Sold', 'Pending'),
    }),
};

module.exports = propertySchema;
