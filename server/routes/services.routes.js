import express from 'express';
import {
    postService,
    getAllService,
    getServiceById,
    updateService,
    deleteService,
    validarNombre,
    buscarService
} from '../controllers/servicios.controller.js';

const router = express.Router();

// Validar si el nombre ya existe
router.get('/validar-nombre', validarNombre);

// Buscar servicios
router.get('/buscar', buscarService);

// Crear servicio
router.post('/', postService);

// Obtener todos los servicios
router.get('/', getAllService);

// // Obtener servicio por ID
router.get('/:id', getServiceById);

// // Actualizar servicio
router.put('/:ServicioId', updateService);

// // Eliminar servicio
router.delete('/:id', deleteService);

export default router;