const Joi = require('joi');

const deportistaSchema = Joi.object({
    nombre: Joi.string().required(),
    dorsal: Joi.number().integer().required(),
    posicion: Joi.string().required(),
    sexo: Joi.string().valid('Masculino', 'Femenino', 'Otro').required()
});

module.exports = { deportistaSchema };