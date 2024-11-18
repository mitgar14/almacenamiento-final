const validarCampos = require("./validar-campos");
const validarEquipo = require("./validar-Equipo");
const validarDeportista = require("./validar-Deportista");
const validarContratacion = require("./validar-Contratacion");

module.exports = {
  ...validarCampos,
  ...validarEquipo,
  ...validarDeportista,
  ...validarContratacion,
};
