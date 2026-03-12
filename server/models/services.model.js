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

  // Filtro por estado
  if (estado && ['Activo', 'Inactivo'].includes(estado)) {
    whereConditions.push('Estado = ?');
    params.push(estado);
  }

  // ... lógica de filtros ...

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';

  // 🔥 CONSULTA CON LIMIT Y OFFSET (ESTO ES PAGINACIÓN)
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

  // 🔥 CONSULTA DE TOTAL (para calcular páginas)
  const [countResult] = await dbPool.query(`
    SELECT COUNT(*) as total 
    FROM Servicios
    ${whereClause}
  `, params);

  const totalItems = countResult[0]?.total || 0;

  return {
    data: servicios,                    // SOLO los de esta página
    totalItems: totalItems,              // Total en BD
    currentPage: Number(page),
    itemsPerPage: Number(limit),
    totalPages: Math.ceil(totalItems / limit)  // Cálculo de páginas
  };
};
