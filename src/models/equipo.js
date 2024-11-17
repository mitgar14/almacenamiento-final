const neo4j = require("neo4j-driver");
const driver = require("../database/Neo4jConnection").driver;

class Equipo {
  static async create({ nombre, pais, deporte }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Pais {nombre: $pais}), (d:Deporte {nombre: $deporte})
                 CREATE (e:Equipo {nombre: $nombre})
                 CREATE (e)-[:ES_DE]->(p)
                 CREATE (e)-[:PRACTICA]->(d)
                 WITH e, p, d
                 RETURN e, p.nombre as pais, d.nombre as deporte`,
        { nombre, pais, deporte }
      );
      const record = result.records[0];
      return {
        ...record.get("e").properties,
        pais: record.get("pais"),
        deporte: record.get("deporte"),
      };
    } finally {
      await session.close();
    }
  }

  static async getAllWithRelations() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo)-[:ES_DE]->(p:Pais), 
                       (e)-[:PRACTICA]->(d:Deporte),
                       (e)<-[:JUEGA_EN]-(dep:Deportista)
                 WITH e, p, d, collect(dep) as deportistas
                 RETURN e, p.nombre AS pais, d.nombre AS deporte, 
                        size(deportistas) as num_deportistas`
      );
      return result.records.map((record) => ({
        ...record.get("e").properties,
        pais: record.get("pais"),
        deporte: record.get("deporte"),
        num_deportistas: record.get("num_deportistas").toNumber(),
      }));
    } finally {
      await session.close();
    }
  }

  static async getByPais(pais) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo)-[:ES_DE]->(p:Pais {nombre: $pais})
                 MATCH (e)-[:PRACTICA]->(d:Deporte)
                 RETURN e, d.nombre AS deporte`,
        { pais }
      );
      return result.records.map((record) => ({
        ...record.get("e").properties,
        deporte: record.get("deporte"),
        pais,
      }));
    } finally {
      await session.close();
    }
  }

  static async getByDeporte(deporte) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo)-[:PRACTICA]->(d:Deporte {nombre: $deporte})
                 MATCH (e)-[:ES_DE]->(p:Pais)
                 RETURN e, p.nombre AS pais`,
        { deporte }
      );
      return result.records.map((record) => ({
        ...record.get("e").properties,
        pais: record.get("pais"),
        deporte,
      }));
    } finally {
      await session.close();
    }
  }

  static async update(id, { nombre }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo) WHERE id(e) = $id
                 SET e.nombre = $nombre
                 WITH e
                 MATCH (e)-[:ES_DE]->(p:Pais), (e)-[:PRACTICA]->(d:Deporte)
                 RETURN e, p.nombre AS pais, d.nombre AS deporte`,
        { id: neo4j.int(id), nombre }
      );
      const record = result.records[0];
      return record
        ? {
            ...record.get("e").properties,
            pais: record.get("pais"),
            deporte: record.get("deporte"),
          }
        : null;
    } finally {
      await session.close();
    }
  }

  static async delete(id) {
    const session = driver.session();
    try {
      // Primero verificamos si hay contratos o jugadores asociados
      const result = await session.run(
        `MATCH (e:Equipo) WHERE id(e) = $id
                 OPTIONAL MATCH (e)<-[:JUEGA_EN]-(d:Deportista)
                 OPTIONAL MATCH (e)<-[:CONTRATO_CON]-(c:Contrato)
                 RETURN count(d) as deportistas, count(c) as contratos`,
        { id: neo4j.int(id) }
      );

      const deportistas = result.records[0].get("deportistas").toNumber();
      const contratos = result.records[0].get("contratos").toNumber();

      if (deportistas > 0 || contratos > 0) {
        throw new Error(
          "No se puede eliminar el equipo porque tiene deportistas o contratos asociados"
        );
      }

      await session.run(
        `MATCH (e:Equipo) WHERE id(e) = $id
                 DETACH DELETE e`,
        { id: neo4j.int(id) }
      );
      return true;
    } finally {
      await session.close();
    }
  }
}

module.exports = Equipo;
