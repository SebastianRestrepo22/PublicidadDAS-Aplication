import { v4 as uuidv4 } from 'uuid';
import { dbPool } from '../lib/db.js';

export const getAllInsumos = async () => {
  const [rows] = await dbPool.query('SELECT * FROM Insumos');
  return rows;
};

export const getInsumoById = async (id) => {
  const [rows] = await dbPool.query('SELECT * FROM Insumos WHERE InsumoId = ?', [id]);
  return rows[0] || null;
};

export const createInsumo = async ({ nombreInsumo, stock }) => {
  const insumoId = uuidv4();
  await dbPool.query(
    'INSERT INTO Insumos (InsumoId, Nombre, Stock) VALUES (?, ?, ?)',
    [insumoId, nombreInsumo, stock]
  );
  return { insumoId, Nombre: nombreInsumo, Stock: stock };
};

export const deleteInsumo = async (id) => {
  const [result] = await dbPool.query('DELETE FROM Insumos WHERE InsumoId = ?', [id]);
  return result;
};

export const updateInsumo = async (id, { nombreInsumo, stock }) => {
  const [result] = await dbPool.query(
    'UPDATE Insumos SET Nombre = ?, Stock = ? WHERE InsumoId = ?',
    [nombreInsumo, stock, id]
  );
  return result;
};