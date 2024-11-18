const { Router } = require('express');
const { check } = require('express-validator');

const {
    consultarDeportistasConContratosDesde,
    consultarDeportistasMasculinosEnFutbolEspana,
    consultarDeportistasDeEspanaEnEquiposEspana,
    consultarDeportistasConContratosAltos,
    consultarCantidadDeportistasPorEquipo,
    consultarEquiposConMasDe3Deportistas,
    consultarCantidadDeportistasPorDeporteMinimo1,
    consultarContratosTerminandoEn6Meses,
    consultarEquiposConContratosActivos,
    consultarDeportistasConContratosLargos
} = require('../controllers/consultas');

const { validarCampos } = require('../middlewares');

const router = Router();

router.get('/contratos-desde', [
    check('fecha')
      .exists()
      .withMessage('La fecha es requerida')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Formato de fecha inválido. Use YYYY-MM-DD'),
    validarCampos
  ], consultarDeportistasConContratosDesde);

router.get('/masculinos-futbol-espana', consultarDeportistasMasculinosEnFutbolEspana);
router.get('/deportistas-espana-equipos-espana', consultarDeportistasDeEspanaEnEquiposEspana);
router.get('/contratos-altos', consultarDeportistasConContratosAltos);
router.get('/deportistas-por-equipo', consultarCantidadDeportistasPorEquipo);

router.get('/equipos-mas-3-deportistas', consultarEquiposConMasDe3Deportistas);
router.get('/deportistas-por-deporte-minimo-1', consultarCantidadDeportistasPorDeporteMinimo1);
router.get('/contratos-terminan-en-6-meses', consultarContratosTerminandoEn6Meses);
router.get('/equipos-contratos-activos', consultarEquiposConContratosActivos);
router.get('/deportistas-contratos-largos', consultarDeportistasConContratosLargos);

module.exports = router;
