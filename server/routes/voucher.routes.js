// server/routes/voucher.routes.js
import { Router } from 'express';
import { uploadVoucherForPedido } from '../controllers/voucher.controller.js';

const router = Router();

// Ruta para subir el comprobante de pago vinculado a un pedido
router.post('/', uploadVoucherForPedido);

export default router;