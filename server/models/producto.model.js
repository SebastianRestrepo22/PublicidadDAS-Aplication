import { dbPool } from '../lib/db.js';

// Crear producto
export const createProducto = async ({
  ProductoId,
  Nombre,
  Descripcion,
  Imagen,
  Precio,
  Descuento,
  Stock,
  CategoriaId
}) => {
  await dbPool.query(
    `INSERT INTO Productos 
     (ProductoId, Nombre, Descripcion, Imagen, Precio, Descuento, Stock, CategoriaId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ProductoId,
      Nombre,
      Descripcion,
      Imagen,
      Precio,
      Descuento,
      Stock,
      CategoriaId
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

// Obtener todos los productos
export const getDataAllProductos = async () => {
  const [rows] = await dbPool.query(`
    SELECT
      p.ProductoId,
      p.Nombre,
      p.Descripcion,
      p.Imagen,
      p.Precio,
      p.Descuento,
      p.Stock,
      p.CategoriaId,
      c.ColorId,
      c.Nombre AS ColorNombre,
      c.Hex
    FROM Productos p
    LEFT JOIN ProductoColores pc ON pc.ProductoId = p.ProductoId
    LEFT JOIN Colores c ON c.ColorId = pc.ColorId
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
  Stock,
  CategoriaId
}) => {
  const [rows] = await dbPool.query(
    `UPDATE Productos
     SET Nombre = ?, Descripcion = ?, Imagen = ?, Precio = ?, Descuento = ?, Stock = ?, CategoriaId = ?
     WHERE ProductoId = ?`,
    [Nombre, Descripcion, Imagen, Precio, Descuento, Stock, CategoriaId, ProductoId]
  );
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
  await dbPool.query(
    `DELETE FROM Productos WHERE ProductoId = ?`,
    [ProductoId]
  );
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
    'Stock',
    'CategoriaId'
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