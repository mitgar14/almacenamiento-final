const neo4j = require('neo4j-driver');
const Consultas = require('../models/consultas');

const realizarConsulta = require("../helpers/consultas");

// Consultas principales
const consultarDeportistasConContratosDesde = (req, res) => {
  const { fecha } = req.query;

  realizarConsulta(req, res, async () => {
    const resultado = await Consultas.deportistasConContratosDesde(fecha);

    if (resultado.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron contratos desde la fecha especificada"
      });
    }

    return res.status(200).json(resultado);
  });
};

const consultarDeportistasMasculinosEnFutbolEspana = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasMasculinosEnEquiposFutbolEspana);

const consultarDeportistasDeEspanaEnEquiposEspana = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasDeEspanaEnEquiposEspana);

const consultarDeportistasConContratosAltos = (req, res) =>
    realizarConsulta(req, res, Consultas.deportistasConContratosAltos);

const consultarCantidadDeportistasPorEquipo = (req, res) =>
    realizarConsulta(req, res, Consultas.cantidadDeportistasPorEquipo);

// Consultas adicionales
const consultarNacionalidadDeportistasPorEquipo = (req, res) =>
  realizarConsulta(req, res, Consultas.nacionalidadDeportistasPorEquipo);

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
    consultarNacionalidadDeportistasPorEquipo,
    consultarCantidadDeportistasPorDeporteMinimo1,
    consultarContratosTerminandoEn6Meses,
    consultarEquiposConContratosActivos,
    consultarDeportistasConContratosLargos
};
