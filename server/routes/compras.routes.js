import express from 'express';
import {
  getAllCompras,
  getCompraById,
  createCompra,
  deleteCompra,
  updateCompra,
  updateCompraEstado
} from '../controllers/compras.controller.js';

const router = express.Router();

router.get('/', getAllCompras);
router.get('/:id', getCompraById);
router.post('/', createCompra);
router.delete('/:id', deleteCompra);
router.put('/:id', updateCompra);

router.patch('/:id/estado', updateCompraEstado);


export default router;
