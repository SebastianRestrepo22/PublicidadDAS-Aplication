import connectDB from "../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import {
  getAllVentasModel,
  getVentaByIdModel,
  createVentaModel,
  updateVentaModel,
  deleteVentaModel
} from "../models/venta.models.js";
import {
  getDetalleVentaByVentaIdModel,
  createDetalleVentaModel,
  updateDetalleVentaModel,
  deleteDetalleVentaModel
} from "../models/detalleVentas.models.js";

/**
 * Obtener todas las ventas con sus detalles
 */
export const getVentas = async (req, res) => {
  try {
    const ventas = await getAllVentasModel();

    for (const v of ventas) {
      v.detalle = await getDetalleVentaByVentaIdModel(v.VentaId);
    }

    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

/**
 * Obtener venta por ID con sus detalles
 */
export const getVentaById = async (req, res) => {
  try {
    const venta = await getVentaByIdModel(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });

    venta.detalle = await getDetalleVentaByVentaIdModel(req.params.id);
    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ error: "Error al obtener venta" });
  }
};

/**
 * Crear venta automáticamente desde producción
 */
export const createVentaDesdeProduccion = async (req, res) => {
  const connection = await connectDB();
  const { ProduccionId } = req.body;

  if (!ProduccionId) {
    return res.status(400).json({ error: "ProduccionId es obligatorio" });
  }

  try {
    // Verificar que la producción existe y está finalizada
    const [produccionRows] = await connection.execute(
      `SELECT * FROM produccion WHERE ProduccionId = ? AND Estado = 'Finalizado'`,
      [ProduccionId]
    );

    if (produccionRows.length === 0) {
      return res.status(400).json({ 
        error: "Producción no encontrada o no está finalizada" 
      });
    }

    const produccion = produccionRows[0];

    // Verificar si ya existe una venta para esta producción
    const [ventaExistente] = await connection.execute(
      `SELECT * FROM ventas WHERE ProduccionId = ?`,
      [ProduccionId]
    );

    if (ventaExistente.length > 0) {
      return res.status(400).json({ 
        error: "Ya existe una venta para esta producción" 
      });
    }

    await connection.beginTransaction();

    // 1. Obtener detalles del pedido original
    const [detallesPedido] = await connection.execute(
      `SELECT 
        dpc.ProductoServicioId,
        dpc.Cantidad,
        ps.PrecioVenta
       FROM detallepedidosclientes dpc
       JOIN productoservicios ps ON dpc.ProductoServicioId = ps.ProductoServicioId
       WHERE dpc.PedidoClienteId = ?`,
      [produccion.PedidoClienteId]
    );

    if (detallesPedido.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: "El pedido no tiene detalles" 
      });
    }

    // 2. Calcular totales
    let total = 0;
    const detallesConSubtotal = detallesPedido.map(detalle => {
      const subtotal = detalle.Cantidad * detalle.PrecioVenta;
      total += subtotal;
      
      return {
        ProductoServicioId: detalle.ProductoServicioId,
        Cantidad: detalle.Cantidad,
        PrecioUnitario: detalle.PrecioVenta,
        Descuento: 0,
        Subtotal: subtotal
      };
    });

    const iva = total * 0.19; // Ejemplo: 19% IVA

    // 3. Crear la venta
    const VentaId = uuidv4();
    await connection.execute(
      `INSERT INTO ventas (VentaId, ProduccionId, FechaVenta, Total, IVA, Estado)
       VALUES (?, ?, NOW(), ?, ?, 'Pendiente')`,
      [VentaId, ProduccionId, total, iva]
    );

    // 4. Crear detalles de venta
    for (const detalle of detallesConSubtotal) {
      const DetalleVentaId = uuidv4();
      await connection.execute(
        `INSERT INTO detalleventas 
         (DetalleVentaId, VentaId, ProductoServicioId, Cantidad, PrecioUnitario, Descuento, Subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          DetalleVentaId,
          VentaId,
          detalle.ProductoServicioId,
          detalle.Cantidad,
          detalle.PrecioUnitario,
          detalle.Descuento,
          detalle.Subtotal
        ]
      );
    }

    await connection.commit();

    // 5. Retornar venta creada
    const ventaCreada = await getVentaByIdModel(VentaId);
    ventaCreada.detalle = detallesConSubtotal;
    
    res.status(201).json(ventaCreada);
    
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear venta desde producción:", error);
    res.status(500).json({ error: "Error al crear venta" });
  }
};

/**
 * Actualizar venta (solo estado y datos de pago)
 */
export const updateVenta = async (req, res) => {
  const connection = await connectDB();
  const { id } = req.params;
  const { Estado, Total, IVA } = req.body; // Solo estos campos se pueden actualizar

  try {
    const ventaActual = await getVentaByIdModel(id);
    if (!ventaActual) return res.status(404).json({ error: "Venta no encontrada" });

    // Solo permitir actualizar estado, total e IVA
    await updateVentaModel(id, { Estado, Total, IVA });

    const ventaActualizada = await getVentaByIdModel(id);
    ventaActualizada.detalle = await getDetalleVentaByVentaIdModel(id);
    
    res.status(200).json(ventaActualizada);
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({ error: "Error al actualizar venta" });
  }
};

/**
 * Eliminar venta y sus detalles
 */
export const deleteVenta = async (req, res) => {
  const connection = await connectDB();
  const { id } = req.params;

  try {
    await connection.beginTransaction();

    // Eliminar detalles
    await connection.execute("DELETE FROM detalleventas WHERE VentaId = ?", [id]);

    // Eliminar venta
    const [result] = await connection.execute("DELETE FROM ventas WHERE VentaId = ?", [id]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    await connection.commit();
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ error: "Error al eliminar venta" });
  }
};