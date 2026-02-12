import { dbPool } from '../lib/db.js';

export const getAllColoresDB = async () => {
  const [rows] = await dbPool.query(
    "SELECT ColorId, Nombre, Hex FROM Colores ORDER BY Nombre"
  );
  return rows;
};

export const getColoresByProductoId = async (ProductoId) => {
  const [rows] = await dbPool.query(`
    SELECT c.ColorId, c.Nombre, c.Hex
    FROM ProductoColores pc
    JOIN Colores c ON c.ColorId = pc.ColorId
    WHERE pc.ProductoId = ?
  `, [ProductoId]);

  return rows;
};

export const setColoresProducto = async (ProductoId, colores) => {
  await dbPool.query(
    "DELETE FROM ProductoColores WHERE ProductoId = ?",
    [ProductoId]
  );

  const values = colores.map(ColorId => [ProductoId, ColorId]);

  await dbPool.query(
    "INSERT INTO ProductoColores (ProductoId, ColorId) VALUES ?",
    [values]
  );
};

