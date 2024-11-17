const Joi = require('joi');

const equipoSchema = Joi.object({
    nombre: Joi.string().required(),
    pais: Joi.string().required(),
    categoria: Joi.string().valid('Masculina', 'Femenina', 'Mixta').required(),
    deporte: Joi.string().required(),
});

module.exports = { equipoSchema };
