import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";

export const getClienteByIdModel = async (cedulaId) => {
  const [rows] = await dbPool.execute(
    `SELECT CedulaId, NombreCompleto, CorreoElectronico FROM usuarios WHERE CedulaId = ?`,
    [cedulaId]
  );
  return rows[0];
};

export const getAllPedidosClientesModel = async (clienteId = null) => {
  let query = `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      COALESCE(u.NombreCompleto, p.ClienteNombre) AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega,
      p.TipoCliente,
      p.ClienteNombre,
      p.ClienteTelefono,
      p.ClienteCorreo
    FROM pedidosclientes p
    LEFT JOIN usuarios u ON p.ClienteId = u.CedulaId
  `;

  const params = [];

  if (clienteId) {
    query += " WHERE p.ClienteId = ?";
    params.push(clienteId);
  }

  query += " ORDER BY p.FechaRegistro DESC";

  const [rows] = await dbPool.execute(query, params);
  return rows;
};

export const getPedidoClienteByIdModel = async (pedidoId) => {
  const [rows] = await dbPool.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      COALESCE(u.NombreCompleto, p.ClienteNombre) AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega,
      p.TipoCliente,
      p.ClienteNombre,
      p.ClienteTelefono,
      p.ClienteCorreo
    FROM pedidosclientes p
    LEFT JOIN usuarios u ON p.ClienteId = u.CedulaId
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
  MetodoPago = "transferencia",
  Voucher = null,
  NombreRecibe = null,
  TelefonoEntrega = null,
  DireccionEntrega = null,
  Estado = "pendiente",
  TipoCliente = "registrado",
  ClienteNombre = null,
  ClienteTelefono = null,
  ClienteCorreo = null
}) => {
  const PedidoClienteId = uuidv4();

  await dbPool.execute(
    `
    INSERT INTO pedidosclientes 
    (
      PedidoClienteId, 
      ClienteId, 
      FechaRegistro, 
      Total, 
      Estado, 
      MetodoPago, 
      Voucher, 
      NombreRecibe, 
      TelefonoEntrega, 
      DireccionEntrega,
      TipoCliente,
      ClienteNombre,
      ClienteTelefono,
      ClienteCorreo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      PedidoClienteId,
      ClienteId ?? null,
      FechaRegistro,
      Total,
      Estado,
      MetodoPago,
      Voucher ?? null,
      NombreRecibe ?? null,
      TelefonoEntrega ?? null,
      DireccionEntrega ?? null,
      TipoCliente,
      ClienteNombre ?? null,
      ClienteTelefono ?? null,
      ClienteCorreo ?? null
    ]
  );

  const [rows] = await dbPool.execute(
    `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      COALESCE(u.NombreCompleto, p.ClienteNombre) AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega,
      p.TipoCliente,
      p.ClienteNombre,
      p.ClienteTelefono,
      p.ClienteCorreo
    FROM pedidosclientes p
    LEFT JOIN usuarios u ON p.ClienteId = u.CedulaId
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

// ========================================
// NUEVAS FUNCIONES PARA PAGINACIÓN
// ========================================

export const getPedidosClientesPaginated = async ({ 
  page = 1, 
  limit = 10, 
  filtroCampo = null, 
  filtroValor = null,
  tipoPago = null 
}) => {
  const offset = (page - 1) * limit;
  let whereClause = '';
  let params = [];

  // Construir WHERE clause
  const whereConditions = [];

  if (tipoPago) {
    whereConditions.push('MetodoPago = ?');
    params.push(tipoPago);
  }

  if (filtroCampo && filtroValor) {
    let campoDB;
    // Mapear nombres de campos del frontend a la BD
    switch(filtroCampo) {
      case 'PedidoClienteId':
        campoDB = 'p.PedidoClienteId';
        break;
      case 'NombreCliente':
        campoDB = 'COALESCE(u.NombreCompleto, p.ClienteNombre)';
        break;
      case 'FechaRegistro':
        campoDB = 'p.FechaRegistro';
        break;
      case 'MetodoPago':
        campoDB = 'p.MetodoPago';
        break;
      case 'Estado':
        campoDB = 'p.Estado';
        break;
      default:
        campoDB = filtroCampo;
    }

    if (filtroCampo === 'FechaRegistro') {
      whereConditions.push(`DATE(${campoDB}) = ?`);
      params.push(filtroValor);
    } else {
      whereConditions.push(`${campoDB} LIKE ?`);
      params.push(`%${filtroValor}%`);
    }
  }

  if (whereConditions.length > 0) {
    whereClause = 'WHERE ' + whereConditions.join(' AND ');
  }

  // Consulta principal
  const query = `
    SELECT
      p.PedidoClienteId,
      p.ClienteId,
      COALESCE(u.NombreCompleto, p.ClienteNombre) AS NombreCliente,
      p.FechaRegistro,
      p.Total,
      p.Estado,
      p.MetodoPago,
      p.Voucher,
      p.NombreRecibe,
      p.TelefonoEntrega,
      p.DireccionEntrega,
      p.TipoCliente,
      p.ClienteNombre,
      p.ClienteTelefono,
      p.ClienteCorreo
    FROM pedidosclientes p
    LEFT JOIN usuarios u ON p.ClienteId = u.CedulaId
    ${whereClause}
    ORDER BY p.FechaRegistro DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await dbPool.execute(query, [...params, limit, offset]);

  // Consulta para total de registros
  const countQuery = `
    SELECT COUNT(*) as total
    FROM pedidosclientes p
    LEFT JOIN usuarios u ON p.ClienteId = u.CedulaId
    ${whereClause}
  `;

  const [countResult] = await dbPool.execute(countQuery, params);

  return {
    data: rows,
    totalItems: countResult[0].total,
    currentPage: Number(page),
    itemsPerPage: Number(limit)
  };
};

export const buscarPedidosClientesPaginated = async ({ 
  page, 
  limit, 
  columna, 
  valor,
  tipoPago 
}) => {
  return await getPedidosClientesPaginated({ 
    page, 
    limit, 
    filtroCampo: columna, 
    filtroValor: valor,
    tipoPago 
  });
};