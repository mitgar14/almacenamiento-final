const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  process.env.NEO4J_URI || "neo4j+s://6246c5fa.databases.neo4j.io",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "yfj-YgOpPK44YgBa61OyCRNnXcVzbstLJ2HXANoeaWo"
  )
);

const dbNeo4j = async () => {
  try {
    await driver.verifyConnectivity();
    console.log("Conectado a Neo4j correctamente.");
  } catch (error) {
    console.error("Error al conectar a Neo4j", error);
  }
};

// Función para cerrar la conexión a Neo4j
const closeConnection = async () => {
  try {
    await driver.close();
    console.log("Conexión a Neo4j cerrada correctamente.");
  } catch (error) {
    console.error("Error al cerrar la conexión a Neo4j:", error);
  }
};

module.exports = {
  dbNeo4j,
  driver,
  closeConnection,
};
