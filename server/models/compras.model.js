import { v4 as uuidv4 } from 'uuid';
import { dbPool } from '../lib/db.js';

const sanitize = (v) => (v ===  undefined ? null : v) 

// Obtener todos los proveedores
export const getAllCompras = async () => {
  const [rows] = await dbPool.execute('SELECT * FROM Compras'); 
  return rows;
};

// Obtener compra por ID
export const getCompraById = async (id) => {
  const [rows] = await dbPool.execute(
    'SELECT * FROM Compras WHERE CompraId = ?', 
    [id]);
  return rows[0];
};

export const createCompra = async ({ ProveedorId, Total, FechaRegistro, Estado }) => {
  const CompraId = uuidv4();

  await dbPool.execute(
    `INSERT INTO Compras 
    (CompraId, ProveedorId, Total, FechaRegistro, Estado) 
    VALUES (?, ?, ?, ?, ?)`,
    [CompraId, sanitize(ProveedorId), sanitize(Total), sanitize(FechaRegistro), sanitize(Estado ? 1 : 0)]
  );
  return { CompraId, ProveedorId, Total, FechaRegistro, Estado };
};

//
export const deleteCompra = async (id) => {
  const [result] = await dbPool.execute(
    'DELETE FROM Compras WHERE CompraId = ?', 
    [id]);
  return result;
};

// Actualizar 
export const updateCompra = async (id, data) => {

  const { ProveedorId, Total, FechaRegistro, Estado} = data;

  const [result] = await dbPool.execute(
    `UPDATE Compras
    SET ProveedorId = ?, Total = ?, FechaRegistro = ?, Estado = ?
    WHERE CompraId = ?`,
    [
        sanitize(ProveedorId), 
        sanitize(Total), 
        sanitize(FechaRegistro), 
        sanitize(Estado ? 1 : 0), 
        id
    ]
  );

  return result;

};
