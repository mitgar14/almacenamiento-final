const { Router } = require('express');
const { check } = require('express-validator');
const {
    crearContratacion,
    obtenerContrataciones,
    obtenerContratacionPorDeportista,
    obtenerContratacionPorEquipo,
    actualizarContratacion,
    eliminarContratacion
} = require('../controllers/contrataciones');
const { validarCampos,
    existeDeportistaPorID,
    existeContratacionPorID,
    existenContratacionesPorDeportista,
    existenContratacionesPorEquipo,
    existeEquipoPorID
 } = require('../middlewares');

const router = Router();

// Obtener todas las contrataciones
router.get('/', obtenerContrataciones);

// Obtener todas las contrataciones de un deportista
router.get('/deportista/:deportistaID', [
    check("deportistaID", "El ID del deportista es obligatorio").not().isEmpty(),
    check('deportistaID').custom(existeDeportistaPorID),
    check("deportistaID").custom(existenContratacionesPorDeportista),
    validarCampos
], obtenerContratacionPorDeportista);

// Obtener una contratación específica entre deportista y equipo
router.get('/equipo/:equipoID', [
    check("equipoID", "El ID del equipo es obligatorio").not().isEmpty(),
    check('equipoID').custom(existeEquipoPorID),
    check("equipoID").custom(existenContratacionesPorEquipo),
    validarCampos
], obtenerContratacionPorEquipo);

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
router.put('/:contratoID', [
    check('contratoID', 'ID de contratación es obligatorio').isInt(),
    check('fecha_inicio', 'Fecha de inicio no válida').optional().isDate(),
    check('fecha_fin', 'Fecha de finalización no válida').optional().isDate(),
    check('valor_contrato', 'El valor del contrato debe ser un número positivo').optional().isFloat({ gt: 0 }),
    check('contratoID').custom(existeContratacionPorID),
    validarCampos
], actualizarContratacion);

// Eliminar una contratación
router.delete('/:contratoID', [
    check("contratoID", "El ID de la contratación es obligatorio").not().isEmpty(),
    check('contratoID').custom(existeContratacionPorID),
    validarCampos
], eliminarContratacion);

module.exports = router;
