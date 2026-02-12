import { v4 as uuidv4 } from 'uuid';
import { dbPool } from '../lib/db.js';

const sanitize = (v) => (v === undefined ? null : v);

export const getAllDetallesModel = async () => {
  const [rows] = await dbPool.execute('SELECT * FROM DetalleCompras');
  return rows;
}

export const getDetalleByIdModel = async (id) => {
  const [rows] = await dbPool.execute(
    'SELECT * FROM DetalleCompras WHERE DetalleCompraId = ?',
    [id]
  );
  return rows[0];
};

export const getDetalleByCompraIdModel = async (CompraId) => {
  const [rows] = await dbPool.execute(
    'SELECT *, TipoDetalle AS TipoDetalle FROM DetalleCompras WHERE CompraId = ?',
    [CompraId]
  );
  return rows;
};

// CORREGIDO: Agregar PrecioUnitario
export const createDetalleCompra = async ({  
    CompraId,
    TipoDetalle, 
    ProductoId, 
    InsumoId,
    Cantidad, 
    Descripcion,
    PrecioUnitario  // ← AGREGAR
 }) => {
  const DetalleCompraId = uuidv4();

  await dbPool.execute(
    `INSERT INTO DetalleCompras 
    (DetalleCompraId, CompraId, TipoDetalle, ProductoId, InsumoId, Cantidad, PrecioUnitario, Descripcion) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      DetalleCompraId,
      CompraId, 
      sanitize(TipoDetalle),
      sanitize(ProductoId), 
      sanitize(InsumoId), 
      sanitize(Cantidad),
      sanitize(PrecioUnitario || 0),  // ← AGREGAR
      sanitize(Descripcion),
    ]
  );
  return { DetalleCompraId, CompraId, TipoDetalle, ProductoId, InsumoId, Cantidad, PrecioUnitario, Descripcion };
};

// CORREGIDO: Agregar PrecioUnitario
export const updateDetalleCompra = async (id, data) => {
  const { TipoDetalle, ProductoId, InsumoId, Cantidad, Descripcion, PrecioUnitario } = data;

  const [result] = await dbPool.execute(
    `UPDATE DetalleCompras
    SET TipoDetalle = ?, ProductoId = ?, InsumoId = ?, Cantidad = ?, PrecioUnitario = ?, Descripcion = ?
    WHERE DetalleCompraId = ?`,
    [
      sanitize(TipoDetalle), 
      sanitize(ProductoId), 
      sanitize(InsumoId), 
      sanitize(Cantidad), 
      sanitize(PrecioUnitario || 0),  // ← AGREGAR
      sanitize(Descripcion), 
      id
    ]
  );

  return result;
};

export const deleteDetalleCompra = async (id) => {
  const [result] = await dbPool.execute(
    'DELETE FROM DetalleCompras WHERE DetalleCompraId = ?', 
    [id]
  );
  return result;
};

// Alias para nombres que usa el controlador
export const createDetalleModel = createDetalleCompra;
export const updateDetalleModel = updateDetalleCompra;
export const deleteDetalleModel = deleteDetalleCompra;