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
         MATCH (e)-[:ES_DE]->(p:Pais)
         MATCH (e)-[:PRACTICA]->(dep:Deporte)
         WHERE date(c.fecha_inicio) >= date($fecha)
         RETURN d, c, e, p.nombre AS pais, dep.nombre AS deporte
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
        equipo: {
          ...record.get("e").properties,
          pais: record.get("pais"),
          deporte: record.get("deporte"),
        },
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
         RETURN d, e, p.nombre AS pais`
      );
      return result.records.map((record) => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber(),
        },
        equipo: {
          ...record.get("e").properties,
          pais: record.get("pais"),
        },
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
         MATCH (d)-[n:NACE_EN]->(c:Ciudad)-[:PERTENECE_A]->(p3:Pais)
         RETURN d, e, p1 as p, c, p3.nombre AS ciudadPais`
      );
      return result.records.map((record) => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber(),
          ciudad_nacimiento: {
            ...record.get("c").properties,
            pais: record.get("ciudadPais"),
          },
        },
        equipo: {
          ...record.get("e").properties,
          pais: record.get("p").properties.nombre,
        },
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
         MATCH (e)-[:ES_DE]->(p:Pais)
         MATCH (e)-[:PRACTICA]->(dep:Deporte)
         WHERE c.valor_contrato > 1000000
         RETURN d, c, e, p.nombre AS pais, dep.nombre AS deporte`
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
        equipo: {
          ...record.get("e").properties,
          pais: record.get("pais"),
          deporte: record.get("deporte"),
        },
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
         RETURN e.nombre AS equipo, 
                count(d) AS cantidad,
                collect(d.nombre) AS jugadores`
      );
      return result.records.map((record) => ({
        equipo: record.get("equipo"),
        cantidad: record.get("cantidad").toInt(),
        jugadores: record.get("jugadores"),
      }));
    } finally {
      await session.close();
    }
  }

  // Consulta adicional 1: Nacionalidad de deportistas por equipo
  static async nacionalidadDeportistasPorEquipo() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:ES_DE]->(p:Pais)
         MATCH (d)-[:JUEGA_EN]->(e:Equipo)-[:ES_DE]->(pe:Pais)
         MATCH (e)-[:PRACTICA]->(dep:Deporte)
         RETURN p.nombre AS nacionalidad, count(d) AS cantidad, collect({
            nombre: d.nombre,
            equipo: e.nombre,
            deporte: dep.nombre,
            pais: pe.nombre
         }) AS jugadores
         ORDER BY p.nombre`
      );
      return result.records.map((record) => {
        const jugadoresArray = record.get("jugadores");
        const jugadoresObj = {};
        jugadoresArray.forEach((jugador) => {
          jugadoresObj[jugador.nombre] = {
            equipo: jugador.equipo,
            deporte: jugador.deporte,
            pais: jugador.pais,
          };
        });
        return {
          nacionalidad: record.get("nacionalidad"),
          cantidad: record.get("cantidad").toInt(),
          jugadores: jugadoresObj,
        };
      });
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

  // Consulta adicional 3: Contratos terminando en 6 meses
  static async contratosTerminandoEn6Meses() {
    const session = driver.session();
    const currentDate = new Date().toISOString().split("T")[0];
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const sixMonthsDate = sixMonthsLater.toISOString().split("T")[0];

    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         MATCH (e)-[:ES_DE]->(p:Pais)
         MATCH (e)-[:PRACTICA]->(dep:Deporte)
         WHERE date(c.fecha_fin) >= date($currentDate) AND date(c.fecha_fin) <= date($sixMonthsDate)
         RETURN d, c, e, p.nombre AS pais, dep.nombre AS deporte`,
        { currentDate, sixMonthsDate }
      );
      return result.records.map((record) => {
        const fechaFin = new Date(record.get("c").properties.fecha_fin);
        const today = new Date();

        let months = fechaFin.getMonth() - today.getMonth();
        let days = fechaFin.getDate() - today.getDate();

        if (days < 0) {
          months -= 1;
          const lastDayOfPreviousMonth = new Date(
            fechaFin.getFullYear(),
            fechaFin.getMonth(),
            0
          ).getDate();
          days += lastDayOfPreviousMonth;
        }
        if (months < 0) {
          months += 12;
        }

        const leFaltan = `${months} mes${
          months !== 1 ? "es" : ""
        }, ${days} día${days !== 1 ? "s" : ""}`;

        return {
          deportista: {
            ...record.get("d").properties,
            dorsal: record.get("d").properties.dorsal.toNumber(),
          },
          contrato: {
            ...record.get("c").properties,
            fecha_inicio: formatDate(record.get("c").properties.fecha_inicio),
            fecha_fin: formatDate(record.get("c").properties.fecha_fin),
            valor_contrato: record
              .get("c")
              .properties.valor_contrato.toNumber(),
            leFaltan,
          },
          equipo: {
            ...record.get("e").properties,
            pais: record.get("pais"),
            deporte: record.get("deporte"),
          },
        };
      });
    } finally {
      await session.close();
    }
  }

  // Consulta adicional 4: Equipos con al menos un contrato activo
  static async equiposConContratosActivos() {
    const session = driver.session();
    const currentDate = new Date().toISOString().split("T")[0];

    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE date(c.fecha_fin) >= date($currentDate)
         MATCH (d)-[:ES_DE]->(p:Pais)
         RETURN e, COUNT(c) as contratosActivos, collect({
           nombre: d.nombre,
           pais: p.nombre,
           posicion: d.posicion
         }) AS jugadores
         ORDER BY contratosActivos DESC`,
        { currentDate }
      );

      return result.records.map((record) => ({
        equipo: {
          ...record.get("e").properties,
        },
        contratosActivos: record.get("contratosActivos").toNumber(),
        jugadores: record.get("jugadores"),
      }));
    } catch (error) {
      console.error("Error en equiposConContratosActivos:", error);
      throw new Error(
        `Error al consultar equipos con contratos activos: ${error.message}`
      );
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
         MATCH (e)-[:ES_DE]->(p:Pais)
         WHERE duration.between(date(c.fecha_inicio), date(c.fecha_fin)).years >= 3
         RETURN d, c, e, p.nombre AS pais`
      );

      return result.records.map((record) => {
        const fechaFin = new Date(record.get("c").properties.fecha_fin);
        const today = new Date();

        let years = fechaFin.getFullYear() - today.getFullYear();
        let months = fechaFin.getMonth() - today.getMonth();
        let days = fechaFin.getDate() - today.getDate();

        if (days < 0) {
          months -= 1;
          const lastDayOfPreviousMonth = new Date(
            fechaFin.getFullYear(),
            fechaFin.getMonth(),
            0
          ).getDate();
          days += lastDayOfPreviousMonth;
        }
        if (months < 0) {
          years -= 1;
          months += 12;
        }

        let leFaltan;

        if (years < 0 || months < 0 || days < 0) {
          leFaltan = "Contrato terminado";
        } else {
          leFaltan = `${years} año${years !== 1 ? "s" : ""}, ${months} mes${
            months !== 1 ? "es" : ""
          }, ${days} día${days !== 1 ? "s" : ""}`;
        }

        return {
          deportista: {
            ...record.get("d").properties,
            dorsal: record.get("d").properties.dorsal.toNumber(),
          },
          contrato: {
            ...record.get("c").properties,
            fecha_inicio: formatDate(record.get("c").properties.fecha_inicio),
            fecha_fin: formatDate(record.get("c").properties.fecha_fin),
            valor_contrato: record
              .get("c")
              .properties.valor_contrato.toNumber(),
            leFaltan,
          },
          equipo: {
            ...record.get("e").properties,
            pais: record.get("pais"),
          },
        };
      });
    } catch (error) {
      console.error("Error en deportistasConContratosLargos:", error);
      throw new Error(`Error al realizar la consulta: ${error.message}`);
    } finally {
      await session.close();
    }
  }
}

module.exports = Consultas;
