const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Equipo {
    static async create({ nombre, pais, categoria, deporte }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (p:Pais {nombre: $pais}), (d:Deporte {nombre: $deporte})
                 CREATE (e:Equipo {nombre: $nombre, categoria: $categoria})-[:ES_DE]->(p)
                 CREATE (e)-[:PRACTICA]->(d)
                 RETURN e`,
                { nombre, pais, categoria, deporte }
            );
            return result.records[0].get('e').properties;
        } finally {
            await session.close();
        }
    }

    static async getAllWithRelations() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (e:Equipo)-[:ES_DE]->(p:Pais), (e)-[:PRACTICA]->(d:Deporte)
                 RETURN e, p.nombre AS pais, d.nombre AS deporte`
            );
            return result.records.map(record => ({
                ...record.get('e').properties,
                pais: record.get('pais'),
                deporte: record.get('deporte'),
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
                 RETURN e`,
                { pais }
            );
            return result.records.map(record => record.get('e').properties);
        } finally {
            await session.close();
        }
    }

    static async getByDeporte(deporte) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (e:Equipo)-[:PRACTICA]->(d:Deporte {nombre: $deporte})
                 RETURN e`,
                { deporte }
            );
            return result.records.map(record => record.get('e').properties);
        } finally {
            await session.close();
        }
    }

    static async update(id, { nombre, categoria }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (e:Equipo) WHERE id(e) = $id
                 SET e.nombre = $nombre, e.categoria = $categoria
                 RETURN e`,
                { id: neo4j.int(id), nombre, categoria }
            );
            return result.records.length ? result.records[0].get('e').properties : null;
        } finally {
            await session.close();
        }
    }

    static async delete(id) {
        const session = driver.session();
        try {
            await session.run(`MATCH (e:Equipo) WHERE id(e) = $id DETACH DELETE e`, { id: neo4j.int(id) });
            return true;
        } finally {
            await session.close();
        }
    }
}

module.exports = Equipo;
