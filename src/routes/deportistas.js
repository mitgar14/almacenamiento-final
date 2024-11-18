const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos,
    existeDeportistaPorID,
    existeEquipoPorID,
    noExistenContratacionesPorDeportista,
    existeFechaApropiada } = require('../middlewares');

const {
    obtenerDeportistas,
    obtenerDeportistaPorNombre,
    obtenerDeportistasPorEquipo,
    obtenerDeportistaPorID,
    crearDeportista,
    actualizarDeportista,
    eliminarDeportista
} = require('../controllers/deportistas');

const router = Router();

// Obtener todos los deportistas
router.get('/', obtenerDeportistas);

// Obtener deportistas por equipo
router.get('/equipo/:id', [
    check('id', 'El ID del equipo es obligatorio').not().isEmpty(),
    check('id').custom(existeEquipoPorID),
    validarCampos
], obtenerDeportistasPorEquipo);

// Obtener deportistas por nombre
router.get('/buscar', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    validarCampos
], obtenerDeportistaPorNombre);

// Obtener deportista por ID
router.get('/:id', [
    check('id', 'El ID es obligatorio').not().isEmpty(),
    check('id').custom(existeDeportistaPorID),
    validarCampos
], obtenerDeportistaPorID);

// Crear un nuevo deportista
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('dorsal', 'El dorsal debe ser un número positivo').isInt({ min: 1 }),
    check('posicion', 'La posición es obligatoria').not().isEmpty(),
    check('sexo', 'El sexo debe ser MASCULINO, FEMENINO u OTRO').isIn(['Masculino', 'Femenino', 'Otro']),
    check("ciudad", "El nombre o el ID de la ciudad es obligatorio").not().isEmpty(),
    check("pais", "El nombre o el ID del país es obligatorio").not().isEmpty(),
    check('fecha_nacimiento').custom(existeFechaApropiada),
    validarCampos
], crearDeportista);

// Actualizar un deportista
router.put('/:id', [
    check('id', 'El ID es obligatorio').not().isEmpty(),
    check('dorsal', 'El dorsal debe ser un número entero').optional().isInt(),
    check('sexo', 'El sexo debe ser MASCULINO, FEMENINO u OTRO').optional().isIn(['MASCULINO', 'FEMENINO', 'OTRO']),
    check('id').custom(existeDeportistaPorID),
    validarCampos
], actualizarDeportista);

// Eliminar un deportista
router.delete('/:id', [
    check('id', 'El ID es obligatorio').not().isEmpty(),
    check('id').custom(existeDeportistaPorID),
    check('id').custom(noExistenContratacionesPorDeportista),
    validarCampos
], eliminarDeportista);

module.exports = router;