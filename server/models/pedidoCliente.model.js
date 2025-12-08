import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

// ✔ TABLA REAL: pedidosclientes

export const getAllPedidosClientesModel = async (clienteId = null) => {
  const connection = await connectDB();

  let query = `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,  
      p.FechaRegistro,
      p.Total,
      p.Estado
    FROM pedidosclientes p
    JOIN usuarios u ON p.ClienteId = u.CedulaId
  `;

  const params = [];

  if (clienteId) {
    query += " WHERE p.ClienteId = ?";
    params.push(clienteId);
  }

  const [rows] = await connection.execute(query, params);
  return rows;
};

export const getClienteByIdModel = async (cedulaId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT CedulaId, NombreCompleto, CorreoElectronico FROM usuarios WHERE CedulaId = ?`,
    [cedulaId]
  );
  return rows[0];
};

export const getPedidoClienteByIdModel = async (pedidoId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado
    FROM pedidosclientes p
    JOIN usuarios u ON p.ClienteId = u.CedulaId
    WHERE p.PedidoClienteId = ?
    `,
    [pedidoId]
  );
  return rows[0];
};

export const createPedidoClienteModel = async ({
  ClienteId,
  FechaRegistro,
  Total,
}) => {
  const connection = await connectDB();
  const PedidoClienteId = uuidv4();

  // 1. Insertar el pedido
  await connection.execute(
    `
    INSERT INTO pedidosclientes 
    (PedidoClienteId, ClienteId, FechaRegistro, Total, Estado)
    VALUES (?, ?, ?, ?, ?)
    `,
    [PedidoClienteId, ClienteId, FechaRegistro, Total, "pendiente"]
  );

  // 2. Obtener el pedido recién creado CON el nombre del cliente
  const [rows] = await connection.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado
    FROM pedidosclientes p
    JOIN usuarios u ON p.ClienteId = u.CedulaId
    WHERE p.PedidoClienteId = ?
    `,
    [PedidoClienteId]
  );

  return rows[0]; 
};

export const updatePedidoClienteModel = async (id, data) => {
  const connection = await connectDB();
  const { ClienteId, FechaRegistro, Total, Estado } = data;

  const [result] = await connection.execute(
    `
    UPDATE pedidosclientes
    SET ClienteId = ?, FechaRegistro = ?, Total = ?, Estado = ?
    WHERE PedidoClienteId = ? 
    `,
    [
      sanitize(ClienteId),
      sanitize(FechaRegistro),
      sanitize(Total),
      sanitize(Estado),
      id,
    ]
  );

  return result;
};

export const deletePedidoClienteModel = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    "DELETE FROM pedidosclientes WHERE PedidoClienteId = ?",
    [id]
  );
  return result;
};