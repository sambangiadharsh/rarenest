const Joi = require('joi');

const userSchema = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        first_name: Joi.string().max(100),
        last_name: Joi.string().max(100),
        phone: Joi.string().max(20),
        address: Joi.string().allow('', null),
        role: Joi.string().valid('Buyer', 'Seller', 'Admin').default('Buyer')
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),
    resetPassword: Joi.object({
        password: Joi.string().min(6).required()
    }),
    updateProfile: Joi.object({
        first_name: Joi.string().max(100).allow('', null),
        last_name: Joi.string().max(100).allow('', null),
        phone: Joi.string().max(20).allow('', null),
        address: Joi.string().allow('', null)
    })
};

module.exports = userSchema;
