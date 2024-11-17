// Limpiar la base de datos
MATCH (n) DETACH DELETE n;

// Crear Países
MERGE (:Pais {nombre: "ESPAÑA"});
MERGE (:Pais {nombre: "ALEMANIA"});
MERGE (:Pais {nombre: "VENEZUELA"});
MERGE (:Pais {nombre: "POLONIA"});

// Crear Ciudades y relacionarlas con Países

// Ciudades de Alemania
MATCH (paisAlemania:Pais {nombre: "ALEMANIA"})
MERGE (c1:Ciudad {nombre: "MONCHENGLADBACH"})-[:PERTENECE_A]->(paisAlemania)
MERGE (c9:Ciudad {nombre: "BREMEN"})-[:PERTENECE_A]->(paisAlemania)
MERGE (c13:Ciudad {nombre: "ROTTWEIL"})-[:PERTENECE_A]->(paisAlemania);

// Ciudades de Venezuela
MATCH (paisVenezuela:Pais {nombre: "VENEZUELA"})
MERGE (c6:Ciudad {nombre: "ANACO"})-[:PERTENECE_A]->(paisVenezuela)
MERGE (c12:Ciudad {nombre: "BARCELONA"})-[:PERTENECE_A]->(paisVenezuela);

// Ciudades de Polonia
MATCH (paisPolonia:Pais {nombre: "POLONIA"})
MERGE (c10:Ciudad {nombre: "VARSOVIA"})-[:PERTENECE_A]->(paisPolonia);

// Ciudades de España
MATCH (paisEspaña:Pais {nombre: "ESPAÑA"})
MERGE (c14:Ciudad {nombre: "SABADELL"})-[:PERTENECE_A]->(paisEspaña);

// Crear Deportes
MERGE (:Deporte {nombre: "FUTBOL"});
MERGE (:Deporte {nombre: "BEISBOL"});

// Crear Equipos
MERGE (:Equipo {nombre: "BARCELONA"});
MERGE (:Equipo {nombre: "BAYERN MUNICH"});
MERGE (:Equipo {nombre: "CARIBES DE ANZOATEGUI"});

// Relacionar equipos con deportes y países

// Barcelona
MATCH (eBarcelona:Equipo {nombre: "BARCELONA"}),
      (dFutbol:Deporte {nombre: "FUTBOL"}),
      (paisEspaña:Pais {nombre: "ESPAÑA"})
MERGE (eBarcelona)-[:PRACTICA]->(dFutbol)
MERGE (eBarcelona)-[:ES_DE]->(paisEspaña);

// Bayern Munich
MATCH (eBM:Equipo {nombre: "BAYERN MUNICH"}),
      (dFutbol:Deporte {nombre: "FUTBOL"}),
      (paisAlemania:Pais {nombre: "ALEMANIA"})
MERGE (eBM)-[:PRACTICA]->(dFutbol)
MERGE (eBM)-[:ES_DE]->(paisAlemania);

// Caribes de Anzoátegui
MATCH (eCA:Equipo {nombre: "CARIBES DE ANZOATEGUI"}),
      (dBeisbol:Deporte {nombre: "BEISBOL"}),
      (paisVenezuela:Pais {nombre: "VENEZUELA"})
MERGE (eCA)-[:PRACTICA]->(dBeisbol)
MERGE (eCA)-[:ES_DE]->(paisVenezuela);


// Jugadores del FC Barcelona

// MARC-ANDRE TER STEGEN
MATCH (c:Ciudad {nombre: "MONCHENGLADBACH"})-[:PERTENECE_A]->(pais:Pais {nombre: "ALEMANIA"}),
      (eBarcelona:Equipo {nombre: "BARCELONA"})
CREATE (d:Deportista {
    nombre: "MARC-ANDRE TER STEGEN",
    posicion: "PORTERO",
    dorsal: 1,
    sexo: "MASCULINO"
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
MATCH (c:Ciudad {nombre: "VARSOVIA"})-[:PERTENECE_A]->(pais:Pais {nombre: "POLONIA"}),
      (eBarcelona:Equipo {nombre: "BARCELONA"})
CREATE (d:Deportista {
    nombre: "ROBERT LEWANDOWSKI",
    posicion: "DELANTERO",
    dorsal: 9,
    sexo: "MASCULINO"
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
MATCH (c:Ciudad {nombre: "SABADELL"})-[:PERTENECE_A]->(pais:Pais {nombre: "ESPAÑA"}),
      (eBarcelona:Equipo {nombre: "BARCELONA"})
CREATE (d:Deportista {
    nombre: "PEDRI",
    posicion: "CENTROCAMPISTA OFENSIVO",
    dorsal: 8,
    sexo: "MASCULINO"
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
MATCH (c:Ciudad {nombre: "BREMEN"})-[:PERTENECE_A]->(pais:Pais {nombre: "ALEMANIA"}),
      (eBM:Equipo {nombre: "BAYERN MUNICH"})
CREATE (d:Deportista {
    nombre: "MANUEL NEUER",
    posicion: "PORTERO",
    dorsal: 1,
    sexo: "MASCULINO"
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
MATCH (c:Ciudad {nombre: "ROTTWEIL"})-[:PERTENECE_A]->(pais:Pais {nombre: "ALEMANIA"}),
      (eBM:Equipo {nombre: "BAYERN MUNICH"})
CREATE (d:Deportista {
    nombre: "JOSHUA KIMMICH",
    posicion: "CENTROCAMPISTA DEFENSIVO",
    dorsal: 6,
    sexo: "MASCULINO"
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
MATCH (c:Ciudad {nombre: "ANACO"})-[:PERTENECE_A]->(pais:Pais {nombre: "VENEZUELA"}),
      (eCA:Equipo {nombre: "CARIBES DE ANZOATEGUI"})
CREATE (d:Deportista {
    nombre: "OSWALDO ARCIA",
    posicion: "JARDINERO",
    dorsal: 9,
    sexo: "MASCULINO"
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
MATCH (c:Ciudad {nombre: "BARCELONA"})-[:PERTENECE_A]->(pais:Pais {nombre: "VENEZUELA"}),
      (eCA:Equipo {nombre: "CARIBES DE ANZOATEGUI"})
CREATE (d:Deportista {
    nombre: "WILLIANS ASTUDILLO",
    posicion: "RECEPTOR",
    dorsal: 37,
    sexo: "MASCULINO"
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