import { v4 as uuidv4 } from 'uuid';
import connectDB from '../lib/db.js';

const sanitize = (v) => (v ===  undefined ? null : v) 

export const getAllDetallesModel = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute('SELECT * FROM DetalleCompras');
  return rows;
}

export const getDetalleByIdModel = async (id) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT * FROM DetalleCompras WHERE DetalleCompraId = ?',
    [id]
  );
  return rows[0]
};

export const getDetalleByCompraIdModel = async (CompraId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    'SELECT *, TpoDetalle AS TipoDetalle  FROM DetalleCompras WHERE CompraId = ?',
    [CompraId]
); 
  return rows;
};

// Crear un nuevo proveedor
export const createDetalleCompra = async ({  
    CompraId,
    TipoDetalle, 
    ProductoServicioId, 
    InsumoId,
    Cantidad, 
    Descripcion
 }) => {
  const connection = await connectDB();
  const DetalleCompraId = uuidv4();

  await connection.execute(
    `INSERT INTO DetalleCompras 
    (DetalleCompraId, CompraId, TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
        DetalleCompraId,
        CompraId, 
        sanitize(TipoDetalle),
        sanitize(ProductoServicioId), 
        sanitize(InsumoId), 
        sanitize( Cantidad),
        sanitize( Descripcion),

    ]
  );
  return { DetalleCompraId, CompraId, TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion };
};

export const updateDetalleCompra = async (id, data) => {
  const connection = await connectDB();

  const { TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion} = data;

  const [result] = await connection.execute(
    `UPDATE DetalleCompras
    SET TipoDetalle = ?, ProductoServicioId = ?, InsumoId = ?, Cantidad = ?, Descripcion = ?
    WHERE DetalleCompraId = ?`,
    [
        sanitize(TipoDetalle), 
        sanitize(ProductoServicioId), 
        sanitize(InsumoId), 
        sanitize(Cantidad), 
        sanitize(Descripcion), 
        id
    ]
  );

  return result;

};

export const deleteDetalleCompra = async (id) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    'DELETE FROM DetalleCompras WHERE DetalleCompraId = ?', 
    [id]);
  return result;
};

export const createDetalleModel = createDetalleCompra;
export const updateDetalleModel = updateDetalleCompra;
export const deleteDetalleModel = deleteDetalleCompra;





