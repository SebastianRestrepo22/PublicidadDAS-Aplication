// routes/pedidoCliente.routes.js
import { Router } from "express";
import {
  getMisPedidos,
  getPedidosClientes,
  getPedidoClienteById,
  createPedidoCliente,
  updatePedidoCliente,
  deletePedidoCliente
} from "../controllers/pedidoCliente.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadVoucher } from "../lib/upload.js"; // ← Importa Multer

const router = Router();

// ✅ Aplicar Multer a las rutas que reciben archivos
router.post("/", uploadVoucher.single('voucher'), createPedidoCliente);
router.put("/:id", uploadVoucher.single('voucher'), updatePedidoCliente);

// ✅ Rutas sin Multer
router.get("/", getPedidosClientes);
router.get("/:id", getPedidoClienteById);
router.delete("/:id", deletePedidoCliente);
router.get("/mis-pedidos", authMiddleware, getMisPedidos);

console.log("✅ Rutas de pedidos registradas");
export default router;