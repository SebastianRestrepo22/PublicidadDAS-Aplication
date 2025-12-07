import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

// ✔ TABLA REAL: detallepedidosclientes
export const getDetallePedidoByPedidoIdModel = async (PedidoClienteId) => {
    const connection = await connectDB();
    const [rows] = await connection.execute(
        "SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?",
        [PedidoClienteId]
    );
    return rows;
};

export const createDetallePedidoModel = async ({
    PedidoClienteId,
    ProductoServicioId,
    Cantidad,
    Alto,
    Ancho,
    Descripcion,
    UrlImagen,
}) => {
    const connection = await connectDB();

    const DetallePedidoClienteId = uuidv4();

    await connection.execute(
        `
        INSERT INTO detallepedidosclientes
        (DetallePedidoClienteId, PedidoClienteId, ProductoServicioId, Cantidad, Alto, Ancho, Descripcion, UrlImagen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            DetallePedidoClienteId,
            PedidoClienteId,
            sanitize(ProductoServicioId),
            sanitize(Cantidad),
            sanitize(Alto),
            sanitize(Ancho),
            sanitize(Descripcion),
            sanitize(UrlImagen),
        ]
    );

    return {
        DetallePedidoClienteId,
        PedidoClienteId,
        ProductoServicioId,
        Cantidad,
        Alto,
        Ancho,
        Descripcion,
        UrlImagen,
    };
};

export const deleteDetallePedidoModel = async (id) => {
    const connection = await connectDB();
    const [result] = await connection.execute(
        "DELETE FROM detallepedidosclientes WHERE DetallePedidoClienteId = ?",
        [id]
    );
    return result;
};
