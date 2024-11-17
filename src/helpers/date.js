// Función auxiliar para formatear fechas
function formatDate(neoDate) {
    if (!neoDate) return null;
    return `${neoDate.year.low}-${String(neoDate.month.low).padStart(2, '0')}-${String(neoDate.day.low).padStart(2, '0')}`;
}

module.exports = { formatDate };