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

    const PERMISOS_SISTEMA = [
        // Dashboard / Gráficos
        { Nombre: 'ver_dashboard', Descripcion: 'Ver gráficos estadísticos del sistema', Modulo: 'Dashboard' },

        // Roles
        { Nombre: 'ver_roles', Descripcion: 'Ver lista de roles', Modulo: 'Roles' },
        { Nombre: 'gestionar_roles', Descripcion: 'Crear, editar o eliminar roles', Modulo: 'Roles' },

        // Usuarios
        { Nombre: 'ver_usuarios', Descripcion: 'Ver lista de usuarios', Modulo: 'Usuarios' },
        { Nombre: 'gestionar_usuarios', Descripcion: 'Crear, editar o eliminar usuarios', Modulo: 'Usuarios' },

        // Categorías
        { Nombre: 'ver_categorias', Descripcion: 'Ver lista de categorías', Modulo: 'Categorias' },
        { Nombre: 'gestionar_categorias', Descripcion: 'Crear, editar o eliminar categorías', Modulo: 'Categorias' },

        // Productos
        { Nombre: 'ver_productos', Descripcion: 'Ver lista de productos', Modulo: 'Productos' },
        { Nombre: 'gestionar_productos', Descripcion: 'Crear, editar o eliminar productos', Modulo: 'Productos' },

        // Servicios
        { Nombre: 'ver_servicios', Descripcion: 'Ver lista de servicios', Modulo: 'Servicios' },
        { Nombre: 'gestionar_servicios', Descripcion: 'Crear, editar o eliminar servicios', Modulo: 'Servicios' },

        // Insumos
        { Nombre: 'ver_proveedores', Descripcion: 'Ver lista de proveedores', Modulo: 'Insumos' },
        { Nombre: 'gestionar_proveedores', Descripcion: 'Crear, editar o eliminar proveedores', Modulo: 'Insumos' },
        { Nombre: 'ver_compras', Descripcion: 'Ver lista de compras', Modulo: 'Insumos' },
        { Nombre: 'gestionar_compras', Descripcion: 'Registrar o modificar compras', Modulo: 'Insumos' },
        { Nombre: 'ver_insumos', Descripcion: 'Ver lista de insumos', Modulo: 'Insumos' },
        { Nombre: 'gestionar_insumos', Descripcion: 'Registrar o modificar insumos', Modulo: 'Insumos' },

        // Ventas
        { Nombre: 'ver_pedidos', Descripcion: 'Ver lista de pedidos de clientes', Modulo: 'Ventas' },
        { Nombre: 'gestionar_pedidos', Descripcion: 'Actualizar estado de pedidos', Modulo: 'Ventas' },
        { Nombre: 'ver_ventas', Descripcion: 'Ver lista de ventas', Modulo: 'Ventas' },
        { Nombre: 'gestionar_ventas', Descripcion: 'Actualizar ventas o generar facturas', Modulo: 'Ventas' }
    ];


    for (const permiso of PERMISOS_SISTEMA) {
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