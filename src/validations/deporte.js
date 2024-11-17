const Joi = require('joi');

const deporteSchema = Joi.object({
    nombre: Joi.string().required(),
    tipo: Joi.string().valid('Individual', 'Equipo').required(),
});

module.exports = { deporteSchema };
