import express from 'express';
import {
    postProducto,
    getAllProducto,
    getProductoById,
    updateProducto,
    deleteProducto,
    validarNombre,
    buscarProducto
} from '../controllers/productos.controller.js';

const router = express.Router();

// Validar si el nombre ya existe
router.get('/validar-nombre', validarNombre);

// Buscar productos
router.get('/buscar', buscarProducto);

// Crear producto
router.post('/', postProducto);

// Obtener todos los productos
router.get('/', getAllProducto);

// Obtener producto/servicio por ID
router.get('/:id', getProductoById);

// Actualizar producto
router.put('/:ProductoId', updateProducto);

// Eliminar producto
router.delete('/:id', deleteProducto);

export default router;