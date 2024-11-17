const neo4j = require("neo4j-driver");
const { driver } = require("../database/Neo4jConnection");

class Deporte {
  static async create({ nombre, tipo }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `CREATE (d:Deporte {nombre: $nombre, tipo: $tipo}) RETURN d`,
        { nombre, tipo }
      );
      return result.records[0].get("d").properties;
    } finally {
      await session.close();
    }
  }

  static async getAll() {
    const session = driver.session();
    try {
      const result = await session.run(`MATCH (d:Deporte) RETURN d`);
      return result.records.map((record) => record.get("d").properties);
    } finally {
      await session.close();
    }
  }

  static async delete(nombre) {
    const session = driver.session();
    try {
      await session.run(`MATCH (d:Deporte {nombre: $nombre}) DETACH DELETE d`, {
        nombre,
      });
    } finally {
      await session.close();
    }
  }
}

module.exports = Deporte;
