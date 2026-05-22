const Joi = require('joi');

const reviewSchema = {
    create: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required(),
        comment: Joi.string().max(1000).allow('', null)
    })
};

module.exports = reviewSchema;
