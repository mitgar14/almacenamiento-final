const { driver } = require("../database/Neo4jConnection");
const neo4j = require("neo4j-driver");

const existeContratacionPorID = async (id) => {
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (c:Contrato) WHERE id(c) = $id RETURN c",
      { id: neo4j.int(id) }
    );
    if (!result.records.length) {
      throw new Error(`La contratación con ID ${id} no existe`);
    }
  } finally {
    await session.close();
  }
};

// Validar existencia de contrataciones por ID de deportista
const existenContratacionesPorDeportista = async (deportistaID) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)
       WHERE id(d) = $deportistaID 
       RETURN c`,
      { deportistaID: neo4j.int(deportistaID) }
    );
    if (!result.records.length) {
      throw new Error(
        `No existen contrataciones para el deportista con ID ${deportistaID}`
      );
    }
  } finally {
    await session.close();
  }
};

// Validar existencia de contrataciones por ID de equipo
const existenContratacionesPorEquipo = async (equipoID) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
       WHERE id(e) = $equipoID 
       RETURN c`,
      { equipoID: neo4j.int(equipoID) }
    );
    if (!result.records.length) {
      throw new Error(
        `No existen contrataciones para el equipo con ID ${equipoID}`
      );
    }
  } finally {
    await session.close();
  }
};

module.exports = {
  existeContratacionPorID,
  existenContratacionesPorDeportista,
  existenContratacionesPorEquipo,
};
