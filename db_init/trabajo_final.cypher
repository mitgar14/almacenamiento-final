// Limpiar la base de datos
MATCH (n) DETACH DELETE n;

// Crear Países
MERGE (:Pais {nombre: "España"});
MERGE (:Pais {nombre: "Alemania"});
MERGE (:Pais {nombre: "Venezuela"});
MERGE (:Pais {nombre: "Polonia"});

// Crear Ciudades y relacionarlas con Países

// Ciudades de Alemania
MATCH (paisAlemania:Pais {nombre: "Alemania"})
MERGE (c1:Ciudad {nombre: "Mönchengladbach"})-[:PERTENECE_A]->(paisAlemania)
MERGE (c9:Ciudad {nombre: "Bremen"})-[:PERTENECE_A]->(paisAlemania)
MERGE (c13:Ciudad {nombre: "Rottweil"})-[:PERTENECE_A]->(paisAlemania);

// Ciudades de Venezuela
MATCH (paisVenezuela:Pais {nombre: "Venezuela"})
MERGE (c6:Ciudad {nombre: "Anaco"})-[:PERTENECE_A]->(paisVenezuela)
MERGE (c12:Ciudad {nombre: "Barcelona"})-[:PERTENECE_A]->(paisVenezuela);

// Ciudades de Polonia
MATCH (paisPolonia:Pais {nombre: "Polonia"})
MERGE (c10:Ciudad {nombre: "Varsovia"})-[:PERTENECE_A]->(paisPolonia);

// Ciudades de España
MATCH (paisEspaña:Pais {nombre: "España"})
MERGE (c14:Ciudad {nombre: "Sabadell"})-[:PERTENECE_A]->(paisEspaña);

// Crear Deportes
MERGE (:Deporte {nombre: "Fútbol"});
MERGE (:Deporte {nombre: "Béisbol"});

// Crear Equipos
MERGE (:Equipo {nombre: "Barcelona"});
MERGE (:Equipo {nombre: "Bayern Munich"});
MERGE (:Equipo {nombre: "Caribes de Anzoátegui"});

// Relacionar equipos con deportes y países

// Barcelona
MATCH (eBarcelona:Equipo {nombre: "Barcelona"}),
      (dFutbol:Deporte {nombre: "Fútbol"}),
      (paisEspaña:Pais {nombre: "España"})
MERGE (eBarcelona)-[:PRACTICA]->(dFutbol)
MERGE (eBarcelona)-[:ES_DE]->(paisEspaña);

// Bayern Munich
MATCH (eBM:Equipo {nombre: "Bayern Munich"}),
      (dFutbol:Deporte {nombre: "Fútbol"}),
      (paisAlemania:Pais {nombre: "Alemania"})
MERGE (eBM)-[:PRACTICA]->(dFutbol)
MERGE (eBM)-[:ES_DE]->(paisAlemania);

// Caribes de Anzoátegui
MATCH (eCA:Equipo {nombre: "Caribes de Anzoátegui"}),
      (dBeisbol:Deporte {nombre: "Béisbol"}),
      (paisVenezuela:Pais {nombre: "Venezuela"})
MERGE (eCA)-[:PRACTICA]->(dBeisbol)
MERGE (eCA)-[:ES_DE]->(paisVenezuela);


// Jugadores del FC Barcelona

// Marc-André ter Stegen
MATCH (c:Ciudad {nombre: "Mönchengladbach"})-[:PERTENECE_A]->(pais:Pais {nombre: "Alemania"}),
      (eBarcelona:Equipo {nombre: "Barcelona"})
CREATE (d:Deportista {
    nombre: "Marc-André ter Stegen",
    posicion: "Portero",
    dorsal: 1,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1992-04-30")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2014-05-22")}]->(eBarcelona)
CREATE (contrato:Contrato {
    fecha_inicio: date("2014-05-22"),
    fecha_fin: date("2025-06-30"),
    valor_contrato: 75000000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eBarcelona);

// Robert Lewandowski
MATCH (c:Ciudad {nombre: "Varsovia"})-[:PERTENECE_A]->(pais:Pais {nombre: "Polonia"}),
      (eBarcelona:Equipo {nombre: "Barcelona"})
CREATE (d:Deportista {
    nombre: "Robert Lewandowski",
    posicion: "Delantero",
    dorsal: 9,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1988-08-21")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2022-07-19")}]->(eBarcelona)
