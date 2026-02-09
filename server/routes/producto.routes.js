import express from 'express';
import {
    postProducto,
    getAllProducto,
    getProductoById,
    updateProducto,
    deleteProducto,
    validarNombre,
    buscarProducto,
    cambiarEstadoProducto
} from '../controllers/productos.controller.js';
// IMPORTANTE: Importa desde color.controller.js, NO desde productos.controller
import { getColoresProducto, updateColoresProducto } from '../controllers/color.controller.js';

const router = express.Router();

// Validar si el nombre ya existe
router.get('/validar-nombre', validarNombre);

// Buscar productos
router.get('/buscar', buscarProducto);

// Crear producto
router.post('/', postProducto);

// Obtener todos los productos
router.get('/', getAllProducto);

// Ruta para cambiar estado del producto
router.put('/:id/estado', cambiarEstadoProducto);

// RELACIÓN PRODUCTO <-> COLORES 
router.get('/:id/colores', getColoresProducto);  
router.post('/:id/colores', updateColoresProducto); 

// Obtener producto/servicio por ID
router.get('/:id', getProductoById);

// Actualizar producto
router.put('/:ProductoId', updateProducto);

// Eliminar producto
router.delete('/:id', deleteProducto);

export default router;