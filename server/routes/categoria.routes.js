import express from 'express';
import {
  getAllCategorias,  // Esta función devuelve TODAS (sin paginación)
  getCategoriaById,
  createCategoria,
  deleteCategoria,
  updateCategoria,
  getCategoriasPaginated,
  buscarCategorias
} from '../controllers/categoria.controller.js';

const router = express.Router();

// Rutas con paginación (para tu módulo)
router.get('/', getCategoriasPaginated);
router.get('/buscar', buscarCategorias);

// Ruta específica para obtener TODAS (para el módulo de productos de tu compañero)
router.get('/todas', getAllCategorias);

// Rutas CRUD
router.get('/:id', getCategoriaById);
router.post('/', createCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

export default router;