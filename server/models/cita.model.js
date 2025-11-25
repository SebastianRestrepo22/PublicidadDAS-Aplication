import { connectionToDatabase } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

// Obtener todas las citas
export const getAllCitas = async () => {
  const db = await connectionToDatabase();
  const [rows] = await db.query('SELECT * FROM citas ORDER BY date ASC, time ASC');
  return rows;
};

// Obtener cita por ID
export const getCitaById = async (id) => {
  const db = await connectionToDatabase();
  const [rows] = await db.query(
    'SELECT * FROM citas WHERE citaId = ?',
    [id]
  );
  return rows[0];
};

// Crear nueva cita
export const createCita = async ({ title, description, date, time, client, service, status, priority }) => {
  const db = await connectionToDatabase();

  // Validar duplicados
  const [exists] = await db.query(
    'SELECT * FROM citas WHERE date = ? AND time = ?',
    [date, time]
  );

  if (exists.length > 0) return { error: 'duplicate' };

  const citaId = uuidv4();

  await db.query(
    `INSERT INTO citas 
    (citaId, title, description, date, time, client, service, status, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [citaId, title, description, date, time, client, service, status, priority]
  );

  return { citaId };
};

// Actualizar cita
export const updateCita = async (id, { title, description, date, time, client, service, status, priority }) => {
  const db = await connectionToDatabase();

  // Validar duplicado excepto esta cita
  const [exists] = await db.query(
    'SELECT * FROM citas WHERE date = ? AND time = ? AND citaId <> ?',
    [date, time, id]
  );

  if (exists.length > 0) return { error: 'duplicate' };

  const [result] = await db.query(
    `UPDATE citas SET 
      title=?, description=?, date=?, time=?, client=?,
      service=?, status=?, priority=?
     WHERE citaId=?`,
    [title, description, date, time, client, service, status, priority, id]
  );

  return result;
};

// Eliminar cita
export const deleteCita = async (id) => {
  const db = await connectionToDatabase();
  const [result] = await db.query('DELETE FROM citas WHERE citaId = ?', [id]);
  return result;
};
