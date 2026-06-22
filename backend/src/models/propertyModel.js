const Joi = require('joi');
const { ALLOWED_SPECIAL_FEATURES } = require('../config/specialFeatures');

const uuid = Joi.string().guid({ version: 'uuidv4' });

const specialFeaturesSchema = Joi.array()
    .items(Joi.string().valid(...ALLOWED_SPECIAL_FEATURES))
    .max(20)
    .optional();

const propertySchema = {
    guestCreate: Joi.object({
        name: Joi.string().min(2).max(150).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(8).max(20).required(),
        title: Joi.string().max(255).required(),
        property_type_id: uuid.required(),
        asking_price: Joi.number().precision(2).required(),
        size_sqft: Joi.number().precision(2).required(),
        location_city: Joi.string().max(100).required(),
        location_state: Joi.string().max(100).required(),
        location_district: Joi.string().max(100).required(),
        Area: Joi.string().max(100).required(),
        Pincode: Joi.string().max(10).required(),
        contact_email: Joi.string().email().required(),
        contact_phone: Joi.string().max(20).required(),
        property_story: Joi.string().required(),
        property_age: Joi.number().integer().min(0).max(200).required(),
        special_features: specialFeaturesSchema,
        selectedFeatureIds: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).optional(),
        listing_type: Joi.string().valid('Individual').default('Individual'),
    }),
    create: Joi.object({
        title: Joi.string().max(255).required(),
        property_type_id: uuid.required(),
        asking_price: Joi.number().precision(2).required(),
        size_sqft: Joi.number().precision(2).required(),
        location_city: Joi.string().max(100).required(),
        location_state: Joi.string().max(100).required(),
        location_district: Joi.string().max(100).required(),
        Area: Joi.string().max(100).required(),
        Pincode: Joi.string().max(10).required(),
        contact_email: Joi.string().email().required(),
        contact_phone: Joi.string().max(20).required(),
        property_story: Joi.string().required(),
        property_age: Joi.number().integer().min(0).max(200).required(),
        special_features: specialFeaturesSchema,
        selectedFeatureIds: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).optional(),
        listing_type: Joi.string().valid('Individual', 'BuilderProject').default('Individual'),
    }),
    update: Joi.object({
        title: Joi.string().max(255),
        property_type_id: uuid,
        asking_price: Joi.number().precision(2),
        size_sqft: Joi.number().precision(2),
        location_city: Joi.string().max(100),
        location_state: Joi.string().max(100),
        location_district: Joi.string().max(100),
        Area: Joi.string().max(100).allow('', null),
        Pincode: Joi.string().max(10).allow('', null),
        contact_email: Joi.string().email().allow('', null),
        contact_phone: Joi.string().max(20).allow('', null),
        property_story: Joi.string().allow('', null),
        property_age: Joi.number().integer().min(0).max(200),
        special_features: specialFeaturesSchema,
        selectedFeatureIds: Joi.array().items(Joi.string().guid({ version: 'uuidv4' })).optional(),
        status: Joi.string().valid('Available', 'Sold', 'Pending'),
        is_visible: Joi.boolean(),
        listing_type: Joi.string().valid('Individual', 'BuilderProject'),
    }),
};

module.exports = propertySchema;
