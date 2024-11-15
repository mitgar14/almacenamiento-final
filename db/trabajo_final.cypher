// Requerimientos
CREATE CONSTRAINT deporte_unico IF NOT EXISTS
FOR (d:Deporte) REQUIRE d.nombre IS UNIQUE;

CREATE CONSTRAINT equipo_unico IF NOT EXISTS
FOR (e:Equipo) REQUIRE (e.nombre, e.pais) IS UNIQUE;

CREATE CONSTRAINT deportista_unico IF NOT EXISTS
FOR (d:Deportista) REQUIRE (d.nombre, d.dorsal, d.pais) IS UNIQUE;

// Paises
CREATE (p1:Pais {nombre: "España"});
CREATE (p2:Pais {nombre: "Alemania"});
CREATE (p3:Pais {nombre: "Venezuela"});

// Deportes
CREATE (d1:Deporte {nombre: "Fútbol"});
CREATE (d2:Deporte {nombre: "Beisbol"});

// Ciudades de nacimiento
CREATE (c1:Ciudad {nombre: "Tegueste"})-[:PERTENECE_A]->(p1);
CREATE (c2:Ciudad {nombre: "Londres"})-[:PERTENECE_A]->(p2);

// Equipos
MATCH (d:Deporte {nombre: "Fútbol"}), (p:Pais {nombre: "España"})
CREATE (e1:Equipo {nombre: "Barcelona", pais: "España"})
CREATE (e1)-[:PRACTICA_DEPORTE]->(d)
CREATE (e1)-[:UBICADO_EN]->(p);

MATCH (d:Deporte {nombre: "Fútbol"}), (p:Pais {nombre: "Alemania"})
CREATE (e2:Equipo {nombre: "Bayern Munich", pais: "Alemania"})
CREATE (e2)-[:PRACTICA_DEPORTE]->(d)
CREATE (e2)-[:UBICADO_EN]->(p);

// Deportistas
MATCH (c:Ciudad {nombre: "Tegueste"}), (e:Equipo {nombre: "Barcelona"})
CREATE (d:Deportista {
    nombre: "Pedri",
    pais: "España",
    posicion: "Centrocampista",
    dorsal: 8,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("2002-11-25")}]->(c)
CREATE (d)-[:JUEGA_EN]->(e);

MATCH (c:Ciudad {nombre: "Londres"}), (e:Equipo {nombre: "Bayern Munich"})
CREATE (d:Deportista {
    nombre: "Harry Kane",
    pais: "Inglaterra",
    posicion: "Delantero",
    dorsal: 9,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1993-07-28")}]->(c)
CREATE (d)-[:JUEGA_EN]->(e);

// Contrataciones
MATCH (d:Deportista {nombre: "Pedri"}), (e:Equipo {nombre_equipo: "Barcelona"})
CREATE (d)-[:TIENE_CONTRATO]->(c:Contrato {
    fecha_inicio: date("2019-09-02"),
    fecha_fin: date("2026-06-30"),
    valor_contrato: 80000000
})
CREATE (c)-[:CONTRATO_CON]->(e);


MATCH (d:Deportista {nombre: "Harry Kane"}), (e:Equipo {nombre_equipo: "Bayern Munich"})
CREATE (d)-[:TIENE_CONTRATO]->(c:Contrato {
    fecha_inicio: date("2023-08-12"),
    fecha_fin: date("2027-06-30"),
    valor_contrato: 100000000
})
CREATE (c)-[:CONTRATO_CON]->(e);