CREATE (contrato:Contrato {
    fecha_inicio: date("2022-07-19"),
    fecha_fin: date("2026-06-30"),
    valor_contrato: 50000000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eBarcelona);

// Pedri
MATCH (c:Ciudad {nombre: "Sabadell"})-[:PERTENECE_A]->(pais:Pais {nombre: "España"}),
      (eBarcelona:Equipo {nombre: "Barcelona"})
CREATE (d:Deportista {
    nombre: "Pedri",
    posicion: "Centrocampista Ofensivo",
    dorsal: 8,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("2002-11-25")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2020-07-01")}]->(eBarcelona)
CREATE (contrato:Contrato {
    fecha_inicio: date("2020-07-01"),
    fecha_fin: date("2025-06-30"),
    valor_contrato: 20000000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eBarcelona);


// Jugadores del Bayern Munich

// Manuel Neuer
MATCH (c:Ciudad {nombre: "Bremen"})-[:PERTENECE_A]->(pais:Pais {nombre: "Alemania"}),
      (eBM:Equipo {nombre: "Bayern Munich"})
CREATE (d:Deportista {
    nombre: "Manuel Neuer",
    posicion: "Portero",
    dorsal: 1,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1986-03-27")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2011-06-01")}]->(eBM)
CREATE (contrato:Contrato {
    fecha_inicio: date("2011-06-01"),
    fecha_fin: date("2024-06-30"),
    valor_contrato: 18000000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eBM);

// Joshua Kimmich
MATCH (c:Ciudad {nombre: "Rottweil"})-[:PERTENECE_A]->(pais:Pais {nombre: "Alemania"}),
      (eBM:Equipo {nombre: "Bayern Munich"})
CREATE (d:Deportista {
    nombre: "Joshua Kimmich",
    posicion: "Centrocampista Defensivo",
    dorsal: 6,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1995-02-08")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2015-07-01")}]->(eBM)
CREATE (contrato:Contrato {
    fecha_inicio: date("2021-07-01"),
    fecha_fin: date("2026-06-30"),
    valor_contrato: 30000000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eBM);


// Jugadores de Caribes de Anzoátegui

// Oswaldo Arcia
MATCH (c:Ciudad {nombre: "Anaco"})-[:PERTENECE_A]->(pais:Pais {nombre: "Venezuela"}),
      (eCA:Equipo {nombre: "Caribes de Anzoátegui"})
CREATE (d:Deportista {
    nombre: "Oswaldo Arcia",
    posicion: "Jardinero",
    dorsal: 9,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1991-05-09")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2010-10-12")}]->(eCA)
CREATE (contrato:Contrato {
    fecha_inicio: date("2010-10-12"),
    fecha_fin: date("2024-12-31"),
    valor_contrato: 1500000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eCA);

// Willians Astudillo
MATCH (c:Ciudad {nombre: "Barcelona"})-[:PERTENECE_A]->(pais:Pais {nombre: "Venezuela"}),
      (eCA:Equipo {nombre: "Caribes de Anzoátegui"})
CREATE (d:Deportista {
    nombre: "Willians Astudillo",
    posicion: "Receptor",
    dorsal: 37,
    sexo: "Masculino"
})
CREATE (d)-[:NACE_EN {fecha_nacimiento: date("1991-10-14")}]->(c)
CREATE (d)-[:ES_DE]->(pais)
CREATE (d)-[:JUEGA_EN {fecha_vinculacion: date("2013-10-15")}]->(eCA)
CREATE (contrato:Contrato {
    fecha_inicio: date("2013-10-15"),
    fecha_fin: date("2024-12-31"),
    valor_contrato: 1200000
})
CREATE (d)-[:TIENE_CONTRATO]->(contrato)
CREATE (contrato)-[:CONTRATO_CON]->(eCA);