// src/models/categorias.model.js
import connectDB from '../lib/db.js'; // ← Importación correcta en ES Modules
import { v4 as uuidv4 } from 'uuid';

export const getAllCategorias = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM Categorias');
  return rows;
};

export const getCategoriaById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM Categorias WHERE CategoriaId = ?', [id]);
  return rows[0] || null;
};

export const createCategoria = async ({ nombreCategoria, descripcion }) => {
  const connection = await connectDB();
  const categoriaId = uuidv4();
  await connection.execute(
    'INSERT INTO Categorias (CategoriaId, Nombre, Descripcion) VALUES (?, ?, ?)',
    [categoriaId, nombreCategoria, descripcion]
  );
  return { CategoriaId: categoriaId, Nombre: nombreCategoria, Descripcion: descripcion };
};

export const deleteCategoria = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute('DELETE FROM Categorias WHERE CategoriaId = ?', [id]);
  return result;
};

export const updateCategoria = async (id, { nombreCategoria, descripcion }) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    'UPDATE Categorias SET Nombre = ?, Descripcion = ? WHERE CategoriaId = ?',
    [nombreCategoria, descripcion, id]
  );
  return result;
};