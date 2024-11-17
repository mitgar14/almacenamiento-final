const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Pais {
    // Crear un nuevo país
    static async create({ nombre }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MERGE (p:Pais {nombre: $nombre})
                 RETURN p, id(p) as id`,
                { nombre }
            );
            const record = result.records[0];
            return {
                id: record.get('id').toNumber(),
                ...record.get('p').properties
            };
        } finally {
            await session.close();
        }
    }

    // Obtener todos los países
    static async getAll() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Pais)
                 RETURN p, id(p) as id`
            );
            return result.records.map(record => ({
                id: record.get('id').toNumber(),
                ...record.get('p').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Obtener un país por su nombre
    static async getByName(nombre) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Pais {nombre: $nombre})
                 RETURN p, id(p) as id`,
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

    // Obtener un país por su ID
    static async getByID(paisID) {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (p:Pais)
           WHERE id(p) = $paisID
           RETURN p, id(p) as id`,
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

    // Eliminar un país
    static async delete(nombre) {
        const session = driver.session();
        try {
            await session.run(
                `MATCH (p:Pais {nombre: $nombre})
                 DETACH DELETE p`,
                { nombre }
            );
        } finally {
            await session.close();
        }
    }
}

module.exports = Pais;