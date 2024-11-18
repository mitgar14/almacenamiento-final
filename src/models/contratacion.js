const neo4j = require("neo4j-driver");
const driver = require("../database/Neo4jConnection").driver;
const Equipo = require("../models/equipo");
const formatDate = require("../helpers/date");

class Contratacion {
  // Obtener todas las contrataciones
  static async getAll() {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
           RETURN d, c, e, id(e) as equipoID, id(c) as contratoID`
      );

      const equiposInfo = await Equipo.getAllWithRelations();

      return result.records.map((record) => {
        const deportista = record.get("d").properties;
        const equipoID = record.get("equipoID").toNumber();
        const equipoBasico = record.get("e").properties;
        const contrato = record.get("c").properties;
        const contratoID = record.get("contratoID").toNumber();

        const equipoCompleto = equiposInfo.find((e) => e.id === equipoID);
        const { id, ...equipoSinID } = equipoCompleto || equipoBasico;

        return {
          deportista: {
            ...deportista,
            dorsal: deportista.dorsal.toNumber(),
          },
          equipo: equipoSinID,
          contrato: {
            id: contratoID,
            fecha_inicio: formatDate(contrato.fecha_inicio),
            fecha_fin: formatDate(contrato.fecha_fin),
            valor_contrato: contrato.valor_contrato.toNumber(),
          },
        };
      });
    } finally {
      await session.close();
    }
  }

  // Obtener todas las contrataciones de un deportista
  static async getByDeportista(deportistaID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(contrato:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaID
         RETURN d, contrato, e, id(e) as equipoID`,
        { deportistaID: neo4j.int(deportistaID) }
      );
  
      const equiposInfo = await Equipo.getAllWithRelations();
  
      const deportistaInfo = result.records.length > 0 ? {
        ...result.records[0].get("d").properties,
        dorsal: result.records[0].get("d").properties.dorsal.toNumber(),
      } : null;
  
      const contratos = result.records.map((record) => {
        const contratoProps = record.get("contrato").properties;
        const equipoID = record.get("equipoID").toNumber();
        const equipoBasico = record.get("e").properties;
  
        const equipoCompleto = equiposInfo.find((e) => e.id === equipoID);
  
        const { id, ...equipoSinID } = equipoCompleto || equipoBasico;
  
        return {
          fecha_inicio: formatDate(contratoProps.fecha_inicio),
          fecha_fin: formatDate(contratoProps.fecha_fin),
          valor_contrato: contratoProps.valor_contrato.toNumber(),
          equipo: equipoSinID,
        };
      });
  
      const fechaActual = new Date();
      const activos = contratos.filter(
        (c) => new Date(c.fecha_fin) > fechaActual
      );
      const antiguos = contratos.filter(
        (c) => new Date(c.fecha_fin) <= fechaActual
      );
  
