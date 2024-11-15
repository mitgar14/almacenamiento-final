// Limpiar la base de datos
MATCH (n) DETACH DELETE n;

// Crear Países
CREATE (:Pais {nombre: "España"});
CREATE (:Pais {nombre: "Alemania"});
CREATE (:Pais {nombre: "Venezuela"});
CREATE (:Pais {nombre: "Polonia"});
CREATE (:Pais {nombre: "Uruguay"});
CREATE (:Pais {nombre: "Países Bajos"});
CREATE (:Pais {nombre: "Chile"});
CREATE (:Pais {nombre: "Estados Unidos"});
CREATE (:Pais {nombre: "Brasil"});
CREATE (:Pais {nombre: "Argentina"});

// Crear Ciudades y relacionarlas con Países

// Ciudades de Alemania
MATCH (paisAlemania:Pais {nombre: "Alemania"})
CREATE (c1:Ciudad {nombre: "Mönchengladbach"})-[:PERTENECE_A]->(paisAlemania),
       (c9:Ciudad {nombre: "Bremen"})-[:PERTENECE_A]->(paisAlemania),
       (c10:Ciudad {nombre: "Rottweil"})-[:PERTENECE_A]->(paisAlemania);

// Ciudades de Uruguay
MATCH (paisUruguay:Pais {nombre: "Uruguay"})
CREATE (c2:Ciudad {nombre: "Rivera"})-[:PERTENECE_A]->(paisUruguay);

// Ciudades de Países Bajos
MATCH (paisPaisesBajos:Pais {nombre: "Países Bajos"})
CREATE (c3:Ciudad {nombre: "Arkel"})-[:PERTENECE_A]->(paisPaisesBajos);

// Ciudades de España
MATCH (paisEspaña:Pais {nombre: "España"})
CREATE (c4:Ciudad {nombre: "Los Palacios y Villafranca"})-[:PERTENECE_A]->(paisEspaña),
       (c7_es:Ciudad {nombre: "Barcelona"})-[:PERTENECE_A]->(paisEspaña);

// Ciudades de Polonia
MATCH (paisPolonia:Pais {nombre: "Polonia"})
CREATE (c5:Ciudad {nombre: "Varsovia"})-[:PERTENECE_A]->(paisPolonia);

// Ciudades de Venezuela
MATCH (paisVenezuela:Pais {nombre: "Venezuela"})
CREATE (c6:Ciudad {nombre: "Anaco"})-[:PERTENECE_A]->(paisVenezuela),
       (c7_ve:Ciudad {nombre: "Barcelona"})-[:PERTENECE_A]->(paisVenezuela),
       (c8:Ciudad {nombre: "Maracay"})-[:PERTENECE_A]->(paisVenezuela);

// Crear Deportes
CREATE (:Deporte {nombre: "Fútbol"});
CREATE (:Deporte {nombre: "Béisbol"});

// Crear Equipos
CREATE (:Equipo {nombre: "Barcelona"});
CREATE (:Equipo {nombre: "Bayern Munich"});
CREATE (:Equipo {nombre: "Caribes de Anzoátegui"});

// Relacionar equipos con deportes y países

// Barcelona
MATCH (eBarcelona:Equipo {nombre: "Barcelona"}),
      (dFutbol:Deporte {nombre: "Fútbol"}),
      (paisEspaña:Pais {nombre: "España"})
CREATE (eBarcelona)-[:PRACTICA]->(dFutbol),
       (eBarcelona)-[:ES_DE]->(paisEspaña);

// Bayern Munich
MATCH (eBM:Equipo {nombre: "Bayern Munich"}),
      (dFutbol:Deporte {nombre: "Fútbol"}),
      (paisAlemania:Pais {nombre: "Alemania"})
CREATE (eBM)-[:PRACTICA]->(dFutbol),
       (eBM)-[:ES_DE]->(paisAlemania);

// Caribes de Anzoátegui
MATCH (eCA:Equipo {nombre: "Caribes de Anzoátegui"}),
      (dBeisbol:Deporte {nombre: "Béisbol"}),
      (paisVenezuela:Pais {nombre: "Venezuela"})
CREATE (eCA)-[:PRACTICA]->(dBeisbol),
       (eCA)-[:ES_DE]->(paisVenezuela);

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