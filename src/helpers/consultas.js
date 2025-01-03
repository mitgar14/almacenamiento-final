// Función para realizar consultas a la base de datos y devolver el resultado o un error
const realizarConsulta = async (req, res, consulta, params = {}) => {
  try {
    const resultado = await consulta(params);
    res.status(200).json(resultado);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al realizar la consulta", detalle: error.message });
  }
};

module.exports = realizarConsulta;
