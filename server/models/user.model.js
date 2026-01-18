import { dbPool } from "../lib/db.js";
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
  await dbPool.query(
    `INSERT INTO usuarios 
     (CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId]
  );
};

export const getAllDataUsers = async () => {
  const [rows] = await dbPool.query(
    `SELECT u.*, r.Nombre AS RolNombre 
        FROM usuarios u 
        JOIN roles r ON u.RoleId = r.RoleId`
  );
  return rows;
}

// Buscar usuario por correo
export const getUsuarioByCorreo = async (CorreoElectronico) => {
  const [rows] = await dbPool.query(
    `SELECT u.*, r.Nombre AS RoleNombre 
     FROM usuarios u 
     JOIN roles r ON u.RoleId = r.RoleId 
     WHERE u.CorreoElectronico = ?`,
    [CorreoElectronico]
  );
  return rows[0];
};

// Buscar usuario por ID
export const getUsuarioById = async (id) => {
  const [rows] = await dbPool.query(
    `SELECT u.*, r.Nombre AS RoleNombre 
     FROM usuarios u 
     JOIN roles r ON u.RoleId = r.RoleId 
     WHERE u.CedulaId = ?`,
    [id]
  );
  return rows[0];
};

export const traerDatosActuales = async (id) => {
  const [rows] = await dbPool.query(
    'SELECT * FROM usuarios WHERE CedulaId = ?',
    [id.CedulaId]
  );
  return rows;
};

// Verificar si correo ya existe
export const correoExiste = async (correo) => {
  const [rows] = await dbPool.query(
    'SELECT * FROM usuarios WHERE CorreoElectronico = ?',
    [correo]
  );
  return rows.length > 0;
};

export const rolCliente = async () => {
  const [roles] = await dbPool.query(
    'SELECT * FROM roles WHERE Nombre = ?',
    ['cliente']
  );
  return roles;
};

export const creatByAdmin = async ({ CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, rol, resetToken, resetTokenExpire }) => {
  await dbPool.query(
    `INSERT INTO usuarios 
                     (CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId, resetToken, resetTokenExpire)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      CedulaId,
      TipoDocumentoId,
      NombreCompleto,
      Telefono,
      CorreoElectronico,
      Direccion,
      null,
      rol.RoleId,
      resetToken,
      resetTokenExpire
    ]
  )
}

export const updateDataUser = async ({ id, updatedUser }) => {
  await dbPool.query(
    `UPDATE usuarios SET TipoDocumentoId=?, NombreCompleto=?, Telefono=?, CorreoElectronico=?, Direccion=?, RoleId=? WHERE CedulaId=?`,
    [
      updatedUser.TipoDocumentoId,
      updatedUser.NombreCompleto,
      updatedUser.Telefono,
      updatedUser.CorreoElectronico,
      updatedUser.Direccion,
      updatedUser.RoleId, // Usar el RoleId actualizado
      id
    ]
  );
};

export const obtenerUsuarioActualizado = async (id) => {
  const [rows] = await dbPool.query(
    `SELECT u.*, r.Nombre AS RolNombre 
       FROM usuarios u 
       LEFT JOIN roles r ON u.RoleId = r.RoleId 
       WHERE u.CedulaId = ?`,
    [id]
  );
  return rows;
};

export const pedidosUsuarios = async (id) => {
  const [rows] = await dbPool.query(
    'SELECT * FROM pedidosclientes WHERE ClienteId = ?',
    [id]
  );
  return rows;
}

export const deleteDataUser = async (id) => {
  const [rows] = await dbPool.query(
    'DELETE FROM usuarios WHERE CedulaId = ?',
    [id]
  );
  return rows;
};

export const validarDataCedula = async (cedula) => {
  const [rows] = await dbPool.query(
    'SELECT * FROM usuarios WHERE CedulaId = ?',
    [cedula]
  );
  return rows;
};

export const telefonoExistente = async (telefono) => {
  const [rows] = await dbPool.query(
    'SELECT * FROM usuarios WHERE Telefono = ?',
    [telefono]
  );
  return rows;
}

export const buscarUsuarioData = async (columna, valor) => {
  const [rows] = await dbPool.query(
    `SELECT 
      u.*, 
      r.Nombre AS RolNombre, 
      td.Nombre AS TipoDocumentoNombre
   FROM usuarios u
   JOIN roles r ON u.RoleId = r.RoleId
   JOIN TipoDocumento td ON u.TipoDocumentoId = td.TipoDocumentoId
   WHERE ${columna} LIKE ?`,
    [`%${valor}%`]
  );
  return rows;
};

export const resetTokenModel = async (token) => {
  const [rows] = dbPool.query(
    'SELECT * FROM usuarios WHERE resetToken = ? AND resetTokenExpire > ?',
    [token, new Date()]
  );
  return rows;
};

export const hashPassword = async (hash) => {
  await dbPool.query(
    'UPDATE usuarios SET Contrasena = ?, resetToken = NULL, resetTokenExpire = NULL WHERE CedulaId = ?',
    [hash, users[0].CedulaId]
  );
};