import { v4 as uuidv4 } from 'uuid';
import { dbPool } from '../lib/db.js';

const sanitize = (v) => (v === undefined ? null : v);

// ========== FUNCIONES EXISTENTES ==========

// Obtener todas las compras (sin paginación)
export const getAllCompras = async () => {
  const [rows] = await dbPool.execute('SELECT * FROM Compras ORDER BY FechaRegistro DESC'); 
  return rows;
};

// Obtener compra por ID
export const getCompraById = async (id) => {
  const [rows] = await dbPool.execute(
    'SELECT * FROM Compras WHERE CompraId = ?', 
    [id]);
  return rows[0];
};

// Crear compra
export const createCompra = async ({ ProveedorId, Total, FechaRegistro, Estado }) => {
  const CompraId = uuidv4();

  await dbPool.execute(
    `INSERT INTO Compras 
    (CompraId, ProveedorId, Total, FechaRegistro, Estado) 
    VALUES (?, ?, ?, ?, ?)`,
    [CompraId, sanitize(ProveedorId), sanitize(Total), sanitize(FechaRegistro), Estado || 'pendiente']
  );
  return { CompraId, ProveedorId, Total, FechaRegistro, Estado };
};

// Eliminar compra
export const deleteCompra = async (id) => {
  const [result] = await dbPool.execute(
    'DELETE FROM Compras WHERE CompraId = ?', 
    [id]);
  return result;
};

// Actualizar compra completa
export const updateCompra = async (id, data) => {
  const { ProveedorId, Total, FechaRegistro, Estado, MotivoCancelacion } = data;

  const [result] = await dbPool.execute(
    `UPDATE Compras
    SET ProveedorId = ?, Total = ?, FechaRegistro = ?, Estado = ?, MotivoCancelacion = ?
    WHERE CompraId = ?`,
    [
        sanitize(ProveedorId), 
        sanitize(Total), 
        sanitize(FechaRegistro), 
        Estado,
        sanitize(MotivoCancelacion),
        id
    ]
  );

  return result;
};

// Actualizar solo el estado de la compra
export const updateCompraEstado = async (id, estado, motivoCancelacion = null) => {
  const [result] = await dbPool.execute(
    `UPDATE Compras
    SET Estado = ?, MotivoCancelacion = ?
    WHERE CompraId = ?`,
    [estado, sanitize(motivoCancelacion), id]
  );

  return result;
};

// Obtener detalles de una compra
export const getDetallesByCompraId = async (compraId) => {
  const [rows] = await dbPool.execute(
    'SELECT * FROM DetalleCompras WHERE CompraId = ?',
    [compraId]
  );
  return rows;
};

// Actualizar stock de un producto
export const actualizarStockProducto = async (productoId, cantidad) => {
  const [producto] = await dbPool.execute(
    'SELECT Stock FROM Productos WHERE ProductoId = ?',
    [productoId]
  );

  if (producto.length === 0) {
    throw new Error(`Producto ${productoId} no encontrado`);
  }

  const stockActual = producto[0].Stock || 0;
  const nuevoStock = stockActual + cantidad;

  await dbPool.execute(
    'UPDATE Productos SET Stock = ? WHERE ProductoId = ?',
    [nuevoStock, productoId]
  );

  return { productoId, stockAnterior: stockActual, stockNuevo: nuevoStock };
};

// Obtener compras pendientes con más de 1 hora
export const getComprasPendientesExpiradas = async () => {
  const [rows] = await dbPool.execute(`
    SELECT * FROM Compras 
    WHERE Estado = 'pendiente' 
    AND FechaRegistro <= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    AND (MotivoCancelacion IS NULL OR MotivoCancelacion = '')
  `);
  return rows;
};

// Anular compra automáticamente
export const anularCompraAutomatica = async (id, motivo) => {
  const [result] = await dbPool.execute(
    `UPDATE Compras
     SET Estado = 'anulada', 
         MotivoCancelacion = ?
     WHERE CompraId = ? AND Estado = 'pendiente'`,
    [motivo, id]
  );
  return result;
};

// Verificar si una compra puede anularse automáticamente
export const puedeAnularseAutomaticamente = async (id) => {
  const [rows] = await dbPool.execute(`
    SELECT * FROM Compras 
    WHERE CompraId = ? 
    AND Estado = 'pendiente' 
    AND FechaRegistro <= DATE_SUB(NOW(), INTERVAL 1 HOUR)
  `, [id]);
  return rows.length > 0;
};

