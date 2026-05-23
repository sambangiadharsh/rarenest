const Joi = require('joi');

const guestEnquiry = Joi.object({
    property_id: Joi.string().uuid().required(),
    email: Joi.string().email().required(),
    name: Joi.string().trim().min(2).max(150).required(),
    phone: Joi.string().trim().min(8).max(20).required(),
});

module.exports = { guestEnquiry };
