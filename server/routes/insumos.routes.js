import express from 'express';
import {
  getAllInsumos,
  getInsumoById,
  createInsumo,
  deleteInsumo,
  updateInsumo
} from '../controllers/insumos.controller.js';

const router = express.Router();

router.get('/', getAllInsumos);
router.get('/:id', getInsumoById);
router.post('/', createInsumo);
router.delete('/:id', deleteInsumo);
router.put('/:id', updateInsumo);



export default router;
