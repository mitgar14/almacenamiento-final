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

  // Obtener deportistas por nombre estandarizado
  static async getByName(nombre) {
    const session = driver.session();
    try {
      const nombreEstandarizado = standardizeString(nombre);

      const result = await session.run(
        `MATCH (d:Deportista) 
           WHERE toLower(d.nombre) CONTAINS toLower($nombre) 
           RETURN d`,
        { nombre: nombreEstandarizado }
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
  static async create(datos) {
    const session = driver.session();
    try {
      // Estandarizar los campos
      datos.nombre = standardizeString(datos.nombre);
      datos.posicion = standardizeString(datos.posicion);
      datos.sexo = standardizeString(datos.sexo);

      // Procesar el país y la ciudad
      const paisID = await Pais.getOrCreatePais(datos.pais);
      const ciudadID = await Ciudad.getOrCreateCiudad(datos.ciudad, paisID);

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

  // Actualizar un deportista con campos opcionales proporcionados desde el controlador
  static async update(id, setClause, parametros) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista) 
         WHERE id(d) = $id 
         SET ${setClause} 
         RETURN d`,
        parametros
      );

      const record = result.records[0];
      if (!record) return null;

      const deportista = record.get("d").properties;

      if (deportista.dorsal) {
        deportista.dorsal = deportista.dorsal.toNumber();
      }

      return deportista;
    } finally {
      await session.close();
    }
  }

  // Eliminar un deportista
  static async delete(id) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista) 
         WHERE id(d) = $id 
         DETACH DELETE d 
         RETURN count(d) AS eliminado`,
        { id: neo4j.int(id) }
      );
      return result.records[0].get("eliminado").toInt() > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = Deportista;