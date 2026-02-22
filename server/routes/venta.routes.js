import { Router } from "express";
import {
  getVentas,
  getVentaById,
  createVentaDesdePedido,
  createVentaManual,
  anularVenta,
  getDetallesByVenta
} from "../controllers/ventas.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todas las ventas
router.get("/", getVentas);

// Obtener venta por ID
router.get("/:id", getVentaById);

// Obtener detalles de una venta
router.get("/:id/detalles", getDetallesByVenta);

// Crear venta desde pedido
router.post("/desde-pedido", createVentaDesdePedido);

// Crear venta manual
router.post("/manual", createVentaManual);

// Anular venta (NO eliminar)
router.put("/:id/anular", anularVenta);

console.log("✅ Rutas de ventas registradas correctamente");
export default router;