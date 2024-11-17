const Joi = require('joi');

const paisSchema = Joi.object({
    nombre: Joi.string().required()
});

module.exports = { paisSchema };
