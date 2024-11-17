const Joi = require('joi');

const contratacionSchema = Joi.object({
    fecha_inicio: Joi.date().required().messages({
        'date.base': 'La fecha de inicio debe ser una fecha válida',
        'any.required': 'La fecha de inicio es obligatoria'
    }),
    fecha_fin: Joi.date().greater(Joi.ref('fecha_inicio')).required().messages({
        'date.base': 'La fecha de finalización debe ser una fecha válida',
        'date.greater': 'La fecha de finalización debe ser posterior a la fecha de inicio',
        'any.required': 'La fecha de finalización es obligatoria'
    }),
    valor_contrato: Joi.number().positive().required().messages({
        'number.base': 'El valor del contrato debe ser un número',
        'number.positive': 'El valor del contrato debe ser positivo',
        'any.required': 'El valor del contrato es obligatorio'
    }),
});

module.exports = { contratacionSchema };
