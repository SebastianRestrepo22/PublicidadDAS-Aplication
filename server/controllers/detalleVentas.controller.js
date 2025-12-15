import {
  getDetalleVentaByVentaIdModel,
  createDetalleVentaModel,
  updateDetalleVentaModel,
  deleteDetalleVentaModel
} from "../models/detalleVentas.models.js";

/**
 * Obtener detalles de una venta específica
 */
export const getDetallesByVenta = async (req, res) => {
  try {
    const detalles = await getDetalleVentaByVentaIdModel(req.params.id);
    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
};

/**
 * Crear detalle de venta independiente
 */
export const createDetalle = async (req, res) => {
  try {
    const { VentaId, ProductoServicioId, Cantidad, PrecioUnitario, Descuento, Subtotal } = req.body;

    if (!VentaId) {
      return res.status(400).json({ error: "VentaId es obligatorio" });
    }

    const nuevoDetalle = await createDetalleVentaModel({
      VentaId,
      ProductoServicioId: ProductoServicioId?.toString().trim(),
      Cantidad,
      PrecioUnitario,
      Descuento: Descuento || 0,
      Subtotal
    });

    res.status(201).json(nuevoDetalle);
  } catch (error) {
    console.error("Error al crear detalle:", error);
    res.status(500).json({ error: "Error al crear detalle" });
  }
};

/**
 * Actualizar detalle de venta
 */
export const updateDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, PrecioUnitario, Descuento, Subtotal } = req.body;

    await updateDetalleVentaModel(id, { Cantidad, PrecioUnitario, Descuento, Subtotal });

    // Devolver todos los detalles de la venta a la que pertenece
    // Esto permite que el frontend tenga siempre el listado actualizado
    const detalleActualizado = await getDetalleVentaByVentaIdModel(req.body.VentaId);
    res.status(200).json(detalleActualizado);
  } catch (error) {
    console.error("Error al actualizar detalle:", error);
    res.status(500).json({ error: "Error al actualizar detalle" });
  }
};

/**
 * Eliminar detalle de venta
 */
export const deleteDetalle = async (req, res) => {
  try {
    const result = await deleteDetalleVentaModel(req.params.id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar detalle:", error);
    res.status(500).json({ error: "Error al eliminar detalle" });
  }
};