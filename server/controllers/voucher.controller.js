// src/controllers/voucher.controller.js
import { uploadVoucher } from '../lib/upload.js';
import { updatePedidoClienteModel } from '../models/pedidoCliente.model.js';

export const uploadVoucherForPedido = [
  uploadVoucher.single('comprobante'),
  async (req, res) => {
    try {

      let { pedidoId } = req.body;

      // ✅ Sanitización crítica
      if (!pedidoId) {
        return res.status(400).json({ error: "ID de pedido requerido" });
      }

      //  elimina espacios
      pedidoId = String(pedidoId).trim();

      // ✅ Opcional: validación básica de UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pedidoId)) {
        return res.status(400).json({ error: "ID de pedido inválido" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Debes adjuntar un comprobante" });
      }

      const rutaVoucher = `/uploads/vouchers/${req.file.filename}`;
      console.log("📄 Ruta a guardar:", rutaVoucher);
      console.log("🆔 Pedido ID (limpio):", JSON.stringify(pedidoId)); // Para depurar

      const result = await updatePedidoClienteModel(pedidoId, { Voucher: rutaVoucher });

      console.log("✅ Resultado de UPDATE:", result);

      if (result.affectedRows === 0) {
        console.warn("⚠️ No se actualizó ningún registro. ¿Existe el pedido?");
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      console.log("🎉 Voucher guardado correctamente en BD.");
      res.status(200).json({ message: "Comprobante subido exitosamente", ruta: rutaVoucher });
    } catch (error) {
      console.error("❌ Error al subir voucher:", error);
      res.status(500).json({ error: "Error al procesar el comprobante" });
    }
  }
];