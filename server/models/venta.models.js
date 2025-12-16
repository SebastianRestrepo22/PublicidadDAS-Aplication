// models/venta.models.js
import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

// Obtener todas las ventas
export const getAllVentasModel = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute(`
    SELECT 
      v.VentaId,
      v.PedidoClienteId,
      u.NombreCompleto AS NombreCliente,  
      v.FechaVenta,
      v.Total,
      v.IVA,
      v.Estado
    FROM ventas v
    LEFT JOIN pedidosclientes pc ON v.PedidoClienteId = pc.PedidoClienteId
    LEFT JOIN usuarios u ON pc.ClienteId = u.CedulaId
  `);
  return rows;
};

export const getVentaByIdModel = async (ventaId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT 
      v.*,
      u.NombreCompleto AS NombreCliente,
      u.Telefono,
      u.CorreoElectronico AS Correo,
      u.Direccion
     FROM ventas v
     LEFT JOIN pedidosclientes pc ON v.PedidoClienteId = pc.PedidoClienteId
     LEFT JOIN usuarios u ON pc.ClienteId = u.CedulaId
     WHERE v.VentaId = ?`,
    [ventaId]
  );
  return rows[0];
};

// Crear una nueva venta desde pedido
export const createVentaModel = async ({ PedidoClienteId, Total, IVA, Estado = "Pendiente" }) => {
  const connection = await connectDB();
  const VentaId = uuidv4();

  await connection.execute(
    `INSERT INTO ventas (VentaId, PedidoClienteId, FechaVenta, Total, IVA, Estado)
     VALUES (?, ?, NOW(), ?, ?, ?)`,
    [VentaId, PedidoClienteId, Total, IVA, Estado]
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

// Verificar si ya existe una venta para un pedido
export const existeVentaParaPedidoModel = async (pedidoClienteId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
    [pedidoClienteId]
  );
  return rows.length > 0;
};