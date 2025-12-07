import { connectionToDatabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';


export const getAllInsumos = async () => {
  const db = await connectionToDatabase();
  const [rows] = await db.query('SELECT * FROM Insumos'); 
  return rows;
};

export const getInsumoById = async (id) => {
  const db = await connectionToDatabase();
  const [rows] = await db.query('SELECT * FROM Insumos WHERE InsumoId = ?', [id]);
  return rows[0];
};

export const createInsumo = async ({ nombreInsumo, stock }) => {
  const db = await connectionToDatabase();
  const insumoId = uuidv4();
  await db.query(
    'INSERT INTO Insumos (InsumoId, Nombre, Stock) VALUES (?, ?, ?)',
    [insumoId, nombreInsumo, stock]
  );
  return { insumoId: insumoId, Nombre: nombreInsumo, Stock: stock};
};

export const deleteInsumo = async (id) => {
  const db = await connectionToDatabase();
  const [result] = await db.query('DELETE FROM Insumos WHERE InsumoId = ?', [id]);
  return result;
};

export const updateInsumo = async (id, { nombreInsumo, stock }) => {
  const db = await connectionToDatabase();
  const [result] = await db.query(
    'UPDATE Insumos SET Nombre = ?, Stock = ? WHERE InsumoId = ?',
    [nombreInsumo, stock, id]
  );
  return result

}


