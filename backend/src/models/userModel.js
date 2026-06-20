const Joi = require('joi');

const userSchema = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        first_name: Joi.string().max(100),
        last_name: Joi.string().max(100),
        phone: Joi.string().max(20),
        address: Joi.string().allow('', null),
        role: Joi.string().valid('User', 'Admin').default('User')
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required(),
    }),
    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('password')).required()
            .messages({ 'any.only': 'Passwords do not match' }),
    }),
    changePassword: Joi.object({
        current_password: Joi.string().required(),
        new_password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
            .messages({ 'any.only': 'Passwords do not match' }),
    }),
    updateProfile: Joi.object({
        first_name: Joi.string().max(100).allow('', null),
        last_name: Joi.string().max(100).allow('', null),
        phone: Joi.string().max(20).allow('', null),
        address: Joi.string().allow('', null)
    }),
    updateRole: Joi.object({
        role: Joi.string().valid('User', 'Admin').required()
    })
};

module.exports = userSchema;
