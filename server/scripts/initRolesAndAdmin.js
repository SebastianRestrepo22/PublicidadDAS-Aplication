import connectDB from '../lib/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const initRolesAndAdmin = async () => {
    const connection = await connectDB();

    // Crear roles si no existen
    const roles = ['Cliente', 'Administrador']; // Capitalizados para consistencia
    const createdRoles = {};
    
    for (const roleName of roles) {
        const [existingRole] = await connection.execute(
            'SELECT * FROM roles WHERE Nombre = ?',
            [roleName]
        );
        
        if (existingRole.length === 0) {
            const roleId = uuidv4();
            await connection.execute(
                'INSERT INTO roles (RoleId, Nombre, Estado) VALUES (?, ?, ?)',
                [roleId, roleName, 'Activo']
            );
            console.log(`✓ Rol '${roleName}' creado.`);
            createdRoles[roleName] = roleId;
        } else {
            createdRoles[roleName] = existingRole[0].RoleId;
        }
    }

    // 1. CREAR PERMISOS BÁSICOS SI NO EXISTEN
    const permisosBasicos = [
        { Nombre: 'ver_dashboard', Descripcion: 'Ver panel de control', Modulo: 'Dashboard' },
        { Nombre: 'gestionar_roles', Descripcion: 'Gestionar roles de usuario', Modulo: 'Roles' },
        { Nombre: 'ver_roles', Descripcion: 'Ver lista de roles', Modulo: 'Roles' },
        { Nombre: 'gestionar_usuarios', Descripcion: 'Gestionar usuarios', Modulo: 'Usuarios' },
        { Nombre: 'ver_usuarios', Descripcion: 'Ver lista de usuarios', Modulo: 'Usuarios' },
        { Nombre: 'gestionar_servicios', Descripcion: 'Gestionar servicios', Modulo: 'Servicios' },
        { Nombre: 'ver_servicios', Descripcion: 'Ver servicios', Modulo: 'Servicios' },
        { Nombre: 'gestionar_proveedores', Descripcion: 'Gestionar proveedores', Modulo: 'Insumos' },
        { Nombre: 'ver_proveedores', Descripcion: 'Ver proveedores', Modulo: 'Insumos' },
        { Nombre: 'gestionar_compras', Descripcion: 'Gestionar compras', Modulo: 'Insumos' },
        { Nombre: 'ver_compras', Descripcion: 'Ver compras', Modulo: 'Insumos' },
        { Nombre: 'gestionar_insumos', Descripcion: 'Gestionar insumos', Modulo: 'Insumos' },
        { Nombre: 'ver_insumos', Descripcion: 'Ver insumos', Modulo: 'Insumos' },
        { Nombre: 'gestionar_diseno', Descripcion: 'Gestionar diseño', Modulo: 'Diseño' },
        { Nombre: 'ver_diseno', Descripcion: 'Ver diseño', Modulo: 'Diseño' },
        { Nombre: 'gestionar_pedidos', Descripcion: 'Gestionar pedidos', Modulo: 'Ventas' },
        { Nombre: 'ver_pedidos', Descripcion: 'Ver pedidos', Modulo: 'Ventas' },
        { Nombre: 'gestionar_produccion', Descripcion: 'Gestionar producción', Modulo: 'Ventas' },
        { Nombre: 'ver_produccion', Descripcion: 'Ver producción', Modulo: 'Ventas' },
        { Nombre: 'gestionar_ventas', Descripcion: 'Gestionar ventas', Modulo: 'Ventas' },
        { Nombre: 'ver_ventas', Descripcion: 'Ver ventas', Modulo: 'Ventas' },
        { Nombre: 'ver_comprobantes', Descripcion: 'Ver comprobantes', Modulo: 'Comprobantes' },
        { Nombre: 'gestionar_comprobantes', Descripcion: 'Gestionar comprobantes', Modulo: 'Comprobantes' },
        { Nombre: 'gestionar_agenda', Descripcion: 'Gestionar agenda', Modulo: 'Agenda' },
        { Nombre: 'ver_agenda', Descripcion: 'Ver agenda', Modulo: 'Agenda' },
        // Permisos específicos para cliente
        { Nombre: 'ver_productos_cliente', Descripcion: 'Ver productos como cliente', Modulo: 'Cliente' },
        { Nombre: 'hacer_pedidos', Descripcion: 'Realizar pedidos', Modulo: 'Cliente' },
        { Nombre: 'ver_mis_pedidos', Descripcion: 'Ver mis pedidos', Modulo: 'Cliente' },
        { Nombre: 'gestionar_perfil', Descripcion: 'Gestionar perfil de cliente', Modulo: 'Cliente' }
    ];

    for (const permiso of permisosBasicos) {
        const [existingPermiso] = await connection.execute(
            'SELECT * FROM permisos WHERE Nombre = ?',
            [permiso.Nombre]
        );
        
        if (existingPermiso.length === 0) {
            await connection.execute(
                'INSERT INTO permisos (PermisoId, Nombre, Descripcion, Modulo) VALUES (?, ?, ?, ?)',
                [uuidv4(), permiso.Nombre, permiso.Descripcion, permiso.Modulo]
            );
            console.log(`✓ Permiso '${permiso.Nombre}' creado.`);
        }
    }

    // 2. ASIGNAR TODOS LOS PERMISOS AL ADMINISTRADOR
    const [allPermisos] = await connection.execute('SELECT PermisoId FROM permisos');
    
    for (const permiso of allPermisos) {
        // Verificar si ya existe la asignación
        const [existingAssignment] = await connection.execute(
            'SELECT * FROM rol_permisos WHERE RoleId = ? AND PermisoId = ?',
            [createdRoles['Administrador'], permiso.PermisoId]
        );
        
        if (existingAssignment.length === 0) {
            await connection.execute(
                'INSERT INTO rol_permisos (RoleId, PermisoId) VALUES (?, ?)',
                [createdRoles['Administrador'], permiso.PermisoId]
            );
        }
    }
    console.log(`✓ ${allPermisos.length} permisos asignados al Administrador.`);

    // 3. ASIGNAR SOLO PERMISOS DE CLIENTE AL ROL CLIENTE
    const [clientePermisos] = await connection.execute(
        'SELECT PermisoId FROM permisos WHERE Modulo = "Cliente"'
    );
    
    for (const permiso of clientePermisos) {
        const [existingAssignment] = await connection.execute(
            'SELECT * FROM rol_permisos WHERE RoleId = ? AND PermisoId = ?',
            [createdRoles['Cliente'], permiso.PermisoId]
        );
        
        if (existingAssignment.length === 0) {
            await connection.execute(
                'INSERT INTO rol_permisos (RoleId, PermisoId) VALUES (?, ?)',
                [createdRoles['Cliente'], permiso.PermisoId]
            );
        }
    }
    console.log(`✓ ${clientePermisos.length} permisos asignados al Cliente.`);

    // 4. CREAR USUARIO ADMINISTRADOR SI NO EXISTE
    const [admins] = await connection.execute(
        'SELECT * FROM usuarios WHERE RoleId = ?',
        [createdRoles['Administrador']]
    );

    if (admins.length === 0) {
        // Obtener un TipoDocumento para el admin
        const [tipoDoc] = await connection.execute(
            "SELECT TipoDocumentoId FROM tipodocumento WHERE Nombre = 'Cédula de Ciudadanía' LIMIT 1"
        );
        
        const tipoDocumentoId = tipoDoc.length > 0 ? tipoDoc[0].TipoDocumentoId : null;

        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);

        await connection.execute(
            `INSERT INTO usuarios 
             (CedulaId, TipoDocumentoId, NombreCompleto, Telefono, CorreoElectronico, Direccion, Contrasena, RoleId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "1000000000", 
                tipoDocumentoId,
                'Administrador',
                '0000000000',
                'admin@gmail.com',
                'N/A',
                hash,
                createdRoles['Administrador']
            ]
        );

        console.log('✓ Administrador inicial creado.');
        console.log('  Correo: admin@gmail.com');
        console.log('  Contraseña: admin123');
        console.log('  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión.');
    } else {
        console.log('✓ Usuario administrador ya existe.');
    }

    console.log('Inicialización completada exitosamente.');
};