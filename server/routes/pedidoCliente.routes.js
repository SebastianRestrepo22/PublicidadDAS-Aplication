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

const router = Router();

// ✅ Rutas estáticas PRIMERO
router.get("/mis-pedidos", authMiddleware, getMisPedidos);

// ✅ Luego rutas con parámetros
router.get("/:id", getPedidoClienteById); // ← pero ¡espera! Esto también necesita auth

// Rutas restantes
router.get("/", getPedidosClientes);
router.post("/", createPedidoCliente);
router.put("/:id", updatePedidoCliente);
router.delete("/:id", deletePedidoCliente);

console.log("✅ Rutas de pedidos registradas");
export default router;