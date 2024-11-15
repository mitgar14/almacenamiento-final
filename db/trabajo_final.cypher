// Restricciones
CREATE CONSTRAINT deporte_unico IF NOT EXISTS
FOR (d:Deporte) REQUIRE d.nombre IS UNIQUE;

CREATE CONSTRAINT equipo_unico IF NOT EXISTS
FOR (e:Equipo) REQUIRE (e.nombre, e.pais) IS UNIQUE;

CREATE CONSTRAINT deportista_unico IF NOT EXISTS
FOR (d:Deportista) REQUIRE (d.nombre, d.dorsal, d.pais) IS UNIQUE;

// Países
CREATE (p1:Pais {nombre: "España"});
CREATE (p2:Pais {nombre: "Alemania"});
CREATE (p3:Pais {nombre: "Venezuela"});
CREATE (p4:Pais {nombre: "Inglaterra"});

// Deportes
CREATE (d1:Deporte {nombre: "Fútbol"});
CREATE (d2:Deporte {nombre: "Beisbol"});

// Ciudades
CREATE (c1:Ciudad {nombre: "Tegueste"})-[:PERTENECE_A]->(p1);
CREATE (c2:Ciudad {nombre: "Londres"})-[:PERTENECE_A]->(p4);
CREATE (c3:Ciudad {nombre: "Caracas"})-[:PERTENECE_A]->(p3);

// Equipos de Fútbol
MATCH (d:Deporte {nombre: "Fútbol"}), (p:Pais {nombre: "España"})
CREATE (e1:Equipo {nombre: "Barcelona", pais: "España"})
CREATE (e1)-[:PRACTICA_DEPORTE]->(d)
CREATE (e1)-[:UBICADO_EN]->(p);

MATCH (d:Deporte {nombre: "Fútbol"}), (p:Pais {nombre: "Alemania"})
CREATE (e2:Equipo {nombre: "Bayern Munich", pais: "Alemania"})
CREATE (e2)-[:PRACTICA_DEPORTE]->(d)
CREATE (e2)-[:UBICADO_EN]->(p);

// Equipo de Béisbol
MATCH (d:Deporte {nombre: "Beisbol"}), (p:Pais {nombre: "Venezuela"})
CREATE (e3:Equipo {nombre: "Caribes de Anzoátegui", pais: "Venezuela"})
CREATE (e3)-[:PRACTICA_DEPORTE]->(d)
CREATE (e3)-[:UBICADO_EN]->(p);

// Deportistas
// Pedri
MATCH (c:Ciudad {nombre: "Tegueste"}), (e:Equipo {nombre: "Barcelona"})
CREATE (d:Deportista {
    nombre: "Pedri",
    pais: "España",
    posicion: "Centrocampista",
    dorsal: 8,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("2002-11-25")}]->(c)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2019-09-02")}]->(e);

// Harry Kane
MATCH (c:Ciudad {nombre: "Londres"}), (e:Equipo {nombre: "Bayern Munich"})
CREATE (d:Deportista {
    nombre: "Harry Kane",
    pais: "Inglaterra",
    posicion: "Delantero",
    dorsal: 9,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1993-07-28")}]->(c)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2023-08-12")}]->(e);

// José Altuve
MATCH (c:Ciudad {nombre: "Caracas"}), (e:Equipo {nombre: "Caribes de Anzoátegui"})
CREATE (d:Deportista {
    nombre: "José Altuve",
    pais: "Venezuela",
    posicion: "Segunda Base",
    dorsal: 27,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1990-05-06")}]->(c)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2011-07-20")}]->(e);

// Contratos
// Contrato de Pedri
MATCH (d:Deportista {nombre: "Pedri"}), (e:Equipo {nombre: "Barcelona"})
CREATE (d)-[:TIENE_CONTRATO]->(c:Contrato {
    fecha_inicio: date("2019-09-02"),
    fecha_fin: date("2026-06-30"),
    valor_contrato: 80000000
})
CREATE (c)-[:CONTRATO_CON]->(e);

// Contrato de Harry Kane
MATCH (d:Deportista {nombre: "Harry Kane"}), (e:Equipo {nombre: "Bayern Munich"})
CREATE (d)-[:TIENE_CONTRATO]->(c:Contrato {
    fecha_inicio: date("2023-08-12"),
    fecha_fin: date("2027-06-30"),
    valor_contrato: 100000000
})
CREATE (c)-[:CONTRATO_CON]->(e);

// Contrato de José Altuve
MATCH (d:Deportista {nombre: "José Altuve"}), (e:Equipo {nombre: "Caribes de Anzoátegui"})
CREATE (d)-[:TIENE_CONTRATO]->(c:Contrato {
    fecha_inicio: date("2011-07-20"),
    fecha_fin: date("2025-12-31"),
    valor_contrato: 29000000
})
CREATE (c)-[:CONTRATO_CON]->(e);