// src/models/cita.model.js
import connectDB from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

// Helper para normalizar time a HH:mm
function normalizeTime(time) {
  if (!time) return null;
  if (time.length >= 5) return time.substring(0, 5); // '14:30:00' → '14:30'
  return time;
}

export const getAllCitas = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM citas ORDER BY date ASC, time ASC');
  return rows;
};

export const getCitaById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM citas WHERE citaId = ?', [id]);
  return rows[0] || null;
};

export const createCita = async ({ title, description, date, time, client, service, status, priority }) => {
  const connection = await connectDB();
  const normTime = normalizeTime(time);

  const [exists] = await connection.execute(
    'SELECT citaId FROM citas WHERE date = ? AND SUBSTRING(time, 1, 5) = ?',
    [date, normTime]
  );

  if (exists.length > 0) return { error: 'duplicate' };

  const citaId = uuidv4();
  await connection.execute(
    `INSERT INTO citas 
    (citaId, title, description, date, time, client, service, status, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [citaId, title, description, date, time, client, service, status, priority]
  );

  return { citaId };
};

export const updateCita = async (id, { title, description, date, time, client, service, status, priority }) => {
  const connection = await connectDB();
  const normTime = normalizeTime(time);

  const [exists] = await connection.execute(
    'SELECT citaId FROM citas WHERE date = ? AND SUBSTRING(time, 1, 5) = ? AND citaId <> ?',
    [date, normTime, id]
  );

  if (exists.length > 0) return { error: 'duplicate' };

  const [result] = await connection.execute(
    `UPDATE citas SET 
      title = ?, description = ?, date = ?, time = ?, client = ?,
      service = ?, status = ?, priority = ?
     WHERE citaId = ?`,
    [title, description, date, time, client, service, status, priority, id]
  );

  return result;
};

export const deleteCita = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute('DELETE FROM citas WHERE citaId = ?', [id]);
  return result;
};