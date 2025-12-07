import express from 'express';
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    changeState,
    validarRol,
    buscarRoles
} from '../controllers/role.controller.js';

const router = express.Router();

//Verificar si existe el rol

router.get('/validar-rol', validarRol);

//Buscar rol

router.get('/buscar', buscarRoles);

// Crear rol
router.post('/', createRole);

// Obtener todos los roles
router.get('/', getAllRoles);

// Obtener rol por ID
router.get('/:id', getRoleById);

// Actualizar rol
router.put('/:id', updateRole);

// Eliminar rol
router.delete('/:id', deleteRole);

//Cambiar el estado del rol

router.put('/:id/estado', changeState);


export default router;