// Obtener compras con paginación y filtros
export const getComprasPaginated = async ({ 
  page = 1, 
  limit = 10, 
  filtroCampo = null, 
  filtroValor = null,
  sortBy = 'FechaRegistro',
  sortOrder = 'DESC'
}) => {
  // 🔥 Calcular offset y asegurar que sean ENTEROS válidos
  const offset = (page - 1) * limit;
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const offsetNum = Math.max(0, parseInt(offset, 10) || 0);
  
  let whereClause = '';
  let params = [];
  let countParams = [];

  console.log("🔍 getComprasPaginated - Parámetros de entrada:", { page, limit, filtroCampo, filtroValor, sortBy, sortOrder });

  // Construir cláusula WHERE si hay filtros
  if (filtroCampo && filtroValor && filtroValor.trim() !== '') {
    const campoMap = {
      id: 'CompraId',
      proveedor: 'ProveedorId',
      fecha: 'FechaRegistro',
      estado: 'Estado',
      total: 'Total'
    };

    const columna = campoMap[filtroCampo] || filtroCampo;
    const valorLimpio = filtroValor.trim();

    if (columna === 'CompraId' || columna === 'ProveedorId') {
      whereClause = `WHERE ${columna} LIKE ?`;
      params.push(`%${valorLimpio}%`);
      countParams.push(valorLimpio);
    } else if (columna === 'Estado') {
      whereClause = `WHERE ${columna} = ?`;
      params.push(valorLimpio);
      countParams.push(valorLimpio);
    } else if (columna === 'FechaRegistro') {
      whereClause = `WHERE DATE(${columna}) = ?`;
      params.push(valorLimpio);
      countParams.push(valorLimpio);
    } else if (columna === 'Total') {
      const valorNum = parseFloat(valorLimpio);
      if (!isNaN(valorNum)) {
        whereClause = `WHERE ${columna} = ?`;
        params.push(valorNum);
        countParams.push(valorNum);
      }
    } else {
      whereClause = `WHERE ${columna} LIKE ?`;
      params.push(`%${valorLimpio}%`);
      countParams.push(valorLimpio);
    }
  }

  // Validar sortOrder
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  // 🔥 Validar sortBy contra whitelist (CRÍTICO al usar query())
  const columnasPermitidas = ['CompraId', 'ProveedorId', 'FechaRegistro', 'Total', 'Estado'];
  const sortColumn = columnasPermitidas.includes(sortBy) ? sortBy : 'FechaRegistro';

  console.log("🔍 whereClause:", whereClause || "(sin filtros)");
  console.log("🔍 params:", params);
  console.log("🔍 countParams:", countParams);
  console.log("🔍 limitNum:", limitNum, "offsetNum:", offsetNum);

  try {
    // Consulta principal con LIMIT y OFFSET
    let query = `SELECT * FROM Compras ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`;
    let queryParams = [...params, limitNum, offsetNum];
    
    console.log("📝 Query principal:", query);
    console.log("📝 Query params:", queryParams);

    // 🔥 CAMBIO CLAVE: Usar query() en lugar de execute() para evitar bug de mysql2
    const [rows] = await dbPool.query(query, queryParams);

    // Consulta de conteo
    let countQuery = `SELECT COUNT(*) as total FROM Compras ${whereClause}`;
    console.log("📝 Count query:", countQuery);
    console.log("📝 Count params:", countParams);

    // 🔥 También usar query() para el conteo
    const [countResult] = countParams.length > 0 
      ? await dbPool.query(countQuery, countParams)
      : await dbPool.query(countQuery);

    console.log("✅ Filas obtenidas:", rows.length);
    console.log("✅ Total registros:", countResult[0]?.total || 0);

    return {
      data: rows,
      totalItems: countResult[0]?.total || 0,
      currentPage: page,
      itemsPerPage: limitNum
    };
  } catch (error) {
    console.error("❌ Error detallado en getComprasPaginated:", error);
    console.error("❌ SQL:", error.sql);
    console.error("❌ SQL State:", error.sqlState);
    console.error("❌ SQL Message:", error.sqlMessage);
    throw error;
  }
};

// Buscar compras con paginación
export const buscarComprasPaginated = async ({ page, limit, columna, valor }) => {
  return await getComprasPaginated({ 
    page, 
    limit, 
    filtroCampo: columna, 
    filtroValor: valor 
  });
};