const Joi = require('joi');

const sellerSchema = {
    updateProfile: Joi.object({
        bio: Joi.string().max(1000).required()
    })
};

module.exports = sellerSchema;
