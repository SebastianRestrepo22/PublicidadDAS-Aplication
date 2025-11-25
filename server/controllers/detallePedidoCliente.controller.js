import {
  getDetallePedidoByPedidoIdModel,
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
