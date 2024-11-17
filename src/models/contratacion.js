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
           RETURN d, c, e, id(e) as equipoId, id(c) as contratoId`
        );
    
        const equiposInfo = await Equipo.getAllWithRelations();
    
        return result.records.map((record) => {
          const deportista = record.get("d").properties;
          const equipoId = record.get("equipoId").toNumber();
          const equipoBasico = record.get("e").properties;
          const contrato = record.get("c").properties;
          const contratoId = record.get("contratoId").toNumber();
    
          const equipoCompleto = equiposInfo.find(e => e.id === equipoId);
          const { id, ...equipoSinId } = equipoCompleto || equipoBasico;
    
          return {
            deportista: {
              ...deportista,
              dorsal: deportista.dorsal.toNumber(),
            },
            equipo: equipoSinId,
            contrato: {
              id: contratoId,
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
  static async getByDeportista(deportistaId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(contrato:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaId
         RETURN contrato, e, id(e) as equipoId`,
        { deportistaId }
      );
  
      const equiposInfo = await Equipo.getAllWithRelations();
  
      const contratos = result.records.map((record) => {
        const contratoProps = record.get("contrato").properties;
        const equipoId = record.get("equipoId").toNumber();
        const equipoBasico = record.get("e").properties;
        
        const equipoCompleto = equiposInfo.find(e => e.id === equipoId);
        
        const { id, ...equipoSinId } = equipoCompleto || equipoBasico;
  
        return {
          fecha_inicio: formatDate(contratoProps.fecha_inicio),
          fecha_fin: formatDate(contratoProps.fecha_fin),
          valor_contrato: contratoProps.valor_contrato.toNumber(),
          equipo: equipoSinId
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
          antiguos: antiguos.length
        },
        activos,
        antiguos
      };
  
    } finally {
      await session.close();
    }
  }

  // Obtener una contratación específica
  static async getByDeportistaAndEquipo(deportistaId, equipoId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaId AND id(e) = $equipoId
         RETURN d, c, e`,
        { deportistaId, equipoId }
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

  // Crear una nueva contratación
  static async create({
    fecha_inicio,
    fecha_fin,
    valor_contrato,
    deportistaId,
    equipoId,
  }) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista), (e:Equipo) 
         WHERE id(d) = $deportistaId AND id(e) = $equipoId
         CREATE (contrato:Contrato {
           fecha_inicio: date($fecha_inicio),
           fecha_fin: date($fecha_fin),
           valor_contrato: $valor_contrato
         })
         CREATE (d)-[:TIENE_CONTRATO]->(contrato)
         CREATE (contrato)-[:CONTRATO_CON]->(e)
         RETURN d, contrato, e`,
        { deportistaId, equipoId, fecha_inicio, fecha_fin, valor_contrato }
      );

      const record = result.records[0];
      return {
        deportista: record.get("d").properties,
        equipo: record.get("e").properties,
        contrato: record.get("contrato").properties,
      };
    } finally {
      await session.close();
    }
  }

  // Actualizar una contratación
  static async update(
    deportistaId,
    equipoId,
    { fecha_inicio, fecha_fin, valor_contrato }
  ) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaId AND id(e) = $equipoId
         SET c.fecha_inicio = date($fecha_inicio),
             c.fecha_fin = date($fecha_fin),
             c.valor_contrato = $valor_contrato
         RETURN d, c, e`,
        { deportistaId, equipoId, fecha_inicio, fecha_fin, valor_contrato }
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
  static async delete(deportistaId, equipoId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (d:Deportista)-[:TIENE_CONTRATO]->(c:Contrato)-[:CONTRATO_CON]->(e:Equipo)
         WHERE id(d) = $deportistaId AND id(e) = $equipoId
         DETACH DELETE c
         RETURN count(c) AS eliminado`,
        { deportistaId, equipoId }
      );
      return result.records[0].get("eliminado").toInt() > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = Contratacion;
