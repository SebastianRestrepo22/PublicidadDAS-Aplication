import { v4 as uuidv4 } from 'uuid';
import connectDB from '../lib/db.js';

const sanitize = (v) => (v ===  undefined ? null : v) 

// Obtener todos los proveedores
export const getAllProveedores = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM Proveedores'); 
  return rows;
};

// Obtener proveedor por ID
export const getProveedorById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT * FROM Proveedores WHERE ProveedorId = ?', 
    [id]);
  return rows[0];
};

// Crear un nuevo proveedor
export const createProveedor = async ({ nombreProveedor, telefono, correo, direccion, estado }) => {
  const connection = await connectDB();
  const proveedorId = uuidv4();

  await connection.execute(
    `INSERT INTO Proveedores 
    (ProveedorId, NombreProveedor, Telefono, Correo, Direccion, Estado) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [proveedorId, nombreProveedor, telefono, correo, direccion, estado]
  );
  return { proveedorId, nombreProveedor, telefono, correo, direccion, estado };
};

// Eliminar un proveedor
export const deleteProveedor = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    'DELETE FROM Proveedores WHERE ProveedorId = ?', 
    [id]);
  return result;
};

// Actualizar un proveedor
export const updateProveedor = async (id, data) => {
  const connection = await connectDB();

  const {nombreProveedor, telefono,  correo, direccion, estado} = data;

  const [result] = await connection.execute(
    `UPDATE Proveedores
    SET NombreProveedor = ?, Telefono = ?, Correo = ?, Direccion = ?, Estado = ?
    WHERE proveedorId = ?`,
    [
        sanitize(nombreProveedor), 
        sanitize(telefono), 
        sanitize(correo), 
        sanitize(direccion), 
        sanitize(estado ? 1 : 0), 
        id
    ]
  );

  return result;

};