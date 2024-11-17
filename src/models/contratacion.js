const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Contratacion {
    // Crear una nueva contratación
    static async create({ fecha_inicio, fecha_fin, valor_contrato, deportistaId, equipoId }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista {id: $deportistaId}), (e:Equipo {id: $equipoId})
                 CREATE (d)-[:CONTRATADO {fecha_inicio: $fecha_inicio, fecha_fin: $fecha_fin, valor_contrato: $valor_contrato}]->(e)
                 RETURN d, e`,
                { fecha_inicio, fecha_fin, valor_contrato, deportistaId, equipoId }
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                equipo: record.get('e').properties,
                contratacion: { fecha_inicio, fecha_fin, valor_contrato }
            }));
        } finally {
            await session.close();
        }
    }

    // Obtener todas las contrataciones
    static async getAll() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[c:CONTRATADO]->(e:Equipo)
                 RETURN d, c, e`
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                equipo: record.get('e').properties,
                contratacion: record.get('c').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Obtener una contratación específica entre un deportista y un equipo
    static async getByDeportistaAndEquipo(deportistaId, equipoId) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista {id: $deportistaId})-[c:CONTRATADO]->(e:Equipo {id: $equipoId})
                 RETURN d, c, e`,
                { deportistaId, equipoId }
            );
            const record = result.records[0];
            if (!record) return null;
            return {
                deportista: record.get('d').properties,
                equipo: record.get('e').properties,
                contratacion: record.get('c').properties
            };
        } finally {
            await session.close();
        }
    }

    // Actualizar una contratación
    static async update(deportistaId, equipoId, { fecha_inicio, fecha_fin, valor_contrato }) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista {id: $deportistaId})-[c:CONTRATADO]->(e:Equipo {id: $equipoId})
                 SET c.fecha_inicio = $fecha_inicio, c.fecha_fin = $fecha_fin, c.valor_contrato = $valor_contrato
                 RETURN d, c, e`,
                { deportistaId, equipoId, fecha_inicio, fecha_fin, valor_contrato }
            );
            const record = result.records[0];
            return record ? {
                deportista: record.get('d').properties,
                equipo: record.get('e').properties,
                contratacion: record.get('c').properties
            } : null;
        } finally {
            await session.close();
        }
    }

    // Eliminar una contratación
    static async delete(deportistaId, equipoId) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista {id: $deportistaId})-[c:CONTRATADO]->(e:Equipo {id: $equipoId})
                 DELETE c
                 RETURN count(c) AS eliminado`,
                { deportistaId, equipoId }
            );
            return result.records[0].get('eliminado').toInt() > 0;
        } finally {
            await session.close();
        }
    }
}

module.exports = Contratacion;
