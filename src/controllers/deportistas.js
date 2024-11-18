const neo4j = require('neo4j-driver');
const Deportista = require('../models/deportista');
const standardizeString = require('../helpers/string');

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
    const campos = req.body;
  
    try {
      // Verificar que se proporcionan campos para actualizar
      if (Object.keys(campos).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
      }
  
      // Construir la cláusula SET y los parámetros
      const actualizaciones = [];
      const parametros = { id: neo4j.int(id) };
  
      if (campos.nombre) {
        actualizaciones.push('d.nombre = $nombre');
        parametros.nombre = standardizeString(campos.nombre);
      }
      if (campos.dorsal !== undefined) {
        actualizaciones.push('d.dorsal = $dorsal');
        parametros.dorsal = neo4j.int(campos.dorsal);
      }
      if (campos.posicion) {
        actualizaciones.push('d.posicion = $posicion');
        parametros.posicion = standardizeString(campos.posicion);
      }
      if (campos.sexo) {
        actualizaciones.push('d.sexo = $sexo');
        parametros.sexo = standardizeString(campos.sexo);
      }
  
      const setClause = actualizaciones.join(', ');
  
      // Llamar al modelo pasando la cláusula SET y los parámetros
      const deportistaActualizado = await Deportista.update(id, setClause, parametros);
  
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