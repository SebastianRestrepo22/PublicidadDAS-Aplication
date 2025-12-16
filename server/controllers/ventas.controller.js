// controllers/ventas.controller.js
import connectDB from "../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import {
  getAllVentasModel,
  getVentaByIdModel,
  createVentaModel,
  updateVentaModel,
  deleteVentaModel,
  existeVentaParaPedidoModel
} from "../models/venta.models.js";
import {
  getDetalleVentaByVentaIdModel,
  createDetalleVentaModel
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
 * Crear venta automáticamente desde pedido
 */
export const crearVentaDesdePedidoId = async (PedidoClienteId) => {
  if (!PedidoClienteId) throw new Error("PedidoClienteId es obligatorio");

  const pool = await connectDB();
  const connection = await pool.getConnection();

  try {
    const [pedidoRows] = await connection.execute(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      throw new Error("Pedido no encontrado");
    }

    const [ventaCheck] = await connection.execute(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [PedidoClienteId]
    );
    if (ventaCheck.length > 0) {
      throw new Error("Ya existe una venta para este pedido");
    }

    await connection.beginTransaction();

    const [detallesPedido] = await connection.execute(
      `SELECT dpc.ProductoServicioId, dpc.Cantidad, ps.Precio, ps.Nombre
       FROM detallepedidosclientes dpc
       JOIN productoservicios ps ON dpc.ProductoServicioId = ps.ProductoServicioId
       WHERE dpc.PedidoClienteId = ?`,
      [PedidoClienteId]
    );

    if (detallesPedido.length === 0) {
      await connection.rollback();
      throw new Error("El pedido no tiene detalles");
    }

    let total = 0;
    const detallesConSubtotal = detallesPedido.map(detalle => {
      const subtotal = detalle.Cantidad * detalle.Precio;
      total += subtotal;
      return {
        ProductoServicioId: detalle.ProductoServicioId,
        Nombre: detalle.Nombre,
        Cantidad: detalle.Cantidad,
        PrecioUnitario: detalle.Precio,
        Descuento: 0,
        Subtotal: subtotal
      };
    });
    const iva = total * 0.19;

    const VentaId = uuidv4();
    await connection.execute(
      `INSERT INTO ventas (VentaId, PedidoClienteId, FechaVenta, Total, IVA, Estado)
       VALUES (?, ?, NOW(), ?, ?, 'Pendiente')`,
      [VentaId, PedidoClienteId, total, iva]
    );

    // CORRECTO: incluye Nombre en el INSERT
    for (const detalle of detallesConSubtotal) {
      await connection.execute(
        `INSERT INTO detalleventas 
         (DetalleVentaId, VentaId, ProductoServicioId, Nombre, Cantidad, PrecioUnitario, Descuento, Subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          VentaId,
          detalle.ProductoServicioId,
          detalle.Nombre,
          detalle.Cantidad,
          detalle.PrecioUnitario,
          detalle.Descuento,
          detalle.Subtotal
        ]
      );
    }

    await connection.commit();

    const ventaCreada = await getVentaByIdModel(VentaId);
    ventaCreada.detalle = detallesConSubtotal;
    return ventaCreada;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const createVentaDesdePedido = async (req, res) => {
  const { PedidoClienteId } = req.body;
  if (!PedidoClienteId) {
    return res.status(400).json({ error: "PedidoClienteId es obligatorio" });
  }

  try {
    const venta = await crearVentaDesdePedidoId(PedidoClienteId);
    res.status(201).json(venta);
  } catch (error) {
    console.error("Error al crear venta desde pedido:", error.message);
    res.status(400).json({ error: error.message || "Error al crear venta" });
  }
};

/**
 * Actualizar venta (solo estado y datos de pago)
 */
export const updateVenta = async (req, res) => {
  const { id } = req.params;
  const { Estado, Total, IVA } = req.body;

  try {
    const ventaActual = await getVentaByIdModel(id);
    if (!ventaActual) return res.status(404).json({ error: "Venta no encontrada" });

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
 * Eliminar venta y sus detalles (CORREGIDO)
 */
export const deleteVenta = async (req, res) => {
  const pool = await connectDB();
  const connection = await pool.getConnection();
  const { id } = req.params;

  try {
    await connection.beginTransaction();

    await connection.execute("DELETE FROM detalleventas WHERE VentaId = ?", [id]);
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
  } finally {
    connection.release();
  }
};