const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Ciudad {
    static async create({ nombre, pais, poblacion = 0, deportes = [] }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MERGE (c:Ciudad {nombre: $nombre, pais: $pais, poblacion: $poblacion, deportes: $deportes})
                 RETURN c`,
                { nombre, pais, poblacion, deportes }
            );
            return result.records[0].get('c').properties;
        } finally {
            await session.close();
        }
    }

    static async getAll() {
        const session = driver.session();
        try {
            const result = await session.run(`MATCH (c:Ciudad) RETURN c`);
            return result.records.map(record => record.get('c').properties);
        } finally {
            await session.close();
        }
    }

    static async getByName(nombre) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (c:Ciudad {nombre: $nombre}) RETURN c`,
                { nombre }
            );
            return result.records.length ? result.records[0].get('c').properties : null;
        } finally {
            await session.close();
        }
    }

    static async delete(nombre) {
        const session = driver.session();
        try {
            await session.run(
                `MATCH (c:Ciudad {nombre: $nombre}) DETACH DELETE c`,
                { nombre }
            );
        } finally {
            await session.close();
        }
    }
}

module.exports = Ciudad;
