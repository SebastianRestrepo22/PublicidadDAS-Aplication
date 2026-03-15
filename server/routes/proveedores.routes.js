import express from 'express';
import {
    getAllProveedores,
    getProveedorById,
    createProveedor,
    deleteProveedor,
    updateProveedor,
    // 🔥 Nuevas funciones importadas
    getProveedoresPaginated,
    buscarProveedores
} from '../controllers/proveedores.controller.js';

const router = express.Router();

// 🔥 Ruta principal con paginación (GET /api/proveedores)
router.get('/', getProveedoresPaginated);

// 🔥 Ruta de búsqueda con paginación (GET /api/proveedores/buscar)
router.get('/buscar', buscarProveedores);

// 📌 Ruta para obtener TODOS los proveedores (sin paginación) - para compatibilidad
router.get('/todos', getAllProveedores);

// Rutas CRUD (específicas después de las rutas con parámetros)
router.get('/:id', getProveedorById);
router.post('/', createProveedor);
router.put('/:id', updateProveedor);
router.delete('/:id', deleteProveedor);

export default router;