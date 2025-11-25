import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

// ✔ TABLA REAL: pedidosclientes
export const getAllPedidosClientesModel = async () => {
    const connection = await connectDB();
    const [rows] = await connection.execute("SELECT * FROM pedidosclientes");
    return rows;
};

export const getPedidoClienteByIdModel = async (id) => {
    const connection = await connectDB();
    const [rows] = await connection.execute(
        "SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?",
        [id]
    );
    return rows[0];
};

export const createPedidoClienteModel = async ({
    ClienteId,
    FechaRegistro,
    Total,
}) => {
    const connection = await connectDB();
    const PedidoClienteId = uuidv4();

    await connection.execute(
        `
        INSERT INTO pedidosclientes 
        (PedidoClienteId, ClienteId, FechaRegistro, Total, Estado)
        VALUES (?, ?, ?, ?, ?)
        `,
        [PedidoClienteId, ClienteId, FechaRegistro, Total, "pendiente"]
    );

    return {
        PedidoClienteId,
        ClienteId,
        FechaRegistro,
        Total,
        Estado: "pendiente",
    };
};

export const updatePedidoClienteModel = async (id, data) => {
    const connection = await connectDB();
    const { ClienteId, FechaRegistro, Total, Estado } = data;

    const [result] = await connection.execute(
        `
        UPDATE pedidosclientes
        SET ClienteId = ?, FechaRegistro = ?, Total = ?, Estado = ?
        WHERE PedidoClienteId = ? 
        `,
        [
            sanitize(ClienteId),
            sanitize(FechaRegistro),
            sanitize(Total),
            sanitize(Estado),
            id,
        ]
    );

    return result;
};

export const deletePedidoClienteModel = async (id) => {
    const connection = await connectDB();
    const [result] = await connection.execute(
        "DELETE FROM pedidosclientes WHERE PedidoClienteId = ?",
        [id]
    );
    return result;
};
