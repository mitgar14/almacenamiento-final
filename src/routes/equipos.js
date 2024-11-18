const { Router } = require('express');
const { check } = require('express-validator');
const {
    crearEquipo,
    obtenerEquipos,
    obtenerEquiposPorPais,
    obtenerEquiposPorDeporte,
    actualizarEquipo,
    eliminarEquipo
} = require('../controllers/equipos');

const { validarCampos,
    noExistenDeportistasPorEquipo,
    noExistenContratacionesPorEquipo
 } = require('../middlewares');

const router = Router();

// Obtener todos los equipos
router.get('/', obtenerEquipos);

// Obtener equipos por país
router.get('/pais/:pais', [
    check('pais', 'El país es obligatorio').not().isEmpty(),
    validarCampos
], obtenerEquiposPorPais);

// Obtener equipos por deporte
router.get('/deporte/:deporte', [
    check('deporte', 'El deporte es obligatorio').not().isEmpty(),
    validarCampos
], obtenerEquiposPorDeporte);

// Crear un nuevo equipo
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('pais', 'El país es obligatorio').not().isEmpty(),
    check('deporte', 'El deporte es obligatorio').not().isEmpty(),
    validarCampos
], crearEquipo);

// Actualizar un equipo existente
router.put('/:id', [
    check('id', 'No es un ID válido').isInt(),
    check('categoria', 'La categoría debe ser Femenina, Masculina o Mixta').optional().isIn(['Femenina', 'Masculina', 'Mixta']),
    validarCampos
], actualizarEquipo);

// Eliminar un equipo por ID
router.delete('/:id', [
    check('id', 'No es un ID válido').isInt(),
    check('id').custom(noExistenDeportistasPorEquipo),
    check('id').custom(noExistenContratacionesPorEquipo),
    validarCampos
], eliminarEquipo);

module.exports = router;
