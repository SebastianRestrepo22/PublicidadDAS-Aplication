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
import { uploadVoucher } from "../lib/upload.js";

const router = Router();

// ✅ Rutas POST y PUT (con Multer)
router.post("/", uploadVoucher.single('voucher'), createPedidoCliente);
router.put("/:id", uploadVoucher.single('voucher'), updatePedidoCliente);

// ✅ Rutas GET - ESPECÍFICAS PRIMERO, DINÁMICAS DESPUÉS
router.get("/mis-pedidos", authMiddleware, getMisPedidos); // ← MOVER ESTA ARRIBA
router.get("/", getPedidosClientes);
router.get("/:id", getPedidoClienteById); // ← Después de las específicas
router.delete("/:id", deletePedidoCliente);

console.log("✅ Rutas de pedidos registradas");
export default router;