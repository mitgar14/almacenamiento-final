const Joi = require('joi');

const deportistaSchema = Joi.object({
    nombre: Joi.string().required(),
    dorsal: Joi.number().integer().required(),
    posicion: Joi.string().required(),
    sexo: Joi.string().uppercase().valid('MASCULINO', 'FEMENINO', 'OTRO').required()
});

module.exports = { deportistaSchema };