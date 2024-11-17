const neo4j = require("neo4j-driver");
const { driver } = require("../database/Neo4jConnection");

class Ciudad {
  // Crear una nueva ciudad
  static async create({ nombre, paisID }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Pais) WHERE id(p) = $paisID
         CREATE (c:Ciudad {nombre: $nombre})-[:PERTENECE_A]->(p)
         RETURN c`,
        { nombre, paisID: neo4j.int(paisID) }
      );
      return result.records[0].get("c").properties;
    } finally {
      await session.close();
    }
  }

  // Obtener todas las ciudades con su país
  static async getAll() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Ciudad)-[:PERTENECE_A]->(p:Pais)
         RETURN c, p.nombre as pais`
      );
      return result.records.map(record => ({
        ...record.get("c").properties,
        pais: record.get("pais")
      }));
    } finally {
      await session.close();
    }
  }

  // Obtener ciudad por deportista
  static async getByDeportista(deportistaID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:NACE_EN]->(c:Ciudad)-[:PERTENECE_A]->(p:Pais)
         WHERE id(d) = $deportistaID
         RETURN c, p.nombre as pais`,
        { deportistaID }
      );
      if (!result.records.length) return null;
      
      const record = result.records[0];
      return {
        ...record.get("c").properties,
        pais: record.get("pais")
      };
    } finally {
      await session.close();
    }
  }

  // Obtener ciudad por ID
  static async getByID(ciudadID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Ciudad)-[:PERTENECE_A]->(p:Pais)
         WHERE id(c) = $ciudadID
         RETURN c, id(c) as id, p.nombre as pais`,
        { ciudadID: neo4j.int(ciudadID) }
      );
      if (!result.records.length) return null;
  
      const record = result.records[0];
      return {
        id: record.get('id').toNumber(),
        ...record.get("c").properties,
        pais: record.get("pais")
      };
    } finally {
      await session.close();
    }
  }

  // Obtener ciudad por nombre
  static async getByName(nombre) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Ciudad {nombre: $nombre})-[:PERTENECE_A]->(p:Pais)
         RETURN c, p.nombre as pais`,
        { nombre }
      );
      if (!result.records.length) return null;

      const record = result.records[0];
      return {
        ...record.get("c").properties,
        pais: record.get("pais")
      };
    } finally {
      await session.close();
    }
  }

  // Eliminar ciudad
  static async delete(nombre) {
    const session = driver.session();
    try {
      await session.run(
        `MATCH (c:Ciudad {nombre: $nombre}) 
         DETACH DELETE c`, 
        { nombre }
      );
    } finally {
      await session.close();
    }
  }
}

module.exports = Ciudad;