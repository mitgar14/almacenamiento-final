const Consultas = require('../models/consultas');

const realizarConsulta = async (req, res, consulta, params = {}) => {
    try {
        const resultado = await consulta(params);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al realizar la consulta', detalle: error.message });
    }
};

// Consultas principales
const consultarDeportistasConContratosDesde = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasConContratosDesde, { fecha: req.query.fecha });

const consultarDeportistasMasculinosEnFutbolEspana = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasMasculinosEnEquiposFutbolEspana);

const consultarDeportistasDeEspanaEnEquiposEspana = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasDeEspanaEnEquiposEspana);

const consultarDeportistasConContratosAltos = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasConContratosAltos);

const consultarCantidadDeportistasPorEquipo = (req, res) =>
    realizarConsulta(req, res, Consultas.cantidadDeportistasPorEquipo);

// Consultas adicionales
const consultarEquiposConMasDe3Deportistas = (req, res) =>
    realizarConsulta(req, res, Consultas.equiposConMasDe3Deportistas);

const consultarCantidadDeportistasPorDeporteMinimo1 = (req, res) =>
    realizarConsulta(req, res, Consultas.cantidadDeportistasPorDeporteMinimo1);

const consultarContratosTerminandoEn6Meses = (req, res) =>
    realizarConsulta(req, res, Consultas.contratosTerminandoEn6Meses);

const consultarEquiposConContratosActivos = (req, res) =>
    realizarConsulta(req, res, Consultas.equiposConContratosActivos);

const consultarDeportistasConContratosLargos = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasConContratosLargos);

module.exports = {
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
};
