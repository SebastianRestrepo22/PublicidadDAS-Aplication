import { dbPool } from '../lib/db.js';

// Crear producto - Ahora incluye UsaColores y Stock (opcional)
export const createProducto = async ({
  ProductoId,
  Nombre,
  Descripcion,
  Imagen,
  Precio,
  Descuento,
  CategoriaId,
  UsaColores = 0,
  Stock = null,
  Estado = 'Activo'  
}) => {
  await dbPool.query(
    `INSERT INTO Productos 
     (ProductoId, Nombre, Descripcion, Imagen, Precio, Descuento, CategoriaId, UsaColores, Stock, Estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ProductoId,
      Nombre,
      Descripcion,
      Imagen,
      Precio,
      Descuento,
      CategoriaId,
      UsaColores,
      Stock,
      Estado
    ]
  );
};

// Obtener producto por ID
export const getDataProductoById = async (ProductoId) => {
  const [rows] = await dbPool.query(
    `SELECT * 
     FROM Productos 
     WHERE ProductoId = ?`,
    [ProductoId]
  );
  return rows;
};

// Obtener todos los productos - Optimizada para el nuevo esquema
export const getDataAllProductos = async (soloActivos = false) => {
  const [rows] = await dbPool.query(`
    SELECT
      p.ProductoId,
      p.Nombre,
      p.Descripcion,
      p.Imagen,
      p.Precio,
      p.Descuento,
      p.CategoriaId,
      p.UsaColores,  -- ← Esto es un número 0 o 1
      p.Estado,
      p.Stock AS StockGeneral,
      c.ColorId,
      c.Nombre AS ColorNombre,
      c.Hex,
      COALESCE(pcs.Stock, 0) AS StockColor
    FROM Productos p
    LEFT JOIN ProductoColores pc ON pc.ProductoId = p.ProductoId
    LEFT JOIN Colores c ON c.ColorId = pc.ColorId
    LEFT JOIN ProductoColores_Stock pcs ON pcs.ProductoId = p.ProductoId AND pcs.ColorId = c.ColorId
    ${soloActivos ? "WHERE p.Estado = 'Activo'" : ""}
    ORDER BY p.Nombre
  `);
  return rows;
};

// Actualizar producto
export const updateDataProducto = async ({
  ProductoId,
  Nombre,
  Descripcion,
  Imagen,
  Precio,
  Descuento,
  CategoriaId,
  UsaColores = 0,
  Stock = null,
  Estado  
}) => {

    console.log('💾 MODELO - updateDataProducto:');
  console.log('ProductoId:', ProductoId);
  console.log('UsaColores:', UsaColores, 'Tipo:', typeof UsaColores);
  console.log('Stock:', Stock, 'Tipo:', typeof Stock);
  const campos = [];
  const valores = [];

  // Agregar solo los campos que se proporcionen
  if (Nombre !== undefined) {
    campos.push('Nombre = ?');
    valores.push(Nombre);
  }
  if (Descripcion !== undefined) {
    campos.push('Descripcion = ?');
    valores.push(Descripcion);
  }
  if (Imagen !== undefined) {
    campos.push('Imagen = ?');
    valores.push(Imagen);
  }
  if (Precio !== undefined) {
    campos.push('Precio = ?');
    valores.push(Precio);
  }
  if (Descuento !== undefined) {
    campos.push('Descuento = ?');
    valores.push(Descuento);
  }
  if (CategoriaId !== undefined) {
    campos.push('CategoriaId = ?');
    valores.push(CategoriaId);
  }
  if (UsaColores !== undefined) {
    campos.push('UsaColores = ?');
    valores.push(UsaColores);
  }
  if (Stock !== undefined) {
    campos.push('Stock = ?');
    valores.push(Stock);
  }
  if (Estado !== undefined) {
    campos.push('Estado = ?');
    valores.push(Estado);
  }

  if (campos.length === 0) {
    return 0; 
  }

  valores.push(ProductoId);

  const query = `UPDATE Productos SET ${campos.join(', ')} WHERE ProductoId = ?`;
  
  console.log('📝 Query:', query);
  console.log('📊 Valores:', valores);


  const [rows] = await dbPool.query(query, valores);

   console.log('✅ Filas afectadas:', rows.affectedRows);
  console.log('========================================');
  
  return rows.affectedRows;
};

export const findDuplicateName = async ({ ProductoId, Nombre }) => {
  const [rows] = await dbPool.query(
    'SELECT ProductoId FROM Productos WHERE Nombre = ? AND ProductoId != ?',
    [Nombre, ProductoId]
  );
  return rows;
};

// Eliminar producto
export const deleteDataProducto = async (ProductoId) => {
  const connection = await dbPool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Primero verificar que el producto esté inactivo
    const [producto] = await connection.query(
      `SELECT Estado FROM Productos WHERE ProductoId = ?`,
      [ProductoId]
    );

    if (producto.length === 0) {
      throw new Error('Producto no encontrado');
    }

    if (producto[0].Estado !== 'Inactivo') {
      throw new Error('Solo se pueden eliminar productos inactivos');
    }

    // Verificar que no tenga colores asociados
    const [colores] = await connection.query(
      `SELECT COUNT(*) as count FROM ProductoColores WHERE ProductoId = ?`,
      [ProductoId]
    );

    if (colores[0].count > 0) {
      // EN LUGAR DE LANZAR ERROR, ELIMINAR PRIMERO LAS RELACIONES
      await connection.query(
        `DELETE FROM ProductoColores_Stock WHERE ProductoId = ?`,
        [ProductoId]
      );
      
      await connection.query(
        `DELETE FROM ProductoColores WHERE ProductoId = ?`,
        [ProductoId]
      );
    }

    // Verificar otras relaciones (detallecompras, detallepedidosclientes, detalleventas)
    const [detalleCompras] = await connection.query(
      `SELECT COUNT(*) as count FROM detallecompras WHERE ProductoId = ?`,
      [ProductoId]
    );
    
    const [detallePedidos] = await connection.query(
      `SELECT COUNT(*) as count FROM detallepedidosclientes WHERE ProductoId = ?`,
      [ProductoId]
    );
    
    const [detalleVentas] = await connection.query(
      `SELECT COUNT(*) as count FROM detalleventas WHERE ProductoId = ?`,
      [ProductoId]
    );

    if (detalleCompras[0].count > 0 || detallePedidos[0].count > 0 || detalleVentas[0].count > 0) {
      throw new Error('No se puede eliminar producto con transacciones asociadas');
    }

    // Finalmente eliminar el producto
    await connection.query(
      `DELETE FROM Productos WHERE ProductoId = ?`, 
      [ProductoId]
    );

    await connection.commit();
    return { affectedRows: 1 };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Verificar si nombre de producto ya existe
export const nombreProductoExiste = async (Nombre) => {
  const [rows] = await dbPool.query(
    `SELECT * FROM Productos WHERE Nombre = ?`,
    [Nombre]
  );
  return rows;
};

export const buscarProductoDB = async ({ columna, operador, parametro }) => {
  const columnasSeguras = [
    'Nombre',
    'Descripcion',
    'Imagen',
    'Precio',
    'Descuento',
    'CategoriaId',
    'UsaColores',
    'Stock',
    'Estado'  // Agregado
  ];

  if (!columnasSeguras.includes(columna)) {
    throw new Error('Columna no permitida');
  }

  const [productos] = await dbPool.query(
    `SELECT * FROM Productos WHERE ${columna} ${operador} ?`,
    [parametro]
  );

  return productos;
};

export const getProductosPaginated = async ({ 
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

  // Mapeo de campos del frontend a columnas reales
  const columnasMap = {
    nombre: 'Nombre',
    descripcion: 'Descripcion',
    precio: 'Precio',
    descuento: 'Descuento',
    categoria: 'CategoriaId',
    stock: 'Stock',
    usacolores: 'UsaColores'
  };

  if (filtroCampo && filtroValor && columnasMap[filtroCampo]) {
    const columnaReal = columnasMap[filtroCampo];
    const camposNumericos = ['Precio', 'Descuento', 'Stock', 'UsaColores'];
    
    if (camposNumericos.includes(columnaReal)) {
      const valorNum = Number(filtroValor);
      if (!isNaN(valorNum)) {
        whereConditions.push(`${columnaReal} = ?`);
        params.push(valorNum);
      }
    } else {
      whereConditions.push(`${columnaReal} LIKE ?`);
      params.push(`%${filtroValor}%`);
    }
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}` 
    : '';

  // 🔥 PRIMERO: Obtener productos con paginación (SIN JOIN de colores)
  const [productos] = await dbPool.query(`
    SELECT 
      ProductoId,
      Nombre,
      Descripcion,
      Imagen,
      Precio,
      Descuento,
      CategoriaId,
      UsaColores,
      Estado,
      Stock AS StockGeneral
    FROM Productos
    ${whereClause}
    ORDER BY Nombre
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  // 🔥 SEGUNDO: Obtener total de productos para paginación
  const [countResult] = await dbPool.query(`
    SELECT COUNT(*) as total 
    FROM Productos
    ${whereClause}
  `, params);

  // Si no hay productos, retornar vacío
  if (productos.length === 0) {
    return {
      data: [],
      totalItems: 0,
      currentPage: Number(page),
      itemsPerPage: Number(limit),
      totalPages: 0
    };
  }

  // 🔥 TERCERO: Obtener colores SOLO para los productos de esta página
  const productoIds = productos.map(p => p.ProductoId);
  
  const [colores] = await dbPool.query(`
    SELECT 
      pc.ProductoId,
      c.ColorId,
      c.Nombre AS ColorNombre,
      c.Hex,
      COALESCE(pcs.Stock, 0) AS StockColor
    FROM ProductoColores pc
    INNER JOIN Colores c ON c.ColorId = pc.ColorId
    LEFT JOIN ProductoColores_Stock pcs ON pcs.ProductoId = pc.ProductoId AND pcs.ColorId = pc.ColorId
    WHERE pc.ProductoId IN (?)
  `, [productoIds]);

  // 🔥 CUARTO: Construir objeto de productos con sus colores
  const productosMap = {};
  
  // Inicializar productos
  productos.forEach(producto => {
    productosMap[producto.ProductoId] = {
      ProductoId: producto.ProductoId,
      Nombre: producto.Nombre,
      Descripcion: producto.Descripcion,
      Imagen: producto.Imagen,
      Precio: producto.Precio,
      Descuento: producto.Descuento,
      CategoriaId: producto.CategoriaId,
      UsaColores: parseInt(producto.UsaColores),
      Estado: producto.Estado || 'Activo',
      Stock: producto.UsaColores === 0 ? producto.StockGeneral : null,
      Colores: []
    };
  });

  // Agregar colores a los productos correspondientes
  colores.forEach(color => {
    if (productosMap[color.ProductoId]) {
      productosMap[color.ProductoId].Colores.push({
        ColorId: color.ColorId,
        Nombre: color.ColorNombre,
        Hex: color.Hex,
        Stock: color.StockColor || 0
      });
    }
  });

  const totalItems = countResult[0]?.total || 0;

  return {
    data: Object.values(productosMap),
    totalItems: totalItems,
    currentPage: Number(page),
    itemsPerPage: Number(limit),
    totalPages: Math.ceil(totalItems / limit)
  };
};