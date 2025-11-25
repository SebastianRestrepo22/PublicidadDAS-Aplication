import { Router } from "express";
import {
    getDetallesByPedido,
    deleteDetalle
} from "../controllers/detallePedidoCliente.controller.js";

const router = Router();

router.get("/:id", getDetallesByPedido);    // obtiene detalles por pedido
router.delete("/:id", deleteDetalle);       // elimina un detalle

export default router;
