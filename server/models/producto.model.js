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
export const getDataAllProductos = async () => {
  const [rows] = await dbPool.query(`
    SELECT
      p.ProductoId,
      p.Nombre,
      p.Descripcion,
      p.Imagen,
      p.Precio,
      p.Descuento,
      p.CategoriaId,
      p.UsaColores,
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
    WHERE p.Estado = 'Activo'  -- Filtro opcional
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
  
  const [rows] = await dbPool.query(query, valores);
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
// Eliminar producto (solo si está inactivo y sin relaciones)
export const deleteDataProducto = async (ProductoId) => {
  // Primero verificar que el producto esté inactivo
  const [producto] = await dbPool.query(
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
  const [colores] = await dbPool.query(
    `SELECT COUNT(*) as count FROM ProductoColores WHERE ProductoId = ?`,
    [ProductoId]
  );

  if (colores[0].count > 0) {
    throw new Error('No se puede eliminar producto con colores asociados');
  }

  await dbPool.query(`DELETE FROM Productos WHERE ProductoId = ?`, [ProductoId]);
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