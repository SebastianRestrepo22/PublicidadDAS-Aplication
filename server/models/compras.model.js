import { v4 as uuidv4 } from 'uuid';
import connectDB from '../lib/db.js';

const sanitize = (v) => (v ===  undefined ? null : v) 

// Obtener todos los proveedores
export const getAllCompras = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM Compras'); 
  return rows;
};

// Obtener compra por ID
export const getCompraById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT * FROM Compras WHERE CompraId = ?', 
    [id]);
  return rows[0];
};

export const createCompra = async ({ ProveedorId, Total, FechaRegistro, Estado }) => {
  const connection = await connectDB();
  const CompraId = uuidv4();

  await connection.execute(
    `INSERT INTO Compras 
    (CompraId, ProveedorId, Total, FechaRegistro, Estado) 
    VALUES (?, ?, ?, ?, ?)`,
    [CompraId, sanitize(ProveedorId), sanitize(Total), sanitize(FechaRegistro), sanitize(Estado ? 1 : 0)]
  );
  return { CompraId, ProveedorId, Total, FechaRegistro, Estado };
};

//
export const deleteCompra = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    'DELETE FROM Compras WHERE CompraId = ?', 
    [id]);
  return result;
};

// Actualizar 
export const updateCompra = async (id, data) => {
  const connection = await connectDB();

  const { ProveedorId, Total, FechaRegistro, Estado} = data;

  const [result] = await connection.execute(
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
