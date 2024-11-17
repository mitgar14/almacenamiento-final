const { deportistaSchema } = require('../validations/deportista');
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

const crearDeportista = async (req, res) => {
    const { error } = deportistaSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const deportista = await Deportista.create(req.body);
        res.status(201).json(deportista);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el deportista' });
    }
};

const actualizarDeportista = async (req, res) => {
    const { id } = req.query;
    const { error } = deportistaSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const deportistaActualizado = await Deportista.update(id, req.body);
        if (!deportistaActualizado) return res.status(404).json({ error: 'Deportista no encontrado' });
        res.status(200).json(deportistaActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el deportista' });
    }
};

const eliminarDeportista = async (req, res) => {
    const { nombre } = req.query;
    try {
        const resultado = await Deportista.delete(nombre);
        if (!resultado) return res.status(404).json({ error: 'Deportista no encontrado' });
        res.status(200).json({ message: 'Deportista eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el deportista' });
    }
};

module.exports = {
    crearDeportista,
    obtenerDeportistas,
    obtenerDeportistaPorNombre,
    actualizarDeportista,
    eliminarDeportista
};
