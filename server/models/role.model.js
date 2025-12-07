import { connectDB } from '../lib/db.js';

// Obtener rol por nombre
export const getRoleByName = async (nombre) => {
  const connection = await connectDB();
  const [roles] = await connection.execute(
    'SELECT * FROM roles WHERE Nombre = ?',
    [nombre]
  );
  return roles[0]; // Devuelve el primer resultado
};

// Crear rol
export const createRole = async ({ RoleId, Nombre, Estado = 'Activo' }) => {
  const connection = await connectDB();
  await connection.execute(
    'INSERT INTO roles (RoleId, Nombre, Estado) VALUES (?, ?, ?)',
    [RoleId, Nombre, Estado]
  );
};

// Obtener todos los roles
export const getAllRoles = async () => {
  const connection = await connectDB();
  const [roles] = await connection.execute('SELECT * FROM roles');
  return roles;
};
