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
         RETURN contrato, e, id(e) as equipoID`,
        { deportistaID }
      );

      const equiposInfo = await Equipo.getAllWithRelations();

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

  // Obtener una contratación específica
  static async getByDeportistaAndEquipo(deportistaID, equipoID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaID AND id(e) = $equipoID
         RETURN d, c, e`,
        { deportistaID, equipoID }
      );
      const record = result.records[0];
      if (!record) return null;

      return {
        deportista: record.get("d").properties,
        equipo: record.get("e").properties,
        contrato: record.get("c").properties,
      };
    } finally {
      await session.close();
    }
  }

  // Obtener un resumen de las contrataciones de un deportista
  static async getResumenByDeportista(deportistaID) {
    const contratos = await this.getByDeportista(deportistaID);
    
    const todosLosContratos = [...contratos.activos, ...contratos.antiguos];
    const equiposInfo = todosLosContratos.map(contrato => {
      const esActivo = contratos.activos.some(
        c => c.equipo.nombre === contrato.equipo.nombre
      );
  
      const añoInicio = new Date(contrato.fecha_inicio).getFullYear();
      const añoFin = new Date(contrato.fecha_fin).getFullYear();
      
      const estado = esActivo 
        ? `Equipo actual (${añoInicio}-${añoFin})`
        : `Equipo antiguo (${añoInicio}-${añoFin})`;
  
      return {
        nombre: contrato.equipo.nombre,
        pais: contrato.equipo.pais,
        estado
      };
    });
  
    return {
      total_contratos: contratos.total_contratos,
      resumen: {
        ...contratos.resumen,
        equipos: equiposInfo
      }
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
          valor_contrato: neo4j.int(valor_contrato) 
        }
      );
  
      if (result.records.length === 0) {
        throw new Error("No se devolvieron registros al crear la contratación.");
      }
  
      const record = result.records[0];
  
      const contratoId = record.get('contratoId');
      const contratoProps = record.get('contrato').properties;
      const deportistaProps = record.get('d').properties;
      const equipoProps = record.get('e').properties;
  
      if (!contratoId) {
        throw new Error("No se pudo obtener el ID del contrato creado.");
      }
  
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
        }
      };
    } catch (error) {
      console.error("Error en Contratacion.create:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Actualizar una contratación
  static async update(
    deportistaID,
    equipoID,
    { fecha_inicio, fecha_fin, valor_contrato }
  ) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaID AND id(e) = $equipoID
         SET c.fecha_inicio = date($fecha_inicio),
             c.fecha_fin = date($fecha_fin),
             c.valor_contrato = $valor_contrato
         RETURN d, c, e`,
        { deportistaID, equipoID, fecha_inicio, fecha_fin, valor_contrato }
      );

      const record = result.records[0];
      return record
        ? {
            deportista: record.get("d").properties,
            equipo: record.get("e").properties,
            contrato: record.get("c").properties,
          }
        : null;
    } finally {
      await session.close();
    }
  }

  // Eliminar una contratación
  static async delete(deportistaID, equipoID) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaID AND id(e) = $equipoID
         DETACH DELETE c
         RETURN count(c) AS eliminado`,
        { deportistaID, equipoID }
      );
      return result.records[0].get("eliminado").toInt() > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = Contratacion;
