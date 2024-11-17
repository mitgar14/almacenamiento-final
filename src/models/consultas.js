const neo4j = require('neo4j-driver');
const driver = require('../database/Neo4jConnection').driver;

class Consultas {
    // Consulta 1: Deportistas con contratos a partir de una fecha específica
    static async deportistasConContratosDesde(fecha) {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[c:CONTRATADO]->(e:Equipo)
                 WHERE c.fecha_contratacion >= $fecha
                 RETURN d, c, e`,
                { fecha }
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                contrato: record.get('c').properties,
                equipo: record.get('e').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta 2: Deportistas masculinos en equipos de fútbol de España
    static async deportistasMasculinosEnEquiposFutbolEspana() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista {sexo: 'Masculino'})-[:PERTENECE_A]->(e:Equipo)-[:ES_DE]->(p:Pais {nombre: 'España'})
                 WHERE e.deporte = 'Fútbol'
                 RETURN d, e, p`
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                equipo: record.get('e').properties,
                pais: record.get('p').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta 3: Deportistas de España en equipos de España
    static async deportistasDeEspanaEnEquiposEspana() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista {nacionalidad: 'España'})-[:PERTENECE_A]->(e:Equipo)-[:ES_DE]->(p:Pais {nombre: 'España'})
                 RETURN d, e, p`
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                equipo: record.get('e').properties,
                pais: record.get('p').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta 4: Deportistas con contratos superiores a USD 1,000,000
    static async deportistasConContratosAltos() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[c:CONTRATADO]->(e:Equipo)
                 WHERE c.valor > 1000000
                 RETURN d, c, e`
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                contrato: record.get('c').properties,
                equipo: record.get('e').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta 5: Cantidad de deportistas por equipo
    static async cantidadDeportistasPorEquipo() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[:PERTENECE_A]->(e:Equipo)
                 RETURN e.nombre AS equipo, count(d) AS cantidad`
            );
            return result.records.map(record => ({
                equipo: record.get('equipo'),
                cantidad: record.get('cantidad').toInt()
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta adicional 1: Equipos con más de 3 deportistas
    static async equiposConMasDe3Deportistas() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[:PERTENECE_A]->(e:Equipo)
                 WITH e, count(d) AS cantidad
                 WHERE cantidad > 3
                 RETURN e, cantidad`
            );
            return result.records.map(record => ({
                equipo: record.get('e').properties,
                cantidad: record.get('cantidad').toInt()
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta adicional 2: Deportistas por cada deporte, mínimo 1 deportista por deporte
    static async cantidadDeportistasPorDeporteMinimo1() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[:PERTENECE_A]->(e:Equipo)-[:PRACTICA]->(dep:Deporte)
                 WITH dep, count(d) AS cantidad
                 WHERE cantidad >= 1
                 RETURN dep.nombre AS deporte, cantidad`
            );
            return result.records.map(record => ({
                deporte: record.get('deporte'),
                cantidad: record.get('cantidad').toInt()
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta adicional 3: Contratos que terminan en los próximos 6 meses
    static async contratosTerminandoEn6Meses() {
        const session = driver.session();
        const currentDate = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(currentDate.getMonth() + 6);
        const formattedDate = sixMonthsLater.toISOString().split('T')[0];
        
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[c:CONTRATADO]->(e:Equipo)
                 WHERE c.fecha_finalizacion <= $formattedDate
                 RETURN d, c, e`,
                { formattedDate }
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                contrato: record.get('c').properties,
                equipo: record.get('e').properties
            }));
        } finally {
            await session.close();
        }
    }

    // Consulta adicional 4: Equipos con al menos un contrato activo
    static async equiposConContratosActivos() {
        const session = driver.session();
        const currentDate = new Date().toISOString().split('T')[0];
        
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[c:CONTRATADO]->(e:Equipo)
                 WHERE c.fecha_finalizacion >= $currentDate
                 RETURN e, count(c) AS contratosActivos`,
                { currentDate }
            );
            return result.records.map(record => ({
                equipo: record.get('e').properties,
                contratosActivos: record.get('contratosActivos').toInt()
            }));
        } finally {
            await session.close();
        }
    }

    // Nueva Consulta adicional 5: Deportistas con contratos de duración superior a 3 años
    static async deportistasConContratosLargos() {
        const session = driver.session();
        try {
            const result = await session.run(
                `MATCH (d:Deportista)-[c:CONTRATADO]->(e:Equipo)
                 WHERE datetime(c.fecha_finalizacion).year - datetime(c.fecha_contratacion).year >= 3
                 RETURN d, c, e`
            );
            return result.records.map(record => ({
                deportista: record.get('d').properties,
                contrato: record.get('c').properties,
                equipo: record.get('e').properties
            }));
        } finally {
            await session.close();
        }
    }
}

module.exports = Consultas;