      return {
        deportista: deportistaInfo,
        total_contratos: contratos.length,
        resumen: {
          activos: activos.length,
          antiguos: antiguos.length,
        },
        activos,
        antiguos,
      };
    } finally {
      await session.close();
    }
  }

  // Obtener las contrataciones de un equipo
  static async getByEquipo(equipoID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(e) = $equipoID
         MATCH (d)-[:ES_DE]->(p:Pais)
         MATCH (e)-[:ES_DE]->(pe:Pais)
         MATCH (e)-[:PRACTICA]->(dep:Deporte)
         RETURN d, c, e, p.nombre as paisDeportista, pe.nombre as paisEquipo, dep.nombre as deporte`,
        { equipoID: neo4j.int(equipoID) }
      );
  
      if (!result.records.length) return [];
  
      return result.records.map(record => ({
        deportista: {
          ...record.get("d").properties,
          dorsal: record.get("d").properties.dorsal.toNumber(),
          pais: record.get("paisDeportista")
        },
        contrato: {
          ...record.get("c").properties,
          fecha_inicio: formatDate(record.get("c").properties.fecha_inicio),
          fecha_fin: formatDate(record.get("c").properties.fecha_fin),
          valor_contrato: record.get("c").properties.valor_contrato.toNumber()
        },
        equipo: {
          ...record.get("e").properties,
          pais: record.get("paisEquipo"),
          deporte: record.get("deporte")
        }
      }));
    } finally {
      await session.close();
    }
  }

  // Obtener un resumen de las contrataciones de un deportista
  static async getResumenByDeportista(deportistaID) {
    const contratos = await this.getByDeportista(deportistaID);

    const todosLosContratos = [...contratos.activos, ...contratos.antiguos];
    const equiposInfo = todosLosContratos.map((contrato) => {
      const esActivo = contratos.activos.some(
        (c) => c.equipo.nombre === contrato.equipo.nombre
      );

      const añoInicio = new Date(contrato.fecha_inicio).getFullYear();
      const añoFin = new Date(contrato.fecha_fin).getFullYear();

      const estado = esActivo
        ? `Equipo actual (${añoInicio}-${añoFin})`
        : `Equipo antiguo (${añoInicio}-${añoFin})`;

      return {
        nombre: contrato.equipo.nombre,
        pais: contrato.equipo.pais,
        estado,
      };
    });

    return {
      total_contratos: contratos.total_contratos,
      resumen: {
        ...contratos.resumen,
        equipos: equiposInfo,
      },
    };
  }

  // Crear una nueva contratación
  static async create({
    fecha_inicio,
    fecha_fin,
    valor_contrato,
    deportistaID,
    equipoID,
  }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista), (e:Equipo) 
         WHERE id(d) = $deportistaID AND id(e) = $equipoID
         CREATE (contrato:Contrato {
           fecha_inicio: date($fecha_inicio),
           fecha_fin: date($fecha_fin),
           valor_contrato: $valor_contrato
         })
         CREATE (d)-[:TIENE_CONTRATO]->(contrato)
         CREATE (contrato)-[:CONTRATO_CON]->(e)
         CREATE (d)-[:JUEGA_EN]->(e)
         RETURN d, contrato, e, id(contrato) AS contratoId`,
        {
          deportistaID: neo4j.int(deportistaID),
          equipoID: neo4j.int(equipoID),
          fecha_inicio,
          fecha_fin,
          valor_contrato: neo4j.int(valor_contrato),
        }
      );

      if (result.records.length === 0) {
        throw new Error(
          "No se devolvieron registros al crear la contratación."
        );
      }

      const record = result.records[0];

      const contratoId = record.get("contratoId");
      const contratoProps = record.get("contrato").properties;
      const deportistaProps = record.get("d").properties;
      const equipoProps = record.get("e").properties;

      return {
        id: contratoId.toNumber(),
        deportista: {
          ...deportistaProps,
          dorsal: deportistaProps.dorsal.toNumber(),
        },
        equipo: equipoProps,
        contrato: {
          id: contratoId.toNumber(),
          fecha_inicio: formatDate(contratoProps.fecha_inicio),
          fecha_fin: formatDate(contratoProps.fecha_fin),
          valor_contrato: contratoProps.valor_contrato.toNumber(),
        },
      };
    } catch (error) {
      console.error("Error en Contratacion.create:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Actualizar una contratación
  static async update(contratoID, setClause, parametros) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Contrato)
             WHERE id(c) = $contratoID
             SET ${setClause}
             RETURN c`,
        { contratoID: neo4j.int(contratoID), ...parametros }
      );
  
      const record = result.records[0];
      if (!record) return null;
  
      const properties = record.get("c").properties;
  
      return {
        contrato: {
          ...properties,
          fecha_inicio: formatDate(properties.fecha_inicio),
          fecha_fin: formatDate(properties.fecha_fin), 
          valor_contrato: properties.valor_contrato.toNumber()
        }
      };
    } finally {
      await session.close();
    }
  }

  // Eliminar una contratación por su ID
  static async delete(contratoID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Contrato) 
         WHERE id(c) = $contratoID
         DETACH DELETE c
         RETURN count(c) AS eliminado`,
        { contratoID: neo4j.int(contratoID) }
      );
      return result.records[0].get("eliminado").toInt() > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = Contratacion;
