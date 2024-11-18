const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

const standardizeString = require('../helpers/string');

class Pais {
  // Obtener o crear un país (para Deportistas)
  static async getOrCreatePais(pais) {
    if (typeof pais === "number" && pais > 0) {
      const paisData = await this.getByID(pais);
      if (!paisData) throw new Error("País no encontrado");
      return paisData.id;
    } else if (typeof pais === "string") {
      const paisName = standardizeString(pais);
      let paisData = await this.getByName(paisName);
      if (!paisData) {
        paisData = await this.create({ nombre: paisName });
      }
      return paisData.id;
    } else {
      throw new Error("País no válido");
    }
  }

  // Crear un nuevo país o retornar el existente
  static async create({ nombre }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MERGE (p:Pais {nombre: $nombre})
         RETURN p, id(p) AS paisId`,
        { nombre }
      );

      if (result.records.length === 0) {
        throw new Error("No se devolvieron registros al crear el país.");
      }

      const record = result.records[0];

      const createdId = record.get('paisId');
      const createdPais = record.get('p').properties;

      if (!createdId) {
        throw new Error("No se pudo obtener el ID del país creado.");
      }

      return {
        id: createdId.toNumber(),
        ...createdPais
      };
    } finally {
      await session.close();
    }
  }

  // Obtener país por ID
  static async getByID(paisID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Pais)
         WHERE id(p) = $paisID
         RETURN p, id(p) AS id`,
        { paisID: neo4j.int(paisID) }
      );

      if (!result.records.length) return null;

      const record = result.records[0];
      return {
        id: record.get('id').toNumber(),
        ...record.get('p').properties
      };
    } finally {
      await session.close();
    }
  }

  // Obtener país por nombre
  static async getByName(nombre) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Pais {nombre: $nombre})
         RETURN p, id(p) AS id`,
        { nombre }
      );

      if (!result.records.length) return null;

      const record = result.records[0];
      return {
        id: record.get('id').toNumber(),
        ...record.get('p').properties
      };
    } finally {
      await session.close();
    }
  }
}

module.exports = Pais;