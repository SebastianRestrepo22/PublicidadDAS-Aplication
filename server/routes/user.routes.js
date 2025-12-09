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
  buscarUsuarios
} from '../controllers/user.controller.js';

const router = express.Router();

// Validar si el correo ya existe
router.get('/validar-correo', validarCorreo);

// Validar si la cedula ya existe
router.get('/validar-cedula', validarCedula);

// Validar si el telefono ya existe
router.get('/validar-telefono', validarTelefono );

//Buscar
router.get('/buscar', buscarUsuarios);

// Crear usuario
router.post('/', createUser);

// Obtener todos los usuarios
router.get('/', getAllUsers);

// Obtener usuario por ID
router.get('/:id', getUserById);

// Actualizar usuario
router.put('/:id', updateUser);

// Eliminar usuario
router.delete('/:id', deleteUser);

export default router;
