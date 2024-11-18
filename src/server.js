const express = require('express');
const cors = require('cors');
const { dbNeo4j } = require('./database/Neo4jConnection');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;

        this.pathsNeo4j = {
            equipos: '/api/equipos',
            deportistas: '/api/deportistas',
            contrataciones: '/api/contrataciones',
            consultas: '/api/consultas',
            // pais: '/api/paises',  
            // deporte: '/api/deportes',
            // ciudad: '/api/ciudades'
        };

       
        this.dbConnectionNeo4j();
        
        this.middlewares();
        
        this.routes();
    }

    async dbConnectionNeo4j() {
        await dbNeo4j();
    }

    
    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    
    routes() {
        this.app.use(this.pathsNeo4j.equipos, require('./routes/equipos'));
        this.app.use(this.pathsNeo4j.deportistas, require('./routes/deportistas'));
        this.app.use(this.pathsNeo4j.contrataciones, require('./routes/contrataciones'));
        this.app.use(this.pathsNeo4j.consultas, require('./routes/consultas')); 
        // this.app.use(this.pathsNeo4j.pais, require('./routes/pais')); 
        // this.app.use(this.pathsNeo4j.deporte, require('./routes/deporte')); 
        // this.app.use(this.pathsNeo4j.ciudad, require('./routes/ciudades')); 
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;
