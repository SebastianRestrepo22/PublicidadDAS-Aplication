import {
  getDetallePedidoByPedidoIdModel,
  createDetallePedidoModel,  // ← Ya existe en tu model
  deleteDetallePedidoModel
} from "../models/detallePedidoCliente.model.js";

export const getDetallesByPedido = async (req, res) => {
  try {
    const detalles = await getDetallePedidoByPedidoIdModel(req.params.id);
    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
};

// ← NUEVO CONTROLADOR
export const createDetalle = async (req, res) => {
  try {
    const { PedidoClienteId, ProductoServicioId, Cantidad, Alto, Ancho, Descripcion, UrlImagen } = req.body;

    if (!PedidoClienteId) {
      return res.status(400).json({ error: "PedidoClienteId es obligatorio" });
    }

    const nuevoDetalle = await createDetallePedidoModel({
      PedidoClienteId,
      ProductoServicioId: ProductoServicioId?.toString().trim(),
      Cantidad,
      Alto,
      Ancho,
      Descripcion,
      UrlImagen
    });

    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error("Error al crear detalle:", error);
    res.status(500).json({ error: "Error al crear detalle" });
  }
};

export const deleteDetalle = async (req, res) => {
  try {
    const result = await deleteDetallePedidoModel(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar detalle:", error);
    res.status(500).json({ error: "Error al eliminar detalle" });
  }
};
