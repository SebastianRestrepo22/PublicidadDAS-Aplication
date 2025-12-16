// models/detalleVentas.models.js

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
export const createDetalleVentaModel = async ({ 
  VentaId, 
  ProductoServicioId, 
  Nombre,           
  Cantidad, 
  PrecioUnitario, 
  Descuento = 0.00, 
  Subtotal 
}) => {
  const connection = await connectDB();
  const DetalleVentaId = uuidv4();

  await connection.execute(
    `INSERT INTO detalleventas 
     (DetalleVentaId, VentaId, ProductoServicioId, Nombre, Cantidad, PrecioUnitario, Descuento, Subtotal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DetalleVentaId,              
      VentaId,
      ProductoServicioId,
      Nombre,                     
      Cantidad,
      PrecioUnitario,
      Descuento,
      Subtotal
    ]
  );

  return {
    DetalleVentaId,
    VentaId,
    ProductoServicioId,
    Nombre,
    Cantidad,
    PrecioUnitario,
    Descuento,
    Subtotal,
  };
};

// Actualizar detalle de venta
export const updateDetalleVentaModel = async (detalleVentaId, data) => {
  const connection = await connectDB();
  const { Cantidad, PrecioUnitario, Descuento, Subtotal, Nombre } = data; // ✅ Añade Nombre si quieres actualizarlo

  const fields = [];
  const values = [];

  if (Cantidad !== undefined) {
    fields.push("Cantidad = ?");
    values.push(sanitize(Cantidad));
  }
  if (PrecioUnitario !== undefined) {
    fields.push("PrecioUnitario = ?");
    values.push(sanitize(PrecioUnitario));
  }
  if (Descuento !== undefined) {
    fields.push("Descuento = ?");
    values.push(sanitize(Descuento));
  }
  if (Subtotal !== undefined) {
    fields.push("Subtotal = ?");
    values.push(sanitize(Subtotal));
  }
  if (Nombre !== undefined) {
    fields.push("Nombre = ?");
    values.push(sanitize(Nombre));
  }

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  values.push(detalleVentaId);

  const [result] = await connection.execute(
    `UPDATE detalleventas
     SET ${fields.join(", ")}
     WHERE DetalleVentaId = ?`,
    values
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