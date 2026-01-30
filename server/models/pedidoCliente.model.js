// src/models/pedidoCliente.model.js
import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";

export const getAllPedidosClientesModel = async (clienteId = null) => {
  let query = `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,  
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega
    FROM pedidosclientes p
    JOIN usuarios u ON p.ClienteId = u.CedulaId
  `;

  const params = [];

  if (clienteId) {
    query += " WHERE p.ClienteId = ?";
    params.push(clienteId);
  }

  const [rows] = await dbPool.execute(query, params);
  return rows;
};

export const getClienteByIdModel = async (cedulaId) => {
  const [rows] = await dbPool.execute(
    `SELECT CedulaId, NombreCompleto, CorreoElectronico FROM usuarios WHERE CedulaId = ?`,
    [cedulaId]
  );
  return rows[0];
};

export const getPedidoClienteByIdModel = async (pedidoId) => {
  const [rows] = await dbPool.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega
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
  metodo_pago = "transferencia",
  voucher = null,
  nombre_recibe = null,
  telefono_entrega = null,
  direccion_entrega = null,
}) => {
  const PedidoClienteId = uuidv4();

  await dbPool.execute(
    `
    INSERT INTO pedidosclientes 
    (PedidoClienteId, ClienteId, FechaRegistro, Total, Estado, MetodoPago, Voucher, NombreRecibe, TelefonoEntrega, DireccionEntrega)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      PedidoClienteId,
      ClienteId,
      FechaRegistro,
      Total,
      "pendiente",
      metodo_pago,
      voucher,
      nombre_recibe,
      telefono_entrega,
      direccion_entrega
    ]
  );

  const [rows] = await dbPool.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega
    FROM pedidosclientes p
    JOIN usuarios u ON p.ClienteId = u.CedulaId
    WHERE p.PedidoClienteId = ?
    `,
    [PedidoClienteId]
  );

  return rows[0];
};

export const updatePedidoClienteModel = async (id, data) => {
  const allowedFields = [
    'ClienteId',
    'FechaRegistro',
    'Total',
    'Estado',
    'MetodoPago',
    'Voucher',
    'NombreRecibe',
    'TelefonoEntrega',
    'DireccionEntrega',
  ];

  const fields = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  const query = `
    UPDATE pedidosclientes
    SET ${fields.join(', ')}
    WHERE PedidoClienteId = ?
  `;

  values.push(id);

  const [result] = await dbPool.execute(query, values);
  return result;
};

export const deletePedidoClienteModel = async (id) => {
  const [result] = await dbPool.execute(
    "DELETE FROM pedidosclientes WHERE PedidoClienteId = ?",
    [id]
  );
  return result;
};