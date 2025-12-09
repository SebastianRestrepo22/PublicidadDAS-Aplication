// src/models/insumos.model.js
import { v4 as uuidv4 } from 'uuid';
import connectDB from '../lib/db.js'; // ← .js obligatorio en ES Modules

export const getAllInsumos = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM Insumos');
  return rows;
};

export const getInsumoById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM Insumos WHERE InsumoId = ?', [id]);
  return rows[0] || null;
};

export const createInsumo = async ({ nombreInsumo, stock }) => {
  const connection = await connectDB();
  const insumoId = uuidv4();
  await connection.execute(
    'INSERT INTO Insumos (InsumoId, Nombre, Stock) VALUES (?, ?, ?)',
    [insumoId, nombreInsumo, stock]
  );
  return { insumoId, Nombre: nombreInsumo, Stock: stock };
};

export const deleteInsumo = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute('DELETE FROM Insumos WHERE InsumoId = ?', [id]);
  return result;
};

export const updateInsumo = async (id, { nombreInsumo, stock }) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    'UPDATE Insumos SET Nombre = ?, Stock = ? WHERE InsumoId = ?',
    [nombreInsumo, stock, id]
  );
  return result;
};