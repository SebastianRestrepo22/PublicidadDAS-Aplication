import { dbPool } from '../lib/db.js';

// Crear producto
export const createService = async ({
    ServicioId,
    Nombre,
    Descripcion,
    Imagen,
    TipoPrecio,
    Precio,
    Descuento,
    CategoriaId
}) => {
    await dbPool.query(
        `INSERT INTO Servicios 
        (ServicioId, Nombre, Descripcion, Imagen, TipoPrecio, Precio, Descuento, CategoriaId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            ServicioId,
            Nombre,
            Descripcion,
            Imagen,
            TipoPrecio,
            Precio,
            Descuento,
            CategoriaId
        ]
    );
};

// Obtener servicio por ID
export const getDataServiceById = async (ServicioId) => {
    const [rows] = await dbPool.query(
        `SELECT 
            ServicioId,
            Nombre,
            Descripcion,
            Imagen,
            TipoPrecio,
            Precio,
            Descuento,
            CategoriaId,
            Estado
        FROM Servicios 
        WHERE ServicioId = ?`,
        [ServicioId]
    );
    return rows;
};

// Obtener todos los productos
export const getDataAllServcios = async () => {
    const [rows] = await dbPool.query(
        `SELECT 
            ServicioId,
            Nombre,
            Descripcion,
            Imagen,
            TipoPrecio,
            Precio,
            Descuento,
            CategoriaId,
            Estado
        FROM Servicios`
    );
    return rows;
};

// Actualizar producto
export const updateDataServicio = async ({
    ServicioId,
    Nombre,
    Descripcion,
    Imagen,
    TipoPrecio,
    Precio,
    Descuento,
    CategoriaId,
    Estado
}) => {

    if (TipoPrecio === 'POR_TAMANO') {
        Precio = null;
    }

    const [rows] = await dbPool.query(
        `UPDATE Servicios
         SET Nombre = ?, 
             Descripcion = ?, 
             Imagen = ?, 
             TipoPrecio = ?,
             Precio = ?,
             Descuento = ?, 
             CategoriaId = ?, 
             Estado = ?
         WHERE ServicioId = ?`,
        [
            Nombre,
            Descripcion,
            Imagen,
            TipoPrecio,
            Precio,
            Descuento,
            CategoriaId,
            Estado,
            ServicioId
        ]
    );

    return rows.affectedRows;
};



export const findDuplicateName = async ({ ServicioId, Nombre }) => {
    const [rows] = await dbPool.query(
        'SELECT ServicioId FROM Servicios WHERE Nombre = ? AND ServicioId != ?',
        [Nombre, ServicioId]
    );
    return rows;
};

// Eliminar producto
export const deleteDataService = async (ServicioId) => {
    await dbPool.query(
        `DELETE FROM Servicios WHERE ServicioId = ?`,
        [ServicioId]
    );
};

// Verificar si nombre de producto ya existe
export const nombreServiceExiste = async (Nombre) => {
    const [rows] = await dbPool.query(
        `SELECT * FROM Servicios WHERE Nombre = ?`,
        [Nombre]
    );
    return rows;
};

export const buscarServicioDB = async ({ columna, operador, parametro }) => {
    const columnasSeguras = [
        'Nombre',
        'Descripcion',
        'Precio',
        'Descuento',
        'CategoriaId',
        'Estado'
    ];


    if (!columnasSeguras.includes(columna)) {
        throw new Error('Columna no permitida');
    }

    const [servicios] = await dbPool.query(
        `SELECT * FROM Servicios WHERE ${columna} ${operador} ?`,
        [parametro]
    );

    return servicios;
};

export const getServiciosPaginated = async ({ 
  page = 1, 
  limit = 10, 
  filtroCampo = null, 
  filtroValor = null,
  estado = null
}) => {
  const offset = (page - 1) * limit;
  let whereConditions = [];
  let params = [];

  console.log('🔍 getServiciosPaginated - Parámetros:', { page, limit, filtroCampo, filtroValor, estado });

  // Filtro por estado
  if (estado && ['Activo', 'Inactivo'].includes(estado)) {
    whereConditions.push('Estado = ?');
    params.push(estado);
  }

  // Mapeo de campos del frontend a columnas reales
  const columnasMap = {
    nombre: 'Nombre',
    descripcion: 'Descripcion',
    precio: 'Precio',
    descuento: 'Descuento',
    categoria: 'CategoriaId',
    tipo: 'TipoPrecio'
  };

  if (filtroCampo && filtroValor && columnasMap[filtroCampo]) {
    const columnaReal = columnasMap[filtroCampo];
    const camposNumericos = ['Precio', 'Descuento'];
    const camposExactos = ['TipoPrecio', 'CategoriaId'];
    
    if (camposNumericos.includes(columnaReal)) {
      const valorNum = Number(filtroValor);
      if (!isNaN(valorNum)) {
        whereConditions.push(`${columnaReal} = ?`);
        params.push(valorNum);
      }
    } else if (camposExactos.includes(columnaReal)) {
      whereConditions.push(`${columnaReal} = ?`);
      params.push(filtroValor);
    } else {
      whereConditions.push(`${columnaReal} LIKE ?`);
      params.push(`%${filtroValor}%`);
    }
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';

  console.log('🔍 SQL Query:', `
    SELECT 
      ServicioId,
      Nombre,
      Descripcion,
      Imagen,
      TipoPrecio,
      Precio,
      Descuento,
      CategoriaId,
      Estado
    FROM Servicios
    ${whereClause}
    ORDER BY Nombre
    LIMIT ? OFFSET ?
  `);
  console.log('📊 Params:', [...params, limit, offset]);

  // 🔥 CORREGIDO: Quitamos CreatedAt y UpdatedAt que no existen
  const [servicios] = await dbPool.query(`
    SELECT 
      ServicioId,
      Nombre,
      Descripcion,
      Imagen,
      TipoPrecio,
      Precio,
      Descuento,
      CategoriaId,
      Estado
    FROM Servicios
    ${whereClause}
    ORDER BY Nombre
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  console.log('✅ Servicios encontrados:', servicios.length);
  if (servicios.length > 0) {
    console.log('✅ Primer servicio:', servicios[0]);
  }

  // Obtener total de servicios para paginación
  const [countResult] = await dbPool.query(`
    SELECT COUNT(*) as total 
    FROM Servicios
    ${whereClause}
  `, params);

  console.log('✅ Total en BD:', countResult[0]?.total);

  const totalItems = countResult[0]?.total || 0;

  return {
    data: servicios,
    totalItems: totalItems,
    currentPage: Number(page),
    itemsPerPage: Number(limit),
    totalPages: Math.ceil(totalItems / limit)
  };
};