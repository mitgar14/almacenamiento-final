const { Router } = require('express');
const { check } = require('express-validator');
const {
    crearContratacion,
    obtenerContrataciones,
    obtenerContratacionPorDeportistaYEquipo,
    actualizarContratacion,
    eliminarContratacion
} = require('../controllers/contrataciones');
const { validarCampos } = require('../middlewares');

const router = Router();

// Obtener todas las contrataciones
router.get('/', obtenerContrataciones);

// Obtener una contratación específica entre deportista y equipo
router.get('/:deportistaID/:equipoID', [
    check('deportistaID', 'ID de deportista inválido').isInt(),
    check('equipoID', 'ID de equipo inválido').isInt(),
    validarCampos
], obtenerContratacionPorDeportistaYEquipo);

// Crear una nueva contratación
router.post('/', [
    check('fecha_inicio', 'Fecha de inicio es obligatoria').isDate(),
    check('fecha_fin', 'Fecha de finalización es obligatoria').isDate(),
    check('valor_contrato', 'El valor del contrato debe ser un número positivo').isFloat({ gt: 0 }),
    check('deportistaID', 'ID de deportista es obligatorio').isInt(),
    check('equipoID', 'ID de equipo es obligatorio').isInt(),
    validarCampos
], crearContratacion);

// Actualizar una contratación
router.put('/:deportistaID/:equipoID', [
    check('fecha_inicio', 'Fecha de inicio es obligatoria').optional().isDate(),
    check('fecha_fin', 'Fecha de finalización es obligatoria').optional().isDate(),
    check('valor_contrato', 'El valor del contrato debe ser un número positivo').optional().isFloat({ gt: 0 }),
    validarCampos
], actualizarContratacion);

// Eliminar una contratación
router.delete('/:deportistaID/:equipoID', [
    check('deportistaID', 'ID de deportista inválido').isInt(),
    check('equipoID', 'ID de equipo inválido').isInt(),
    validarCampos
], eliminarContratacion);

module.exports = router;
