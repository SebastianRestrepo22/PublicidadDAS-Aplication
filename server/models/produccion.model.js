import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

export const getAllProduccionModel = async () => {
    const connection = await connectDB();
    const [rows] = await connection.execute("SELECT * FROM produccion");
    return rows;
};

export const getProduccionByIdModel = async (id) => {
    const connection = await connectDB();
    const [rows] = await connection.execute(
        "SELECT * FROM produccion WHERE ProduccionId = ?",
        [id]
    );
    return rows[0];
};

export const createProduccionModel = async ({
    PedidoClienteId,
    Estado,
    FechaInicio,
    FechaFin,
}) => {
    const connection = await connectDB();
    const ProduccionId = uuidv4();

    await connection.execute(
        `
        INSERT INTO produccion 
        (ProduccionId, PedidoClienteId, Estado, FechaInicio, FechaFin )
        VALUES (?, ?, ?, ?, ?)
        `,
        [   
            ProduccionId, 
            sanitize(PedidoClienteId), 
            sanitize(Estado), 
            sanitize(FechaInicio),
            sanitize(FechaFin),
        ]
    );

    return {
        ProduccionId,
        PedidoClienteId,
        Estado,
        FechaInicio,
        FechaFin,
    };
};

export const updateProduccionModel = async (id, data) => {
    const connection = await connectDB();
    const { PedidoClienteId, Estado, FechaInicio, FechaFin, } = data;

    const [result] = await connection.execute(
        `
        UPDATE produccion
        SET PedidoClienteId = ?, Estado = ?, FechaInicio = ?, FechaFin = ?, 
        WHERE ProduccionId = ? 
        `,
        [
            sanitize(PedidoClienteId),
            sanitize(Estado),
            sanitize(FechaInicio),
            sanitize(FechaFin),
            id,
        ]
    );

    return result;
};

export const deleteProduccionModel = async (id) => {
    const connection = await connectDB();
    const [result] = await connection.execute(
        "DELETE FROM produccion WHERE ProduccionId = ?",
        [id]
    );
    return result;
};
