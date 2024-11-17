// Función para estandarizar strings
function standardizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u0302\u0304-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .toUpperCase()
    .trim();
};

module.exports = standardizeString;