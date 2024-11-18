const Equipo = require('../models/equipo');

const standardizeString = require("../helpers/string");

const obtenerEquipos = async (req, res) => {
    try {
        const equipos = await Equipo.getAllWithRelations();
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
};

const obtenerEquipoPorID = async (req, res) => {
    const { id } = req.params;
    try {
      const equipo = await Equipo.getByID(id);
      res.status(200).json(equipo);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el equipo', detalle: error.message });
    }
  };

const obtenerEquiposPorPais = async (req, res) => {
    const { pais } = req.query;

    try {
        const equipos = await Equipo.getByPais(pais);
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos por país', detalle: error.message });
    }
};

const obtenerEquiposPorDeporte = async (req, res) => {
    const { deporte } = req.query;
    try {
        const deporteEstandarizado = standardizeString(deporte);
        const equipos = await Equipo.getByDeporte(deporteEstandarizado);
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos por deporte', detalle: error.message });
    }
};

const crearEquipo = async (req, res) => {
    try {
        const equipo = await Equipo.create(req.body);
        res.status(201).json(equipo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el equipo', detalle: error.message });
    }
};

const actualizarEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const equipoActualizado = await Equipo.update(id, req.body);
        res.status(200).json(equipoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el equipo', detalle: error.message });
    }
};

const eliminarEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await Equipo.delete(id);
        res.status(200).json({ message: 'Equipo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el equipo', detalle: error.message });
    }
};

module.exports = {
    crearEquipo,
    obtenerEquipos,
    obtenerEquipoPorID,
    obtenerEquiposPorPais,
    obtenerEquiposPorDeporte,
    actualizarEquipo,
    eliminarEquipo,
};