import { v4 as uuidv4 } from 'uuid';
import { dbPool } from '../lib/db.js';

const sanitize = (v) => (v === undefined ? null : v);

// ========== FUNCIONES EXISTENTES ==========

// Obtener todos los proveedores (sin paginación)
export const getAllProveedores = async () => {
  const [rows] = await dbPool.query('SELECT * FROM Proveedores ORDER BY NombreProveedor');
  return rows;
};

// Obtener proveedor por ID
export const getProveedorById = async (id) => {
  const [rows] = await dbPool.query(
    'SELECT * FROM Proveedores WHERE ProveedorId = ?',
    [id]
  );
  return rows[0];
};

export const createProveedor = async ({ ProveedorId, nombreProveedor, nit, telefono, correo, direccion, estado }) => {
  await dbPool.query(
    `INSERT INTO Proveedores 
    (ProveedorId, NombreProveedor, Nit, Telefono, Correo, Direccion, Estado) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [ProveedorId, nombreProveedor, nit, telefono, correo, direccion, estado]
  );
  return { ProveedorId, nombreProveedor, nit, telefono, correo, direccion, estado };
};

// Eliminar un proveedor
export const deleteProveedor = async (id) => {
  const [result] = await dbPool.query(
    'DELETE FROM Proveedores WHERE ProveedorId = ?',
    [id]
  );
  return result;
};

export const updateProveedor = async (id, data) => {
  const { nombreProveedor, nit, telefono, correo, direccion, estado } = data;

  const [result] = await dbPool.query(
    `UPDATE Proveedores
    SET NombreProveedor = ?, Nit = ?, Telefono = ?, Correo = ?, Direccion = ?, Estado = ?
    WHERE ProveedorId = ?`,
    [
      sanitize(nombreProveedor),
      sanitize(nit),
      sanitize(telefono),
      sanitize(correo),
      sanitize(direccion),
      sanitize(estado),
      id
    ]
  );

  return result;
};


// Obtener proveedores con paginación y filtros
export const getProveedoresPaginated = async ({ 
  page = 1, 
  limit = 10, 
  filtroCampo = null, 
  filtroValor = null 
}) => {
  const offset = (page - 1) * limit;
  let whereClause = '';
  let params = [];

  if (filtroCampo && filtroValor) {
    const campoMap = {
      id: 'ProveedorId',
      nombre: 'NombreProveedor',
      nit: 'Nit', // Agregar NIT
      telefono: 'Telefono',
      correo: 'Correo',
      direccion: 'Direccion',
      estado: 'Estado'
    };

    const columna = campoMap[filtroCampo] || filtroCampo;

    if (columna === 'ProveedorId') {
      whereClause = 'WHERE ProveedorId = ?';
      params.push(filtroValor);
    } else if (columna === 'Estado') {
      const valorNormalizado = filtroValor.toLowerCase() === 'activo' ? 1 : 
                               filtroValor.toLowerCase() === 'inactivo' ? 0 : filtroValor;
      whereClause = 'WHERE Estado = ?';
      params.push(valorNormalizado);
    } else {
      whereClause = `WHERE ${columna} LIKE ?`;
      params.push(`%${filtroValor}%`);
    }
  }

  const [rows] = await dbPool.query(
    `SELECT * FROM Proveedores ${whereClause} ORDER BY NombreProveedor LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countResult] = await dbPool.query(
    `SELECT COUNT(*) as total FROM Proveedores ${whereClause}`,
    params
  );

  return {
    data: rows,
    totalItems: countResult[0].total,
    currentPage: Number(page),
    itemsPerPage: Number(limit)
  };
};

// Buscar proveedores con paginación
export const buscarProveedoresPaginated = async ({ page, limit, columna, valor }) => {
  return await getProveedoresPaginated({ 
    page, 
    limit, 
    filtroCampo: columna, 
    filtroValor: valor 
  });
};