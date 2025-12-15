import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

// Obtener detalles por venta
export const getDetalleVentaByVentaIdModel = async (ventaId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    "SELECT * FROM detalleventas WHERE VentaId = ?",
    [ventaId]
  );
  return rows;
};

// Crear detalle de venta
export const createDetalleVentaModel = async ({ VentaId, ProductoServicioId, Cantidad, PrecioUnitario, Descuento = 0.00, Subtotal }) => {
  const connection = await connectDB();
  const DetalleVentaId = uuidv4();

  await connection.execute(
    `INSERT INTO detalleventas 
    (DetalleVentaId, VentaId, ProductoServicioId, Cantidad, PrecioUnitario, Descuento, Subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [DetalleVentaId, VentaId, ProductoServicioId, Cantidad, PrecioUnitario, Descuento, Subtotal]
  );

  return {
    DetalleVentaId,
    VentaId,
    ProductoServicioId,
    Cantidad,
    PrecioUnitario,
    Descuento,
    Subtotal,
  };
};

// Actualizar detalle de venta
export const updateDetalleVentaModel = async (detalleVentaId, data) => {
  const connection = await connectDB();
  const { Cantidad, PrecioUnitario, Descuento, Subtotal } = data;

  const [result] = await connection.execute(
    `UPDATE detalleventas
     SET Cantidad = ?, PrecioUnitario = ?, Descuento = ?, Subtotal = ?
     WHERE DetalleVentaId = ?`,
    [sanitize(Cantidad), sanitize(PrecioUnitario), sanitize(Descuento), sanitize(Subtotal), detalleVentaId]
  );

  return result;
};

// Eliminar detalle de venta
export const deleteDetalleVentaModel = async (detalleVentaId) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    "DELETE FROM detalleventas WHERE DetalleVentaId = ?",
    [detalleVentaId]
  );
  return result;
};