const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Pais {
    // Crear un nuevo país
    static async create({ nombre, poblacion, region }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MERGE (p:Pais {nombre: $nombre})
                 ON CREATE SET p.poblacion = $poblacion, p.region = $region
                 RETURN p`,
                { nombre, poblacion, region }
            );
            return result.records[0].get('p').properties;
        } finally {
            await session.close();
        }
    }

    // Obtener todos los países
    static async getAll() {
        const session = driver.session();
        try {
            const result = await session.run(`MATCH (p:Pais) RETURN p`);
            return result.records.map(record => record.get('p').properties);
        } finally {
            await session.close();
        }
    }

    // Obtener un país por su nombre
    static async getByName(nombre) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Pais {nombre: $nombre}) RETURN p`,
                { nombre }
            );
            return result.records.length ? result.records[0].get('p').properties : null;
        } finally {
            await session.close();
        }
    }
}

module.exports = Pais;
