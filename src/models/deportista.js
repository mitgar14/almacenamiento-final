const neo4j = require("neo4j-driver");
const { driver } = require("../database/Neo4jConnection");
const { RelacionesDeportistas } = require("../services/relaciones");

class Deportista {
  // Obtener todos los deportistas
  static async getAll() {
    const session = driver.session();
    try {
      const result = await session.run("MATCH (d:Deportista) RETURN d");

      const deportistas = await Promise.all(
        result.records.map(async (record) => {
          const props = record.get("d").properties;
          const deportistaId = record.get("d").identity.toNumber();

          const relaciones = await RelacionesDeportistas.getCiudadYContratosParaDeportistas(deportistaId);

          return {
            id: deportistaId,
            ...props,
            dorsal: props.dorsal.toNumber(),
            ...relaciones,
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
      return result.records.map((record) => {
        const props = record.get("d").properties;
        props.dorsal = props.dorsal.toNumber();
        return props;
      });
    } finally {
      await session.close();
    }
  }

  static async create({ nombre, dorsal, posicion, sexo }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `CREATE (d:Deportista {nombre: $nombre, dorsal: $dorsal, posicion: $posicion, sexo: $sexo})
                 RETURN d`,
        {
          nombre,
          dorsal: neo4j.int(dorsal),
          posicion,
          sexo,
        }
      );
      const deportista = result.records[0].get("d").properties;
      deportista.dorsal = deportista.dorsal.toNumber();
      return deportista;
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
