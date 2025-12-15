import { Router } from "express";
import {
  getVentas,
  getVentaById,
  updateVenta,
  deleteVenta,
  createVentaDesdeProduccion
} from "../controllers/ventas.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Rutas estáticas primero (si necesitas alguna "mis ventas")
router.get("/mis-ventas", authMiddleware, getVentas); // opcional, según tu lógica

// Rutas con parámetros
router.get("/:id", authMiddleware, getVentaById);

// Rutas REST estándar
router.get("/", getVentas);
router.post('/desde-produccion', createVentaDesdeProduccion);
router.put("/:id", updateVenta);
router.delete("/:id", deleteVenta);

console.log("Rutas de ventas registradas");
export default router;