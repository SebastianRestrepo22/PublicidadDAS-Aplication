import { Router } from "express";
import {
    getPedidosClientes,
    getPedidoClienteById,
    createPedidoCliente,
    updatePedidoCliente,
    deletePedidoCliente
} from "../controllers/pedidoCliente.controller.js";

const router = Router();

router.get("/", getPedidosClientes);
router.get("/:id", getPedidoClienteById);
router.post("/", createPedidoCliente);
router.put("/:id", updatePedidoCliente);
router.delete("/:id", deletePedidoCliente);

export default router;
