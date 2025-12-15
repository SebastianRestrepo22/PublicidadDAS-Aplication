import express from 'express';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  changeState,
  validarRol,
  buscarRoles,
  // Nuevas funciones
  getAllPermissions,
  getRolePermissions,
  updateRolePermissions,
  getUserPermissions
} from '../controllers/role.controller.js';

const router = express.Router();

// Rutas existentes
router.get('/validar-rol', validarRol);
router.get('/buscar', buscarRoles);
router.post('/', createRole);
router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
router.put('/:id/estado', changeState);

// Nuevas rutas para permisos
router.get('/permisos/todos', getAllPermissions);
router.get('/:id/permisos', getRolePermissions);
router.put('/:id/permisos', updateRolePermissions);
router.get('/usuario/:userId/permisos', getUserPermissions);

export default router;