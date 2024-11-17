const { Router } = require('express');
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

const router = Router();

router.get('/contratos-desde', consultarDeportistasConContratosDesde);
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
