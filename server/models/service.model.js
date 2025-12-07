import { connectDB } from '../lib/db.js';

// Crear producto/servicio
export const createProductoServicio = async ({
  ProductoServicioId,
  Tipo,
  Nombre,
  Descripcion,
  UrlImagen,
  Precio,
  Descuento,
  Stock,
  EsPersonalizado,
  CategoriaId
}) => {
  const connection = await connectDB();
  await connection.execute(
    `INSERT INTO ProductoServicios 
     (ProductoServicioId, Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, EsPersonalizado, CategoriaId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ProductoServicioId, Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, EsPersonalizado, CategoriaId]
  );
};

// Obtener producto/servicio por ID
export const getProductoServicioById = async (ProductoServicioId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT * 
     FROM ProductoServicios 
     WHERE ProductoServicioId = ?`,
    [ProductoServicioId]
  );
  return rows[0];
};

// Obtener todos los productos/servicios
export const getAllProductoServicios = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT * FROM ProductoServicios`
  );
  return rows;
};

// Actualizar producto/servicio
export const updateProductoServicio = async ({
  ProductoServicioId,
  Tipo,
  Nombre,
  Descripcion,
  UrlImagen,
  Precio,
  Descuento,
  Stock,
  EsPersonalizado,
  CategoriaId
}) => {
  const connection = await connectDB();
  await connection.execute(
    `UPDATE ProductoServicios
     SET Tipo = ?, Nombre = ?, Descripcion = ?, UrlImagen = ?, Precio = ?, Descuento = ?, Stock = ?, EsPersonalizado = ?, CategoriaId = ?
     WHERE ProductoServicioId = ?`,
    [Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, EsPersonalizado, CategoriaId, ProductoServicioId]
  );
};

// Eliminar producto/servicio
export const deleteProductoServicio = async (ProductoServicioId) => {
  const connection = await connectDB();
  await connection.execute(
    `DELETE FROM ProductoServicios WHERE ProductoServicioId = ?`,
    [ProductoServicioId]
  );
};

// Verificar si nombre de producto/servicio ya existe
export const nombreProductoServicioExiste = async (Nombre) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT * FROM ProductoServicios WHERE Nombre = ?`,
    [Nombre]
  );
  return rows.length > 0;
};
