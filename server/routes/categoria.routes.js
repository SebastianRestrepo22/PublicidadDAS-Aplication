import express from 'express';
import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  deleteCategoria,
  updateCategoria,
  // 🔥 Nuevas funciones importadas
  getCategoriasPaginated,
  buscarCategorias
} from '../controllers/categoria.controller.js';

const router = express.Router();

// 🔥 Ruta principal con paginación (GET /api/categorias)
router.get('/', getCategoriasPaginated);

// 🔥 Ruta de búsqueda con paginación (GET /api/categorias/buscar)
router.get('/buscar', buscarCategorias);

// Rutas específicas (deben ir después de las rutas dinámicas con parámetros)
router.get('/:id', getCategoriaById);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

// 📌 Mantenemos getAllCategorias por si acaso, pero no la usamos en las rutas
// Si quieres mantener compatibilidad con código antiguo, puedes agregar:
// router.get('/todas', getAllCategorias);

export default router;