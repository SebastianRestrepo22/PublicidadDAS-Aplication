import { Router } from "express";
import {
    getDetallesByProduccion,
    createDetalleProduccion,  
    deleteDetalleProduccion
} from "../controllers/detalleProduccion.controller.js";

const router = Router();

router.get("/:id", getDetallesByProduccion);
router.post("/", createDetalleProduccion);
router.delete("/:id", deleteDetalleProduccion);
  

export default router;