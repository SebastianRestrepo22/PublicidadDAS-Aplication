// routes/ventas.routes.js
import { Router } from "express";
import {
  getVentas,
  getVentaById,
  updateVenta,
  deleteVenta,
  createVentaDesdePedido
} from "../controllers/ventas.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getVentas);
router.get("/:id", authMiddleware, getVentaById);
router.post('/desde-pedido', createVentaDesdePedido); 
router.put("/:id", updateVenta);
router.delete("/:id", deleteVenta);

console.log("Rutas de ventas registradas");
export default router;