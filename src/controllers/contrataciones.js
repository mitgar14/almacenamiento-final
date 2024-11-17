const Contratacion = require('../models/contratacion');

const crearContratacion = async (req, res) => {
    try {
        const contratacion = await Contratacion.create(req.body);
        res.status(201).json(contratacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la contratación', detalle: error.message });
    }
};

const obtenerContrataciones = async (req, res) => {
    try {
        const contrataciones = await Contratacion.getAll();
        res.status(200).json(contrataciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las contrataciones', detalle: error.message });
    }
};

const obtenerContratacionPorDeportistaYEquipo = async (req, res) => {
    const { deportistaID, equipoID } = req.params;
    try {
        const contratacion = await Contratacion.getByDeportistaAndEquipo(deportistaID, equipoID);
        if (!contratacion) return res.status(404).json({ error: 'Contratación no encontrada' });
        res.status(200).json(contratacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la contratación', detalle: error.message });
    }
};

const actualizarContratacion = async (req, res) => {
    const { deportistaID, equipoID } = req.params;
    try {
        const contratacionActualizada = await Contratacion.update(deportistaID, equipoID, req.body);
        if (!contratacionActualizada) return res.status(404).json({ error: 'Contratación no encontrada' });
        res.status(200).json(contratacionActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la contratación', detalle: error.message });
    }
};

const eliminarContratacion = async (req, res) => {
    const { deportistaID, equipoID } = req.params;
    try {
        const resultado = await Contratacion.delete(deportistaID, equipoID);
        if (!resultado) return res.status(404).json({ error: 'Contratación no encontrada' });
        res.status(200).json({ message: 'Contratación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la contratación', detalle: error.message });
    }
};

module.exports = {
    crearContratacion,
    obtenerContrataciones,
    obtenerContratacionPorDeportistaYEquipo,
    actualizarContratacion,
    eliminarContratacion
};