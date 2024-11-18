const neo4j = require("neo4j-driver");
const Contratacion = require("../models/contratacion");

const crearContratacion = async (req, res) => {
  try {
    const contratacion = await Contratacion.create(req.body);
    res.status(201).json(contratacion);
  } catch (error) {
    res.status(500).json({
      error: "Error al crear la contratación",
      detalle: error.message,
    });
  }
};

const obtenerContrataciones = async (req, res) => {
  try {
    const contrataciones = await Contratacion.getAll();
    res.status(200).json(contrataciones);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener las contrataciones",
      detalle: error.message,
    });
  }
};

const obtenerContratacionPorDeportista = async (req, res) => {
  const { deportistaID } = req.params;
  try {
    const contrataciones = await Contratacion.getByDeportista(deportistaID);
    res.status(200).json(contrataciones);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener las contrataciones",
      detalle: error.message,
    });
  }
};

const obtenerContratacionPorDeportistaYEquipo = async (req, res) => {
  const { deportistaID, equipoID } = req.params;
  try {
    const contratacion = await Contratacion.getByDeportistaAndEquipo(
      deportistaID,
      equipoID
    );
    if (!contratacion)
      return res.status(404).json({ error: "Contratación no encontrada" });
    res.status(200).json(contratacion);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la contratación",
      detalle: error.message,
    });
  }
};

const actualizarContratacion = async (req, res) => {
  const { contratoID } = req.params;
  const camposActualizacion = req.body;

  const setClauses = [];
  const parametros = { contratoID: neo4j.int(contratoID) };

  for (const [clave, valor] of Object.entries(camposActualizacion)) {
    if (clave === "contratoID") continue;

    if (clave === "fecha_inicio" || clave === "fecha_fin") {
      parametros[clave] = neo4j.types.Date.fromStandardDate(new Date(valor));
    } else if (clave === "valor_contrato") {
      parametros[clave] = neo4j.int(valor);
    } else {
      parametros[clave] = valor;
    }

    setClauses.push(`c.${clave} = $${clave}`);
  }

  const setClause = setClauses.join(", ");

  try {
    const contratacionActualizada = await Contratacion.update(
      contratoID,
      setClause,
      parametros
    );
    if (!contratacionActualizada)
      return res.status(404).json({ error: "Contratación no encontrada" });
    res.status(200).json(contratacionActualizada);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar la contratación",
      detalle: error.message,
    });
  }
};

const eliminarContratacion = async (req, res) => {
  const { contratoID } = req.params;
  try {
    const resultado = await Contratacion.delete(contratoID);
    if (!resultado) {
      return res.status(404).json({ error: "Contratación no encontrada" });
    }
    res.status(200).json({ message: "Contratación eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar la contratación",
      detalle: error.message,
    });
  }
};

module.exports = {
  crearContratacion,
  obtenerContrataciones,
  obtenerContratacionPorDeportista,
  obtenerContratacionPorDeportistaYEquipo,
  actualizarContratacion,
  eliminarContratacion,
};
