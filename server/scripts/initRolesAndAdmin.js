import { connectDB } from '../lib/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const initRolesAndAdmin = async () => {
    const connection = await connectDB();

    // Crear roles si no existen
    const roles = ['cliente', 'administrador'];
    for (const roleName of roles) {
        const [existingRole] = await connection.execute(
            'SELECT * FROM Roles WHERE Nombre = ?',
            [roleName]
        );
        if (existingRole.length === 0) {
            await connection.execute(
                'INSERT INTO Roles (RoleId, Nombre) VALUES (?, ?)',
                [uuidv4(), roleName]
            );
            console.log(`Rol '${roleName}' creado.`);
        }
    }

    // Obtener el rol administrador
    const [adminRole] = await connection.execute(
        'SELECT * FROM Roles WHERE Nombre = ?',
        ['administrador']
    );

    // Obtener un TipoDocumento para el admin (ej: Cédula de Ciudadanía)
    const [tipoDoc] = await connection.execute(
        "SELECT TipoDocumentoId FROM TipoDocumento WHERE Nombre = 'Cédula de Ciudadanía' LIMIT 1"
    );

    // Crear usuario administrador si no existe
    const [admins] = await connection.execute(
        'SELECT * FROM Usuarios WHERE RoleId = ?',
        [adminRole[0].RoleId]
    );

    if (admins.length === 0) {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        await connection.execute(
            `INSERT INTO Usuarios 
             (CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "1000000000", 
                tipoDoc[0].TipoDocumentoId,
                'Administrador',
                '0000000000',
                'admin@gmail.com',
                'N/A',
                hash,
                adminRole[0].RoleId
            ]
        );

        console.log('Administrador inicial creado. Contraseña:', password);
    } else {
        console.log('Usuario administrador ya existe.');
    }
};
