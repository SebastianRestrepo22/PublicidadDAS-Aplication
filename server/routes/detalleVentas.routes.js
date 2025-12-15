import { Router } from "express";
import {
  getDetallesByVenta,
  createDetalle,
  updateDetalle,
  deleteDetalle
} from "../controllers/detalleVentas.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Obtener detalles de una venta específica
router.get("/:id", authMiddleware, getDetallesByVenta);

// CRUD de detalle
router.post("/", createDetalle);
router.put("/:id", updateDetalle);
router.delete("/:id", deleteDetalle);

console.log("Rutas de detalle de ventas registradas");
export default router;