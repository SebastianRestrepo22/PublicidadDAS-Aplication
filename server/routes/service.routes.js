import express from 'express';
import {
    createProductoServicio,
    getAllProductoServicios,
    getProductoServicioById,
    updateProductoServicio,
    deleteProductoServicio,
    validarNombre,
    buscarProductoServicios
} from '../controllers/service.controller.js';

const router = express.Router();

// Validar si el nombre ya existe
router.get('/validar-nombre', validarNombre);

// Buscar productos/servicios
router.get('/buscar', buscarProductoServicios);

// Crear producto/servicio
router.post('/', createProductoServicio);

// Obtener todos los productos/servicios
router.get('/', getAllProductoServicios);

// Obtener producto/servicio por ID
router.get('/:id', getProductoServicioById);

// Actualizar producto/servicio
router.put('/:id', updateProductoServicio);

// Eliminar producto/servicio
router.delete('/:id', deleteProductoServicio);

export default router;
