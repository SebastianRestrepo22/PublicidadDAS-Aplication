// src/models/cita.model.js
import connectDB from '../lib/db.js'; // ← Importación correcta
import { v4 as uuidv4 } from 'uuid';

// Obtener todas las citas
export const getAllCitas = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM citas ORDER BY date ASC, time ASC');
  return rows;
};

// Obtener cita por ID
export const getCitaById = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT * FROM citas WHERE citaId = ?',
    [id]
  );
  return rows[0] || null;
};

// Crear nueva cita
export const createCita = async ({ title, description, date, time, client, service, status, priority }) => {
  const connection = await connectDB();

  // Validar duplicados
  const [exists] = await connection.execute(
    'SELECT * FROM citas WHERE date = ? AND time = ?',
    [date, time]
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

// Actualizar cita
export const updateCita = async (id, { title, description, date, time, client, service, status, priority }) => {
  const connection = await connectDB();

  // Validar duplicado excepto esta cita
  const [exists] = await connection.execute(
    'SELECT * FROM citas WHERE date = ? AND time = ? AND citaId <> ?',
    [date, time, id]
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

// Eliminar cita
export const deleteCita = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute('DELETE FROM citas WHERE citaId = ?', [id]);
  return result;
};