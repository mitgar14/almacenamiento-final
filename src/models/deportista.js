const neo4j = require("neo4j-driver");
const { driver } = require("../database/Neo4jConnection");

const Pais = require("./pais");
const Ciudad = require("./ciudad");
const Contratacion = require("./contratacion");

const standardizeString = require("../helpers/string");

class Deportista {
  // Obtener todos los deportistas
  static async getAll() {
    const session = driver.session();
    try {
      const result = await session.run("MATCH (d:Deportista) RETURN d");

      const deportistas = await Promise.all(
        result.records.map(async (record) => {
          const props = record.get("d").properties;
          const deportistaID = record.get("d").identity.toNumber();

          const ciudad = await Ciudad.getByDeportista(deportistaID);
          const contratos = await Contratacion.getResumenByDeportista(
            deportistaID
          );

          return {
            id: deportistaID,
            ...props,
            dorsal: props.dorsal.toNumber(),
            ciudadNacimiento: ciudad,
            contratos,
          };
        })
      );

      return deportistas;
    } finally {
      await session.close();
    }
  }

  // Obtener un deportista por similitud de nombre
  static async getByName(nombre) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista) WHERE d.nombre CONTAINS $nombre RETURN d`,
        { nombre }
      );

      const deportistas = await Promise.all(
        result.records.map(async (record) => {
          const props = record.get("d").properties;
          const deportistaID = record.get("d").identity.toNumber();

          const ciudad = await Ciudad.getByDeportista(deportistaID);
          const contratos = await Contratacion.getResumenByDeportista(
            deportistaID
          );

          return {
            id: deportistaID,
            ...props,
            dorsal: props.dorsal.toNumber(),
            ciudadNacimiento: ciudad,
            contratos,
          };
        })
      );

      return deportistas;
    } finally {
      await session.close();
    }
  }

  // Obtener un deportista por su ID en Neo4j
  static async getByID(deportistaID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista) 
         WHERE id(d) = $deportistaID 
         RETURN d`,
        { deportistaID: neo4j.int(deportistaID) }
      );

      if (!result.records.length) return null;

      const record = result.records[0];
      const props = record.get("d").properties;
      const id = record.get("d").identity.toNumber();

      // Obtener información relacionada
      const ciudad = await Ciudad.getByDeportista(id);
      const contratos = await Contratacion.getResumenByDeportista(id);

      return {
        id,
        ...props,
        dorsal: props.dorsal.toNumber(),
        ciudadNacimiento: ciudad,
        contratos,
      };
    } finally {
      await session.close();
    }
  }

  // Crear un nuevo deportista
  static async create({
    nombre,
    dorsal,
    posicion,
    sexo,
    fecha_nacimiento,
    ciudad,
    pais,
  }) {
    const session = driver.session();
    try {
      let ciudadID;
      let paisID;

      // Estandarizar los campos
      nombre = standardizeString(nombre);
      posicion = standardizeString(posicion);
      sexo = standardizeString(sexo);

      // Procesar el país
      let paisData;
      if (typeof pais === "number" && pais > 0) {
        // Buscar país por ID
        paisData = await Pais.getByID(pais);
        if (!paisData) {
          throw new Error("País no encontrado");
        }
        paisID = paisData.id;
      } else if (typeof pais === "string") {
        // Estandarizar nombre del país
        const paisName = standardizeString(pais);
        paisData = await Pais.getByName(paisName);
        if (!paisData) {
          // País no encontrado, proceder a crearlo
          paisData = await Pais.create({ nombre: paisName });
        }
        paisID = paisData.id;
      } else {
        throw new Error("País no válido");
      }

      // Procesar la ciudad
      let ciudadData;
      if (typeof ciudad === "number" && ciudad > 0) {
        // Buscar ciudad por ID
        ciudadData = await Ciudad.getByID(ciudad);
        if (!ciudadData) {
          throw new Error("Ciudad no encontrada");
        }
        ciudadID = ciudadData.id;
      } else if (typeof ciudad === "string") {
        // Estandarizar nombre de la ciudad
        const ciudadName = standardizeString(ciudad);
        ciudadData = await Ciudad.getByName(ciudadName);
        if (!ciudadData) {
          // Ciudad no encontrada, proceder a crearla
          if (!paisID) {
            throw new Error("País no válido para crear la ciudad");
          }
          ciudadData = await Ciudad.create({ nombre: ciudadName, paisID });
        }
        ciudadID = ciudadData.id;
      } else {
        throw new Error("Ciudad no válida");
      }

      // Crear el deportista y sus relaciones
      const result = await session.run(
        `MATCH (c:Ciudad), (p:Pais)
           WHERE id(c) = $ciudadID AND id(p) = $paisID
           CREATE (d:Deportista {
             nombre: $nombre,
             dorsal: $dorsal,
             posicion: $posicion,
             sexo: $sexo
           })
           CREATE (d)-[:NACE_EN {fecha_nacimiento: date($fecha_nacimiento)}]->(c)
           CREATE (d)-[:ES_DE]->(p)
           RETURN d`,
        {
          nombre,
          dorsal: neo4j.int(dorsal),
          posicion,
          sexo,
          fecha_nacimiento,
          ciudadID: neo4j.int(ciudadID),
          paisID: neo4j.int(paisID),
        }
      );

      if (!result.records.length) {
        throw new Error("Error al crear el deportista");
      }

      const deportista = result.records[0].get("d").properties;
      deportista.dorsal = deportista.dorsal.toNumber();
      return deportista;
    } catch (error) {
      console.error("Error en Deportista.create:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Actualizar un deportista
  static async update(id, { nombre, dorsal, posicion, sexo }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista {id: $id})
                 SET d.nombre = $nombre, d.dorsal = $dorsal, d.posicion = $posicion, d.sexo = $sexo
                 RETURN d`,
        {
          id,
          nombre,
          dorsal: neo4j.int(dorsal),
          posicion,
          sexo,
        }
      );
      const record = result.records[0];
      return record ? record.get("d").properties : null;
    } finally {
      await session.close();
    }
  }

  // Eliminar un deportista
  static async delete(nombre) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista {nombre: $nombre}) DETACH DELETE d RETURN count(d) AS eliminado`,
        { nombre }
      );
      return result.records[0].get("eliminado").toInt() > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = Deportista;