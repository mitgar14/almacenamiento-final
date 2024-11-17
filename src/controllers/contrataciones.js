const { contratacionSchema } = require('../validations/contratacion');
const Contratacion = require('../models/contratacion');

const crearContratacion = async (req, res) => {
    const { error } = contratacionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const contratacion = await Contratacion.create(req.body);
        res.status(201).json(contratacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la contratación' });
    }
};

const obtenerContrataciones = async (req, res) => {
    try {
        const contrataciones = await Contratacion.getAll();
        res.status(200).json(contrataciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las contrataciones' });
    }
};

const obtenerContratacionPorDeportistaYEquipo = async (req, res) => {
    const { deportistaId, equipoId } = req.params;
    try {
        const contratacion = await Contratacion.getByDeportistaAndEquipo(deportistaId, equipoId);
        if (!contratacion) return res.status(404).json({ error: 'Contratación no encontrada' });
        res.status(200).json(contratacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la contratación' });
    }
};

const actualizarContratacion = async (req, res) => {
    const { deportistaId, equipoId } = req.params;
    const { error } = contratacionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const contratacionActualizada = await Contratacion.update(deportistaId, equipoId, req.body);
        if (!contratacionActualizada) return res.status(404).json({ error: 'Contratación no encontrada' });
        res.status(200).json(contratacionActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la contratación' });
    }
};

const eliminarContratacion = async (req, res) => {
    const { deportistaId, equipoId } = req.params;
    try {
        const resultado = await Contratacion.delete(deportistaId, equipoId);
        if (!resultado) return res.status(404).json({ error: 'Contratación no encontrada' });
        res.status(200).json({ message: 'Contratación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la contratación' });
    }
};

module.exports = {
    crearContratacion,
    obtenerContrataciones,
    obtenerContratacionPorDeportistaYEquipo,
    actualizarContratacion,
    eliminarContratacion
};