const Joi = require('joi');

const openPropertyChat = Joi.object({
    property_id: Joi.string().uuid().required(),
});

module.exports = { openPropertyChat };
