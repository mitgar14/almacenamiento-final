const Ciudad = require('../models/ciudad');
const Contratacion = require('../models/contratacion');

class Relaciones {
    static async getCiudadYContratos(deportistaId) {
        const ciudad = await Ciudad.getByDeportista(deportistaId);
        const contratos = await Contratacion.getByDeportista(deportistaId);

        return {
            ciudadNacimiento: ciudad,
            contratos
        };
    }
}

module.exports = { Relaciones };