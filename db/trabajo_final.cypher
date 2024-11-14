// Creación de deportes
CREATE (futbol:Deporte {nombre: "Fútbol"});
CREATE (beisbol:Deporte {nombre: "Béisbol"});

// Creación de equipos
CREATE (equipo1:Equipo {nombre: "Real Madrid", deporte: "Fútbol", país: "España"});
CREATE (equipo2:Equipo {nombre: "New York Yankees", deporte: "Béisbol", país: "Estados Unidos"});

// Creación de un deportista y su país de nacimiento
CREATE (deportista1:Deportista {nombre: "Juan Pérez", sexo: "Masculino", fechaNacimiento: "1990-05-10", ciudadNacimiento: "Madrid", paísNacimiento: "España"});
CREATE (espana:Pais {nombre: "España"});

// Relacionando deportista con el país de nacimiento
MATCH (d:Deportista {nombre: "Juan Pérez"}), (p:Pais {nombre: "España"})
CREATE (d)-[:NACIDO_EN]->(p);

// Relación del deportista con el equipo
MATCH (d:Deportista {nombre: "Juan Pérez"}), (e:Equipo {nombre: "Real Madrid"})
CREATE (d)-[:PERTENECE_A {fechaVinculación: "2021-01-01"}]->(e);

// Creación y relación de contrato
CREATE (contrato1:Contrato {fechaInicio: "2021-01-01", fechaFin: "2023-12-31", valor: 1500000});
MATCH (d:Deportista {nombre: "Juan Pérez"}), (e:Equipo {nombre: "Real Madrid"}), (c:Contrato {fechaInicio: "2021-01-01"})
CREATE (d)-[:TIENE_CONTRATO]->(c)-[:CON_EQUIPO]->(e);