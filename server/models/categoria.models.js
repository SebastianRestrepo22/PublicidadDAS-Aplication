import { connectionToDatabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';


export const getAllCategorias = async () => {
  const db = await connectionToDatabase();
  const [rows] = await db.query('SELECT * FROM Categorias'); 
  return rows;
};

export const getCategoriaById = async (id) => {
  const db = await connectionToDatabase();
  const [rows] = await db.query('SELECT * FROM Categorias WHERE CategoriaId = ?', [id]);
  return rows[0];
};

export const createCategoria = async ({ nombreCategoria, descripcion }) => {
  const db = await connectionToDatabase();
  const categoriaId = uuidv4();
  await db.query(
    'INSERT INTO Categorias (CategoriaId, Nombre, Descripcion) VALUES (?, ?, ?)',
    [categoriaId, nombreCategoria, descripcion]
  );
  return { CategoriaId: categoriaId, Nombre: nombreCategoria, Descripcion: descripcion};
};

export const deleteCategoria = async (id) => {
  const db = await connectionToDatabase();
  const [result] = await db.query('DELETE FROM Categorias WHERE CategoriaId = ?', [id]);
  return result;
};

export const updateCategoria = async (id, { nombreCategoria, descripcion }) => {
  const db = await connectionToDatabase();
  const [result] = await db.query(
    'UPDATE Categorias SET Nombre = ?, Descripcion = ? WHERE CategoriaId = ?',
    [nombreCategoria, descripcion, id]
  );
  return result


}
