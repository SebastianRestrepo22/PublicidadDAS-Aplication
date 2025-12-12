import bcrypt from 'bcrypt';
import { sendResetPasswordEmail  } from '../utils/email.js';
import dayjs from "dayjs"; // para manejar expiraciones
import crypto from "crypto";
import connectDB from '../lib/db.js';

// Crear usuario
export const createUser = async (req, res) => {
    const {
        CedulaId,
        TipoDocumentoId,
        NombreCompleto,
        Telefono,
        CorreoElectronico,
        Direccion,
        Contrasena
    } = req.body;

    try {
        const connection = await connectDB();

        // Verifica si el correo ya existe
        const [existente] = await connection.execute(
            'SELECT * FROM usuarios WHERE CorreoElectronico = ?',
            [CorreoElectronico]
        );
        if (existente.length > 0) {
            return res.status(409).json({ message: 'Usuario ya existe' });
        }

        // Busca el rol "cliente"
        const [roles] = await connection.execute(
            'SELECT * FROM roles WHERE Nombre = ?',
            ['cliente']
        );
        if (roles.length === 0) {
            return res.status(400).json({ message: "Rol 'cliente' no encontrado en BD" });
        }

        const rol = roles[0];

        if (!Contrasena) {
            // Usuario creado por admin sin contraseña → enviar link de creación
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetTokenExpire = dayjs().add(1, "hour").toDate();

            await connection.execute(
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
            );
            // Enviar correo con link al frontend   
            await sendResetPasswordEmail(CorreoElectronico, resetToken);

        } 

        res.status(201).json({ message: 'Usuario creado exitosamente' });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Listar todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const connection = await connectDB();
        const [users] = await connection.execute(
            `SELECT u.*, r.Nombre AS RolNombre 
        FROM usuarios u 
        JOIN roles r ON u.RoleId = r.RoleId`
        );
        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await connectDB();
        const [users] = await connection.execute(
            `SELECT u.*, r.Nombre AS RolNombre 
        FROM usuarios u 
        JOIN roles r ON u.RoleId = r.RoleId 
        WHERE u.CedulaId = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await connectDB();

        // Traer datos actuales
        const [rows] = await connection.execute(
            'SELECT * FROM usuarios WHERE CedulaId = ?',
            [id]
        );

        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const currentUser = rows[0];

        // Crear objeto con campos actualizados
        const updatedUser = {
            TipoDocumentoId: req.body.TipoDocumentoId ?? currentUser.TipoDocumentoId,
            NombreCompleto: req.body.NombreCompleto ?? currentUser.NombreCompleto,
            Telefono: req.body.Telefono ?? currentUser.Telefono,
            CorreoElectronico: req.body.CorreoElectronico ?? currentUser.CorreoElectronico,
            Direccion: req.body.Direccion ?? currentUser.Direccion,
            RoleId: currentUser.RoleId // no se modifica
        };

        // Ejecutar update
        await connection.execute(
            `UPDATE usuarios SET TipoDocumentoId=?, NombreCompleto=?, Telefono=?, CorreoElectronico=?, Direccion=?, RoleId=? WHERE CedulaId=?`,
            [
                updatedUser.TipoDocumentoId,
                updatedUser.NombreCompleto,
                updatedUser.Telefono,
                updatedUser.CorreoElectronico,
                updatedUser.Direccion,
                updatedUser.RoleId,
                id
            ]
        );

        res.status(200).json({ message: 'Usuario actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


// Eliminar usuario
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await connectDB();
        const [result] = await connection.execute(
            'DELETE FROM usuarios WHERE CedulaId = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Validar si correo ya existe
export const validarCorreo = async (req, res) => {
    const { correo } = req.query;
    try {
        const connection = await connectDB();
        const [usuarios] = await connection.execute(
            'SELECT * FROM usuarios WHERE CorreoElectronico = ?',
            [correo]
        );

        res.status(200).json({ exists: usuarios.length > 0 });
    } catch (error) {
        console.error('Error al validar correo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Validar si la cedula ya existe
export const validarCedula = async (req, res) => {
    const { cedula } = req.query;

    try {
        const connection = await connectDB();
        const [usuarios] = await connection.execute(
            'SELECT * FROM usuarios WHERE CedulaId = ?',
            [cedula]
        );

        res.status(200).json({ exists: usuarios.length > 0 });
    } catch (error) {
        console.error('Error en /validar-cedula:', error);
        res.status(500).json({ message: 'Error al validar la cedula' });
    }
};

// Validar si el telefono ya existe
export const validarTelefono = async (req, res) => {
    const { telefono } = req.query;

    try {
        const connection = await connectDB();
        const [usuarios] = await connection.execute(
            'SELECT * FROM usuarios WHERE Telefono = ?',
            [telefono]
        );

        res.status(200).json({ exists: usuarios.length > 0 });
    } catch (error) {
        console.error('Error en /validar-telefono:', error);
        res.status(500).json({ message: 'Error al validar el telefono' });
    }
};

// Buscar usuarios
export const buscarUsuarios = async (req, res) => {
    const { campo, valor } = req.query;

    // Campos permitidos
    const columnasPermitidas = {
        id: "u.CedulaId",
        cedula: "u.CedulaId",
        nombre: "u.NombreCompleto",
        direccion: "u.Direccion",
        correo: "u.CorreoElectronico",
        telefono: "u.Telefono",
        rol: "r.Nombre",
        tipoDocumento: "td.Nombre" // 👈 Nuevo: tipo de documento
    };

    const columna = columnasPermitidas[campo];
    if (!columna) {
        return res.status(400).json({ message: "Campo de búsqueda inválido" });
    }

    try {
        const connection = await connectDB();

        const [usuarios] = await connection.execute(
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


        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al buscar usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body; 

  if (!nuevaContrasena) {
    return res.status(400).json({ message: "Debe proporcionar una nueva contraseña" });
  }

  try {
    const connection = await connectDB();
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE resetToken = ? AND resetTokenExpire > ?',
      [token, new Date()]
    );

    if (users.length === 0) return res.status(400).json({ message: "Token inválido o expirado" });

    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await connection.execute(
      'UPDATE usuarios SET Contrasena = ?, resetToken = NULL, resetTokenExpire = NULL WHERE CedulaId = ?',
      [hash, users[0].CedulaId]
    );

    res.status(200).json({ message: "Contraseña establecida correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const showResetForm = async (req, res) => {
  const { token } = req.params;

  try {
    const connection = await connectDB();
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE resetToken = ? AND resetTokenExpire > ?',
      [token, new Date()]
    );

    if (users.length === 0) {
      // Token inválido o expirado → puedes redirigir a una página de error en frontend
      return res.redirect('http://localhost:3000/reset-password-invalid');
    }

    // Redirigir al frontend pasando el token
    // Por ejemplo, tu frontend React tendría una ruta /reset-password/:token
    res.redirect(`http://localhost:3000/reset-password/${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
};