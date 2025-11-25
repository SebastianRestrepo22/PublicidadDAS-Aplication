import express from 'express';
import {
  obtenerCitas,
  obtenerCita,
  crearCita,
  actualizarCita,
  eliminarCita
} from '../controllers/cita.controller.js';

const router = express.Router();

router.get('/', obtenerCitas);
router.get('/:id', obtenerCita);
router.post('/', crearCita);
router.put('/:id', actualizarCita);
router.delete('/:id', eliminarCita);

export default router;
