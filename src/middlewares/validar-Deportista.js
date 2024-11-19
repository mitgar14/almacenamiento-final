const { driver } = require("../database/Neo4jConnection");
const neo4j = require("neo4j-driver");

const existeDeportistaPorID = async (id) => {
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (d:Deportista) WHERE id(d) = $id RETURN d",
      { id: neo4j.int(id) }
    );
    if (!result.records.length) {
      throw new Error(`El deportista con ID ${id} no existe`);
    }
  } finally {
    await session.close();
  }
};

const existeFechaApropiada = (fecha) => {
  // Verificar formato ISO8601
  const formatoISO = /^\d{4}-\d{2}-\d{2}$/;
  const esFormatoValido = formatoISO.test(fecha);

  if (!esFormatoValido) {
    throw new Error("La fecha debe tener formato YYYY-MM-DD");
  }

  const fechaActual = new Date();
  const fechaNacimiento = new Date(fecha);

  // Verificar si es una fecha válida
  if (isNaN(fechaNacimiento.getTime())) {
    throw new Error("La fecha proporcionada no es válida");
  }

  // Verificar si es fecha futura
  if (fechaNacimiento > fechaActual) {
    if (!esFormatoValido) {
      throw new Error(
        "La fecha debe tener formato YYYY-MM-DD y no puede ser futura"
      );
    }
    throw new Error("La fecha de nacimiento no puede ser futura");
  }

  return true;
};

const existeDorsalEnEquipo = async (dorsal, equipoID) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:Deportista)-[:JUEGA_EN]->(e:Equipo)
       WHERE id(e) = $equipoID AND d.dorsal = $dorsal
       RETURN d`,
      { 
        equipoID: neo4j.int(equipoID),
        dorsal: neo4j.int(dorsal)
      }
    );
    
    if (result.records.length > 0) {
      throw new Error(`El dorsal ${dorsal} ya está en uso en este equipo`);
    }
  } finally {
    await session.close();
  }
};

const noExistenContratacionesPorDeportista = async (id) => {
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (d:Deportista)-[:TIENE_CONTRATO]->(:Contrato) WHERE id(d) = $id RETURN COUNT(*) AS count",
      { id: neo4j.int(id) }
    );
    const count = result.records[0].get("count").toNumber();
    if (count > 0) {
      throw new Error(
        `No se puede eliminar el deportista con ID ${id} porque tiene ${count} contratacion(es) asociada(s)`
      );
    }
  } finally {
    await session.close();
  }
};

module.exports = {
  existeDeportistaPorID,
  existeFechaApropiada,
  existeDorsalEnEquipo,
  noExistenContratacionesPorDeportista,
};
