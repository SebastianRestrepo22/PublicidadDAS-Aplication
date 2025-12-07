  import { connectDB } from '../lib/db.js';
  import { v4 as uuidv4 } from 'uuid';

  // Crear rol
  export const createRole = async (req, res) => {
    try {
      const { Nombre, Estado = 'Activo' } = req.body;

      // Validación de campos vacíos
      if (!Nombre || Nombre.trim() === '') {
        return res.status(400).json({ message: 'El nombre del rol es obligatorio' });
      }

      const RoleId = uuidv4(); // Genera UUID manualmente

      const connection = await connectDB();
      await connection.execute(
        'INSERT INTO roles (RoleId, Nombre, Estado) VALUES (?, ?, ?)',
        [RoleId, Nombre, Estado]
      );

      res.status(201).json({
        message: 'Rol creado correctamente',
        role: { RoleId, Nombre, Estado }
      });
    } catch (error) {
      console.error('Error al crear el rol:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El nombre del rol ya existe' });
      }

      res.status(500).json({ message: 'Error al crear el rol', error: error.message });
    }
  };

  // Listar todos los roles
  export const getAllRoles = async (req, res) => {
    try {
      const connection = await connectDB();
      const [roles] = await connection.execute('SELECT * FROM roles');
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los roles', error: error.message });
    }
  };

  // Obtener rol por ID
  export const getRoleById = async (req, res) => {
    try {
      const { id } = req.params;
      const connection = await connectDB();
      const [roles] = await connection.execute('SELECT * FROM roles WHERE RoleId = ?', [id]);

      if (roles.length === 0) return res.status(404).json({ message: 'Rol no encontrado' });
      res.status(200).json(roles[0]);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el rol', error: error.message });
    }
  };

  // Actualizar rol
  export const updateRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { Nombre, Estado } = req.body;

      if (!Nombre || Nombre.trim() === '') {
        return res.status(400).json({ message: 'El nombre del rol no puede estar vacío' });
      }

      const connection = await connectDB();
      const [result] = await connection.execute(
        'UPDATE roles SET Nombre = ?, Estado = ? WHERE RoleId = ?',
        [Nombre, Estado, id]
      );

      if (result.affectedRows === 0) return res.status(404).json({ message: 'Rol no encontrado' });

      res.status(200).json({
        message: 'Rol actualizado correctamente',
        role: { RoleId: id, Nombre, Estado }
      });
    } catch (error) {
      console.error('Error actualizando rol:', error);
      res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
    }
  };

  // Eliminar rol
  export const deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
      const connection = await connectDB();

      // Verifica si hay usuarios asociados a este rol
      const [users] = await connection.execute(
        'SELECT * FROM usuarios WHERE RoleId = ?',
        [id]
      );

      if (users.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar el rol porque tiene usuarios asociados'
        });
      }

      // Si no hay usuarios, elimina el rol
      await connection.execute('DELETE FROM roles WHERE RoleId = ?', [id]);
      res.status(200).json({ message: 'Rol eliminado correctamente' });

    } catch (error) {
      console.error('Error al eliminar rol:', error);
      res.status(500).json({ message: 'Error al eliminar rol' });
    }
  };


  // Cambiar estado de un rol
  export const changeState = async (req, res) => {
    const { estado } = req.body;
    const { id } = req.params;

    try {
      const connection = await connectDB();

      // Verifica si hay usuarios asociados a este rol
      const [users] = await connection.execute(
        'SELECT * FROM usuarios WHERE RoleId = ?',
        [id]
      );

      if (users.length > 0) {
        return res.status(400).json({
          message: 'No se puede cambiar el estado del rol porque tiene usuarios asociados'
        });
      }

      // Si no hay usuarios, actualiza el estado
      const [result] = await connection.execute(
        'UPDATE roles SET Estado = ? WHERE RoleId = ?',
        [estado, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }

      res.status(200).json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar estado del rol:', error);
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  };


  // Validar si el rol ya existe
  export const validarRol = async (req, res) => {
    const { rol } = req.query;

    try {
      const connection = await connectDB();
      const [roles] = await connection.execute(
        'SELECT * FROM roles WHERE Nombre = ?',
        [rol]
      );

      res.status(200).json({ exists: roles.length > 0 });
    } catch (error) {
      console.error('Error en /validar-rol:', error);
      res.status(500).json({ message: 'Error al validar rol' });
    }
  };

  //Buscar roles

  export const buscarRoles = async (req, res) => {
    const { campo, valor } = req.query;

    const columnasPermitidas = {
      id: 'RoleId',
      nombre: 'Nombre',
      estado: 'Estado',
    };

    const columna = columnasPermitidas[campo];
    if (!columna) {
      return res.status(400).json({ message: 'Campo de búsqueda inválido' });
    }

    try {
      const connection = await connectDB();
      let query = "";
      let params = [];

      if (columna === "Estado") {
        // Comparación exacta para ENUM
        query = `SELECT * FROM roles WHERE ${columna} = ?`;
        // Normalizamos para mayúscula inicial
        const valorNormalizado =
          valor.toLowerCase() === "activo" ? "Activo" :
          valor.toLowerCase() === "inactivo" ? "Inactivo" :
          valor;
        params = [valorNormalizado];
      } else {
        // Búsqueda flexible para otros campos
        query = `SELECT * FROM roles WHERE ${columna} LIKE ?`;
        params = [`%${valor}%`];
      }

      const [roles] = await connection.execute(query, params);
      res.status(200).json(roles);
    } catch (error) {
      console.error("Error al buscar roles:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  };
