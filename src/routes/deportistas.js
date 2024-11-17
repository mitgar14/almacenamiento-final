const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const {
    crearDeportista,
    obtenerDeportistas,
    obtenerDeportistaPorNombre,
    actualizarDeportista,
    eliminarDeportista
} = require('../controllers/deportistas');

const router = Router();

// Obtener todos los deportistas
router.get('/', obtenerDeportistas);

// Obtener deportistas por nombre
router.get('/buscar', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], obtenerDeportistaPorNombre);

// Crear un nuevo deportista
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('dorsal', 'El dorsal debe ser un número entero').isInt(),
    check('posicion', 'La posición es obligatoria').not().isEmpty(),
    check('sexo', 'El sexo debe ser Masculino, Femenino o Otro').isIn(['Masculino', 'Femenino', 'Otro']),
    validarCampos
], crearDeportista);

// Actualizar un deportista
router.put('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('dorsal', 'El dorsal debe ser un número entero').optional().isInt(),
    check('posicion', 'La posición es obligatoria').optional().not().isEmpty(),
    check('sexo', 'El sexo debe ser Masculino, Femenino o Otro').optional().isIn(['Masculino', 'Femenino', 'Otro']),
    validarCampos
], actualizarDeportista);

// Eliminar un deportista
router.delete('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], eliminarDeportista);

module.exports = router;