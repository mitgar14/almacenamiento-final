const Deportista = require('../models/deportista');

const obtenerDeportistas = async (req, res) => {
    try {
        const deportistas = await Deportista.getAll();
        res.status(200).json(deportistas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los deportistas' });
    }
};

const obtenerDeportistaPorNombre = async (req, res) => {
    const { nombre } = req.query;
    try {
        const deportistas = await Deportista.getByName(nombre);
        if (deportistas.length === 0) {
            return res.status(404).json({ error: 'No se encontraron deportistas' });
        }
        res.status(200).json(deportistas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los deportistas' });
    }
};

const obtenerDeportistaPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const deportista = await Deportista.getByID(id);
        if (!deportista) {
            return res.status(404).json({ error: 'Deportista no encontrado' });
        }
        res.status(200).json(deportista);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el deportista' });
    }
};

const crearDeportista = async (req, res) => {
    try {
        const deportista = await Deportista.create(req.body);
        res.status(201).json(deportista);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el deportista', detalle: error.message });
    }
};

const actualizarDeportista = async (req, res) => {
    const { id } = req.params;
    try {
        const deportistaActualizado = await Deportista.update(id, req.body);
        if (!deportistaActualizado) {
            return res.status(404).json({ error: 'Deportista no encontrado' });
        }
        res.status(200).json(deportistaActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el deportista', detalle: error.message });
    }
};

const eliminarDeportista = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await Deportista.delete(id);
        if (!resultado) {
            return res.status(404).json({ error: 'Deportista no encontrado' });
        }
        res.status(200).json({ message: 'Deportista eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el deportista', detalle: error.message });
    }
};

module.exports = {
    crearDeportista,
    obtenerDeportistas,
    obtenerDeportistaPorNombre,
    obtenerDeportistaPorID,
    actualizarDeportista,
    eliminarDeportista
};