import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  validarCorreo,
  validarCedula,
  validarTelefono,
  buscarUsuarios,
  resetPassword,
  showResetForm 
} from '../controllers/user.controller.js';

const router = express.Router();

// Rutas de validación y búsqueda
router.get('/validar-correo', validarCorreo);
router.get('/validar-cedula', validarCedula);
router.get('/validar-telefono', validarTelefono);
router.get('/buscar', buscarUsuarios);

// Crear usuario
router.post('/', createUser);

// Obtener todos los usuarios
router.get('/', getAllUsers);

// Mostrar formulario de restablecimiento
router.get('/restablecer/:token', showResetForm);

// Obtener usuario por ID
router.get('/:id', getUserById);

// Actualizar usuario
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Actualizar contraseña
router.post('/auth/reset-password/:token', resetPassword);


export default router;
