const { Router } = require('express');
const { check } = require('express-validator');
const {
    crearEquipo,
    obtenerEquipos,
    obtenerEquipoPorID,
    obtenerEquiposPorPais,
    obtenerEquiposPorDeporte,
    actualizarEquipo,
    eliminarEquipo
} = require('../controllers/equipos');

const { validarCampos,
    existeEquipoPorID,
    noExistenDeportistasPorEquipo,
    noExistenContratacionesPorEquipo
 } = require('../middlewares');

const router = Router();

// Obtener todos los equipos
router.get('/', obtenerEquipos);

// Obtener equipos por país
router.get('/pais', [
    check('pais', 'El país es obligatorio').not().isEmpty(),
    validarCampos
], obtenerEquiposPorPais);

// Obtener equipos por deporte
router.get('/deporte', [
    check('deporte', 'El deporte es obligatorio').not().isEmpty(),
    validarCampos
], obtenerEquiposPorDeporte);

// Obtener un equipo por ID
router.get('/:id', [
    check('id', "El ID es obligatorio").not().isEmpty(),
    check('id', 'No es un ID válido').isInt(),
    check('id').custom(existeEquipoPorID),
    validarCampos
], obtenerEquipoPorID);

// Crear un nuevo equipo
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('pais', 'El país es obligatorio').not().isEmpty(),
    check('deporte', 'El deporte es obligatorio').not().isEmpty(),
    validarCampos
], crearEquipo);

// Actualizar un equipo existente
router.put('/:id', [
    check('id', "El ID es obligatorio").not().isEmpty(),
    check('id', 'No es un ID válido').isInt(),
    check('id').custom(existeEquipoPorID),
    validarCampos
], actualizarEquipo);

// Eliminar un equipo por ID
router.delete('/:id', [
    check('id', "El ID es obligatorio").not().isEmpty(),
    check('id', 'No es un ID válido').isInt(),
    check('id').custom(existeEquipoPorID),
    check('id').custom(noExistenDeportistasPorEquipo),
    check('id').custom(noExistenContratacionesPorEquipo),
    validarCampos
], eliminarEquipo);

module.exports = router;
