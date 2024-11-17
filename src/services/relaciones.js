
const Ciudad = require("../models/ciudad");
const Contratacion = require("../models/contratacion");

class RelacionesDeportistas {
  static async getCiudadYContratosParaDeportistas(deportistaId) {
    const ciudad = await Ciudad.getByDeportista(deportistaId);
    const contratos = await Contratacion.getByDeportista(deportistaId);

    return {
      ciudadNacimiento: ciudad,
      contratos,
    };
  }
}


module.exports = {  RelacionesDeportistas
 };