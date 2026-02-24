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
    'SELECT * FROM DetalleCompras WHERE CompraId = ?',
    [CompraId]
  );
  return rows;
};

// ✅ SOLO ProductoId, eliminado InsumoId y TipoDetalle
export const createDetalleCompra = async ({  
    CompraId,
    ProductoId, 
    Cantidad, 
    Descripcion,
    PrecioUnitario
 }) => {
  const DetalleCompraId = uuidv4();

  // La tabla DetalleCompras ahora solo tiene:
  // DetalleCompraId, CompraId, ProductoId, Cantidad, PrecioUnitario, Descripcion
  await dbPool.execute(
    `INSERT INTO DetalleCompras 
    (DetalleCompraId, CompraId, ProductoId, Cantidad, PrecioUnitario, Descripcion) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      DetalleCompraId,
      CompraId, 
      sanitize(ProductoId), 
      sanitize(Cantidad),
      sanitize(PrecioUnitario || 0),
      sanitize(Descripcion),
    ]
  );
  
  return { 
    DetalleCompraId, 
    CompraId, 
    ProductoId, 
    Cantidad, 
    PrecioUnitario, 
    Descripcion 
  };
};

// ✅ Actualización solo con ProductoId
export const updateDetalleCompra = async (id, data) => {
  const { ProductoId, Cantidad, Descripcion, PrecioUnitario } = data;

  const [result] = await dbPool.execute(
    `UPDATE DetalleCompras
     SET ProductoId = ?, Cantidad = ?, PrecioUnitario = ?, Descripcion = ?
     WHERE DetalleCompraId = ?`,
    [
      sanitize(ProductoId), 
      sanitize(Cantidad), 
      sanitize(PrecioUnitario || 0),
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