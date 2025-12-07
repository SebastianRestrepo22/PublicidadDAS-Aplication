import { connectDB } from '../lib/db.js';

// Crear usuario
export const createUsuario = async ({
  CedulaId,
  TipoDocumentoId,
  NombreCompleto,
  Telefono,
  CorreoElectronico,
  Direccion,
  Contrasena,
  RoleId
}) => {
  const connection = await connectDB();
  await connection.execute(
    `INSERT INTO usuarios 
     (CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId]
  );
};

// Buscar usuario por correo
export const getUsuarioByCorreo = async (CorreoElectronico) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT u.*, r.Nombre AS RoleNombre 
     FROM usuarios u 
     JOIN roles r ON u.RoleId = r.RoleId 
     WHERE u.CorreoElectronico = ?`,
    [CorreoElectronico]
  );
  return rows[0];
};

// Buscar usuario por ID
export const getUsuarioById = async (CedulaId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT u.*, r.Nombre AS RoleNombre 
     FROM usuarios u 
     JOIN roles r ON u.RoleId = r.RoleId 
     WHERE u.CedulaId = ?`,
    [CedulaId]
  );
  return rows[0];
};

// Verificar si correo ya existe
export const correoExiste = async (CorreoElectronico) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT * FROM usuarios WHERE CorreoElectronico = ?',
    [CorreoElectronico]
  );
  return rows.length > 0;
};
