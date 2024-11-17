const { equipoSchema } = require('../validations/equipo');
const Equipo = require('../models/equipo');

const crearEquipo = async (req, res) => {
    const { error } = equipoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const equipo = await Equipo.create(req.body);
        res.status(201).json(equipo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el equipo', detalle: error.message });
    }
};

const obtenerEquipos = async (req, res) => {
    try {
        const equipos = await Equipo.getAllWithRelations();
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos', detalle: error.message });
    }
};

const obtenerEquiposPorPais = async (req, res) => {
    const { pais } = req.params;
    try {
        const equipos = await Equipo.getByPais(pais);
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos por país', detalle: error.message });
    }
};

const obtenerEquiposPorDeporte = async (req, res) => {
    const { deporte } = req.params;
    try {
        const equipos = await Equipo.getByDeporte(deporte);
        res.status(200).json(equipos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los equipos por deporte', detalle: error.message });
    }
};

const actualizarEquipo = async (req, res) => {
    const { id } = req.params;
    const { error } = equipoSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const equipoActualizado = await Equipo.update(id, req.body);
        if (!equipoActualizado) return res.status(404).json({ error: 'Equipo no encontrado' });
        res.status(200).json(equipoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el equipo', detalle: error.message });
    }
};

const eliminarEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await Equipo.delete(id);
        if (!resultado) return res.status(404).json({ error: 'Equipo no encontrado' });
        res.status(200).json({ message: 'Equipo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el equipo', detalle: error.message });
    }
};

module.exports = {
    crearEquipo,
    obtenerEquipos,
    obtenerEquiposPorPais,
    obtenerEquiposPorDeporte,
    actualizarEquipo,
    eliminarEquipo,
};
