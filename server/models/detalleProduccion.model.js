// src/models/detalleProduccion.model.js
import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

export const getDetalleProduccionByProduccionIdModel = async (ProduccionId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    "SELECT * FROM detalleproduccion WHERE ProduccionId = ?",
    [ProduccionId]
  );
  return rows;
};

export const createDetalleProduccionModel = async ({
  ProduccionId,
  InsumoId,
  CantidadUsada,
}) => {
  const connection = await connectDB();
  const DetalleProduccionId = uuidv4();

  await connection.execute(
    `
    INSERT INTO detalleproduccion
    (DetalleProduccionId, ProduccionId, InsumoId, CantidadUsada)
    VALUES (?, ?, ?, ?)
    `,
    [
      DetalleProduccionId,
      ProduccionId,
      sanitize(InsumoId),
      sanitize(CantidadUsada),
    ]
  );

  return {
    DetalleProduccionId,
    ProduccionId,
    InsumoId,
    CantidadUsada,
  };
};

export const deleteDetalleProduccionModel = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    "DELETE FROM detalleproduccion WHERE DetalleProduccionId = ?",
    [id]
  );
  return result;
};