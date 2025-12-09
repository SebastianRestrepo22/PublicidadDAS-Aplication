// src/routes/comprobante.routes.js
import { Router } from "express";
import multer from "multer";
import path from "path";

// 📥 Importar controladores
import {
  uploadComprobante,
  getComprobanteByPedidoId,
  updateComprobanteEstado
} from "../controllers/comprobante.controller.js";


// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/comprobantes"); // carpeta de destino
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `comprobante-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, png) o archivos PDF"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB máximo
});

const router = Router();

router.post("/", upload.single("comprobante"), uploadComprobante);
router.get("/pedido/:id", getComprobanteByPedidoId); // :id = UUID del pedido
router.patch("/:id", updateComprobanteEstado);       // :id = UUID del comprobante

export default router;