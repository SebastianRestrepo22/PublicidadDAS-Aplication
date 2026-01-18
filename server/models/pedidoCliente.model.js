// src/models/pedidoCliente.model.js
import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);


export const getAllPedidosClientesModel = async (clienteId = null) => {
  const connection = await connectDB();

  let query = `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,  
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.metodo_pago,
      p.voucher,
      p.nombre_recibe,
      p.telefono_entrega,
      p.direccion_entrega
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
      p.Estado,
      p.metodo_pago,
      p.voucher,
      p.nombre_recibe,
      p.telefono_entrega,
      p.direccion_entrega
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
  const connection = await connectDB();
  const PedidoClienteId = uuidv4();

  await connection.execute(
    `
    INSERT INTO pedidosclientes 
    (PedidoClienteId, ClienteId, FechaRegistro, Total, Estado, metodo_pago, voucher, nombre_recibe, telefono_entrega, direccion_entrega)
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

  const [rows] = await connection.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      u.NombreCompleto AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.metodo_pago,
      p.voucher,
      p.nombre_recibe,
      p.telefono_entrega,
      p.direccion_entrega
    FROM pedidosclientes p
    JOIN usuarios u ON p.ClienteId = u.CedulaId
    WHERE p.PedidoClienteId = ?
    `,
    [PedidoClienteId]
  );

  return rows[0]; 
};



// src/models/pedidoCliente.model.js

export const updatePedidoClienteModel = async (id, data) => {
  const connection = await connectDB();

  // Solo actualizar campos que están definidos y no son undefined
  const allowedFields = [
    'ClienteId',
    'FechaRegistro',
    'Total',
    'Estado',
    'metodo_pago',
    'voucher',
    'nombre_recibe',
    'telefono_entrega',
    'direccion_entrega'
  ];

  const fields = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field]); // 👈 NO uses sanitize() aquí
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

  const [result] = await connection.execute(query, values);
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