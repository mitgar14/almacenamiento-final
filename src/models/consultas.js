const neo4j = require("neo4j-driver");
const driver = require("../database/Neo4jConnection").driver;
const formatDate = require("../helpers/date");

class Consultas {
  // Consulta 1: Deportistas con contratos a partir de una fecha específica
  static async deportistasConContratosDesde(fechaInput) {
    const session = driver.session();
    try {
      // Convertir y limpiar la entrada
      const fechaStr = fechaInput.toString().trim().replace(/['"]+/g, "");

      // Realizar la consulta
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE date(c.fecha_inicio) >= date($fecha)
         RETURN d, c, e
         ORDER BY c.fecha_inicio`,
        { fecha: fechaStr }
      );

      return result.records.map((record) => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber(),
        },
        contrato: {
          ...record.get("c").properties,
          fecha_inicio: formatDate(record.get("c").properties.fecha_inicio),
          fecha_fin: formatDate(record.get("c").properties.fecha_fin),
          valor_contrato: record.get("c").properties.valor_contrato.toNumber(),
        },
        equipo: record.get("e").properties,
      }));
    } catch (error) {
      throw new Error(`Error en la consulta: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  // Consulta 2: Deportistas masculinos en equipos de fútbol de España
  static async deportistasMasculinosEnEquiposFutbolEspana() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista {sexo: 'MASCULINO'})-[:JUEGA_EN]->(e:Equipo)-[:ES_DE]->(p:Pais {nombre: 'ESPAÑA'})
         MATCH (e)-[:PRACTICA]->(dep:Deporte {nombre: 'FUTBOL'})
         RETURN d, e, p`
      );
      return result.records.map((record) => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber()
        },
        equipo: record.get("e").properties,
        pais: record.get("p").properties,
      }));
    } finally {
      await session.close();
    }
  }

  // Consulta 3: Deportistas españoles en equipos españoles
  static async deportistasDeEspanaEnEquiposEspana() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:ES_DE]->(p1:Pais {nombre: 'ESPAÑA'})
         MATCH (d)-[:JUEGA_EN]->(e:Equipo)-[:ES_DE]->(p2:Pais {nombre: 'ESPAÑA'})
         RETURN d, e, p1 as p`
      );
      return result.records.map((record) => ({
        deportista: record.get("d").properties,
        equipo: record.get("e").properties,
        pais: record.get("p").properties,
      }));
    } finally {
      await session.close();
    }
  }

  // Consulta 4: Deportistas con contratos superiores a 1,000,000
  static async deportistasConContratosAltos() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE c.valor_contrato > 1000000
         RETURN d, c, e`
      );
      return result.records.map((record) => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber(),
        },
        contrato: {
          ...record.get("c").properties,
          fecha_inicio: formatDate(record.get("c").properties.fecha_inicio),
          fecha_fin: formatDate(record.get("c").properties.fecha_fin),
          valor_contrato: record.get("c").properties.valor_contrato.toNumber(),
        },
        equipo: record.get("e").properties,
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
        `MATCH (d:Deportista)-[:JUEGA_EN]->(e:Equipo)
         RETURN e.nombre AS equipo, count(d) AS cantidad`
      );
      return result.records.map((record) => ({
        equipo: record.get("equipo"),
        cantidad: record.get("cantidad").toInt(),
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
        `MATCH (d:Deportista)-[:JUEGA_EN]->(e:Equipo)
         WITH e, count(d) AS cantidad
         WHERE cantidad > 3
         RETURN e, cantidad`
      );
      return result.records.map((record) => ({
        equipo: record.get("e").properties,
        cantidad: record.get("cantidad").toInt(),
      }));
    } finally {
      await session.close();
    }
  }

  // Consulta adicional 2: Deportistas por cada deporte
  static async cantidadDeportistasPorDeporteMinimo1() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:JUEGA_EN]->(e:Equipo)-[:PRACTICA]->(dep:Deporte)
         WITH dep, count(d) AS cantidad
         WHERE cantidad >= 1
         RETURN dep.nombre AS deporte, cantidad`
      );
      return result.records.map((record) => ({
        deporte: record.get("deporte"),
        cantidad: record.get("cantidad").toInt(),
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
    const formattedDate = sixMonthsLater.toISOString().split("T")[0];

    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE c.fecha_fin <= $formattedDate
         RETURN d, c, e`,
        { formattedDate }
      );
      return result.records.map((record) => ({
        deportista: record.get("d").properties,
        contrato: record.get("c").properties,
        equipo: record.get("e").properties,
      }));
    } finally {
      await session.close();
    }
  }

  // Consulta adicional 4: Equipos con al menos un contrato activo
  static async equiposConContratosActivos() {
      const session = driver.session();
      const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      try {
          const result = await session.run(
              `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
               WHERE date(c.fecha_fin) >= date($currentDate)
               WITH e, COUNT(c) as contratosActivos
               RETURN e, contratosActivos
               ORDER BY contratosActivos DESC`,
              { currentDate }
          );
  
          return result.records.map(record => ({
              equipo: {
                  ...record.get('e').properties
              },
              contratosActivos: record.get('contratosActivos').toNumber()
          }));
  
      } catch (error) {
          console.error('Error en equiposConContratosActivos:', error);
          throw new Error(`Error al consultar equipos con contratos activos: ${error.message}`);
      } finally {
          await session.close();
      }
  }

  // Consulta adicional 5: Deportistas con contratos de duración superior a 3 años
  static async deportistasConContratosLargos() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE duration.between(date(c.fecha_inicio), date(c.fecha_fin)).years >= 3
         RETURN d, c, e`
      );
      return result.records.map((record) => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber(),
        },
        contrato: {
          ...record.get("c").properties,
          fecha_inicio: formatDate(record.get("c").properties.fecha_inicio),
          fecha_fin: formatDate(record.get("c").properties.fecha_fin),
          valor_contrato: record.get("c").properties.valor_contrato.toNumber(),
        },
        equipo: record.get("e").properties,
      }));
    } finally {
      await session.close();
    }
  }
}

module.exports = Consultas;
