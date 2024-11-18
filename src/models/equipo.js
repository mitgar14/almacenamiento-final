const neo4j = require("neo4j-driver");
const driver = require("../database/Neo4jConnection").driver;

const Pais = require("./pais");

const standardizeString = require("../helpers/string");

class Equipo {
  // Obtener todos los equipos con sus relaciones
  static async getAllWithRelations() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo)-[:ES_DE]->(p:Pais)
           OPTIONAL MATCH (e)-[:PRACTICA]->(d:Deporte)
           OPTIONAL MATCH (e)<-[:JUEGA_EN]-(dep:Deportista)
           WITH e, p, d, collect(dep) as deportistas
           RETURN id(e) as id, e, p.nombre AS pais, 
                  COALESCE(d.nombre, "Sin deporte") AS deporte, 
                  size(deportistas) as num_deportistas`
      );
      return result.records.map((record) => ({
        id: record.get("id").toNumber(),
        ...record.get("e").properties,
        pais: record.get("pais"),
        deporte: record.get("deporte"),
        num_deportistas: record.get("num_deportistas").toNumber(),
      }));
    } finally {
      await session.close();
    }
  }

  // Obtener un equipo por su ID
  static async getByID(id) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo)
           WHERE id(e) = $id
           MATCH (e)-[:ES_DE]->(p:Pais)
           OPTIONAL MATCH (e)-[:PRACTICA]->(d:Deporte)
           RETURN e, p.nombre AS pais, COALESCE(d.nombre, "Sin deporte") AS deporte`,
        { id: neo4j.int(id) }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      return {
        id: record.get("e").identity.toNumber(),
        ...record.get("e").properties,
        pais: record.get("pais"),
        deporte: record.get("deporte"),
      };
    } catch (error) {
      console.error("Error en Equipo.getByID:", error);
      throw new Error("Error al obtener el equipo por ID.");
    } finally {
      await session.close();
    }
  }

  // Obtener los equipos con sus relaciones por pais
  static async getByPais(pais) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (e:Equipo)-[:ES_DE]->(p:Pais)
         WHERE toUpper(p.nombre) = toUpper($pais)
         MATCH (e)-[:PRACTICA]->(d:Deporte)
         RETURN e, d.nombre AS deporte, p.nombre AS paisNombre`,
        { pais }
      );
      return result.records.map((record) => ({
        ...record.get("e").properties,
        deporte: record.get("deporte"),
        pais: record.get("paisNombre"),
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

  // Crear un nuevo equipo
  static async create({ nombre, pais, deporte }) {
    const session = driver.session();
    try {
      // Estandarizar los campos
      const nombreEstandarizado = standardizeString(nombre);
      const paisEstandarizado = standardizeString(pais);
      const deporteEstandarizado = standardizeString(deporte);

      // Asegurar que el país exista, si no, crearlo
      let paisData = await Pais.getByName(paisEstandarizado);
      if (!paisData) {
        console.log(`El país "${paisEstandarizado}" no existe. Creándolo...`);
        paisData = await Pais.create({ nombre: paisEstandarizado });
        console.log(`País creado con ID: ${paisData.id}`);
      }

      // Verificar si el deporte existe
      const deporteData = await session.run(
        `MATCH (d:Deporte {nombre: $deporte})
         RETURN d`,
        { deporte: deporteEstandarizado }
      );

      if (deporteData.records.length === 0) {
        throw new Error(`Deporte "${deporteEstandarizado}" no encontrado.`);
      }

      const result = await session.run(
        `MATCH (p:Pais {nombre: $pais}), (d:Deporte {nombre: $deporte})
         CREATE (e:Equipo {nombre: $nombre})
         CREATE (e)-[:ES_DE]->(p)
         CREATE (e)-[:PRACTICA]->(d)
         RETURN e, id(e) AS equipoId, p.nombre AS pais, d.nombre AS deporte`,
        {
          nombre: nombreEstandarizado,
          pais: paisEstandarizado,
          deporte: deporteEstandarizado,
        }
      );

      if (result.records.length === 0) {
        throw new Error("No se devolvieron registros al crear el equipo.");
      }

      const record = result.records[0];
      const equipoId = record.get("equipoId");

      if (!equipoId) {
        throw new Error("No se pudo obtener el ID del equipo creado.");
      }

      console.log(`Equipo creado exitosamente con ID: ${equipoId.toNumber()}`);

      return {
        id: equipoId.toNumber(),
        ...record.get("e").properties,
        pais: record.get("pais"),
        deporte: record.get("deporte"),
      };
    } catch (error) {
      console.error("Error en Equipo.create:", error);
      throw {
        error: "Error al crear el equipo",
        detalle: error.message,
      };
    } finally {
      await session.close();
    }
  }

  static async update(id, { nombre }) {
    const session = driver.session();
    try {
      const nombreEstandarizado = standardizeString(nombre);

      const result = await session.run(
        `MATCH (e:Equipo) WHERE id(e) = $id
         SET e.nombre = $nombre
         RETURN e`,
        { id: neo4j.int(id), nombre: nombreEstandarizado }
      );

      const record = result.records[0];
      return record
        ? {
            ...record.get("e").properties,
            id: record.get("e").identity.toNumber(),
          }
        : null;
    } catch (error) {
      console.error("Error en Equipo.update:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async delete(id) {
    const session = driver.session();
    try {
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
