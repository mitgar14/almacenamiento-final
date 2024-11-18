// models/ciudad.js

const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Ciudad {
  // Obtener o crear una ciudad (para Deportistas)
  static async getOrCreateCiudad(ciudad, paisID) {
    if (typeof ciudad === "number" && ciudad > 0) {
      const ciudadData = await this.getByID(ciudad);
      if (!ciudadData) throw new Error("Ciudad no encontrada");
      return ciudadData.id;
    } else if (typeof ciudad === "string") {
      const ciudadName = standardizeString(ciudad);
      let ciudadData = await this.getByName(ciudadName);
      if (!ciudadData) {
        if (!paisID) throw new Error("País no válido para crear la ciudad");
        ciudadData = await this.create({ nombre: ciudadName, paisID });
      }
      return ciudadData.id;
    } else {
      throw new Error("Ciudad no válida");
    }
  }

  // Crear una nueva ciudad
  static async create({ nombre, paisID }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Pais) WHERE id(p) = $paisID
         CREATE (c:Ciudad {nombre: $nombre})-[:PERTENECE_A]->(p)
         RETURN c, id(c) AS ciudadId, p.nombre AS pais`,
        { 
          nombre, 
          paisID: neo4j.int(paisID) 
        }
      );

      console.log("Resultado de crear ciudad:", result);

      if (result.records.length === 0) {
        throw new Error("No se devolvieron registros al crear la ciudad.");
      }

      const record = result.records[0];

      const createdId = record.get('ciudadId');
      const createdCiudad = record.get('c').properties;
      const paisName = record.get('pais');

      if (!createdId) {
        throw new Error("No se pudo obtener el ID de la ciudad creada.");
      }

      return {
        id: createdId.toNumber(),
        ...createdCiudad,
        pais: paisName
      };
    } finally {
      await session.close();
    }
  }

  // Obtener ciudad por Deportista ID
  static async getByDeportista(deportistaID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:NACE_EN]->(c:Ciudad)-[:PERTENECE_A]->(p:Pais)
         WHERE id(d) = $deportistaID
         RETURN c, id(c) AS id, p.nombre AS pais`,
        { deportistaID: neo4j.int(deportistaID) }
      );

      if (!result.records.length) return null;

      const record = result.records[0];
      return {
        id: record.get('id').toNumber(),
        ...record.get('c').properties,
        pais: record.get('pais')
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
         RETURN c, id(c) AS id, p.nombre AS pais`,
        { ciudadID: neo4j.int(ciudadID) }
      );

      if (!result.records.length) return null;

      const record = result.records[0];
      return {
        id: record.get('id').toNumber(),
        ...record.get('c').properties,
        pais: record.get('pais')
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
         RETURN c, id(c) AS id, p.nombre AS pais`,
        { nombre }
      );

      if (!result.records.length) return null;

      const record = result.records[0];
      return {
        id: record.get('id').toNumber(),
        ...record.get('c').properties,
        pais: record.get('pais')
      };
    } finally {
      await session.close();
    }
  }
}

module.exports = Ciudad;