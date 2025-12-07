import {
  getAllInsumos as getAllInsumosModel,
  getInsumoById as getInsumoByIdModel,
  createInsumo as createInsumoModel,
  deleteInsumo as deleteInsumoModel,
  updateInsumo as updateInsumoModel
} from '../models/insumos.models.js';

// Obtener todos los insumos
export const getAllInsumos = async (req, res) => {
  try {
    const insumos = await getAllInsumosModel();
    res.json(insumos);
  } catch (err) {
    console.error("Error al obtener insumos:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Obtener insumo por ID
export const getInsumoById = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const insumo = await getInsumoByIdModel(id);
    if (!insumo) return res.status(404).json({ message: "Insumo no encontrado" });
    res.json(insumo);
  } catch (err) {
    console.error("Error al obtener insumo por ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Creacion de nuevo insumo
export const createInsumo = async (req, res) => {
  const { nombreInsumo, stock } = req.body;

  // Validación 
  if (!nombreInsumo || stock === undefined) {
    console.log("Error: campos obligatorios faltantes");
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  //Validacion del nombre insumo solo letras y espacios
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  if (!nombreRegex.test(nombreInsumo)) {
    return res.status(400).json({ error : "Nombre insumo debe tener solo letras"})
  }

  // Validacion de stock que solo contenga numeros
  if (typeof stock !== "number" || isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ error: "El stock solo debe ser un numero valido y no negativo"})
  }

  try {
    const result = await createInsumoModel({ nombreInsumo, stock });
    console.log("Insumo insertado con ID:", result.insertId);
    res.status(201).json({ id: result.insertId, nombreInsumo, stock });
  } catch (err) {
    console.error(" Error al crear insumo:", err.message);
    res.status(500).json({ error: err.message });
  }
};

//actualizar insumo
export const updateInsumo = async (req, res) => {
  const id = req.params.id;
  const { nombreInsumo, stock } = req.body;

  //Valida campos obligatorios
  if (!nombreInsumo || !stock) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

    //Validacion del nombre insumo solo letras y espacios
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  if (!nombreRegex.test(nombreInsumo)) {
    return res.status(400).json({ error : "Nombre insumo debe tener solo letras"})
  }

  // Validacion de stock que solo contenga numeros
  const stockRegex =  /^[0-9]+$/;
  if (!stockRegex.test(stock)) {
    return res.status(400).json({ error: "El stock solo debe tener numero "})
  }

  try {
    const result = await updateInsumoModel(id, { nombreInsumo, stock });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Insumo no encontro" });
    }
    res.json({ message: "Insumo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar el insumo:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// Eliminar insumo por ID
export const deleteInsumo = async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "ID inválido" });

  try {
    const result = await deleteInsumoModel(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Insumo no encontrado" });
    }
    res.json({ message: "Insumo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar insumo:", err.message);
    res.status(500).json({ error: err.message });
  }
};
