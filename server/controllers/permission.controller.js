// controllers/permission.controller.js
export const getAllPermissions = async (req, res) => {
  try {
    const connection = await connectDB();
    const [permisos] = await connection.execute('SELECT * FROM permisos ORDER BY Modulo, Nombre');
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener permisos' });
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();
    const [permisos] = await connection.execute(
      `SELECT p.* FROM permisos p
       JOIN rol_permisos rp ON p.PermisoId = rp.PermisoId
       WHERE rp.RoleId = ?`,
      [id]
    );
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener permisos del rol' });
  }
};

export const updateRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body; // Array de PermisoId
    
    const connection = await connectDB();
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Eliminar permisos actuales
    await connection.execute('DELETE FROM rol_permisos WHERE RoleId = ?', [id]);
    
    // Insertar nuevos permisos
    if (permisos && permisos.length > 0) {
      const values = permisos.map(permisoId => [id, permisoId]);
      await connection.query(
        'INSERT INTO rol_permisos (RoleId, PermisoId) VALUES ?',
        [values]
      );
    }
    
    await connection.commit();
    res.status(200).json({ message: 'Permisos actualizados correctamente' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: 'Error al actualizar permisos' });
  }
};