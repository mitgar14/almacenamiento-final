const Joi = require('joi');

const ciudadSchema = Joi.object({
    nombre: Joi.string().required(),
    pais: Joi.string().required(),
});

module.exports = { ciudadSchema };
