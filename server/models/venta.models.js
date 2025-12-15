import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

// Obtener todas las ventas
export const getAllVentasModel = async () => {
  const connection = await connectDB();

  const [rows] = await connection.execute(`
    SELECT 
      v.VentaId,
      v.ProduccionId,
      p.PedidoClienteId,  -- Obtener PedidoClienteId desde Produccion
      pc.NombreCliente,   -- Obtener nombre del cliente
      v.FechaVenta,
      v.Total,
      v.IVA,
      v.Estado
    FROM ventas v
    JOIN produccion p ON v.ProduccionId = p.ProduccionId
    JOIN pedidosclientes pc ON p.PedidoClienteId = pc.PedidoClienteId
  `);
  
  return rows;
};

// Obtener una venta por ID
export const getVentaByIdModel = async (ventaId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT 
      v.*,
      p.PedidoClienteId,
      pc.NombreCliente
     FROM ventas v
     JOIN produccion p ON v.ProduccionId = p.ProduccionId
     JOIN pedidosclientes pc ON p.PedidoClienteId = pc.PedidoClienteId
     WHERE v.VentaId = ?`,
    [ventaId]
  );
  return rows[0];
};

// Crear una nueva venta desde producción
export const createVentaModel = async ({ ProduccionId, Total, IVA, Estado = "Pendiente" }) => {
  const connection = await connectDB();
  const VentaId = uuidv4();

  await connection.execute(
    `INSERT INTO ventas (VentaId, ProduccionId, FechaVenta, Total, IVA, Estado)
     VALUES (?, ?, NOW(), ?, ?, ?)`,
    [VentaId, ProduccionId, Total, IVA, Estado]
  );

  return getVentaByIdModel(VentaId);
};

// Actualizar una venta
export const updateVentaModel = async (ventaId, data) => {
  const connection = await connectDB();
  const { Total, IVA, Estado } = data;

  const [result] = await connection.execute(
    `UPDATE ventas
     SET Total = ?, IVA = ?, Estado = ?
     WHERE VentaId = ?`,
    [sanitize(Total), sanitize(IVA), sanitize(Estado), ventaId]
  );

  return result;
};

// Eliminar una venta
export const deleteVentaModel = async (ventaId) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    "DELETE FROM ventas WHERE VentaId = ?",
    [ventaId]
  );
  return result;
};