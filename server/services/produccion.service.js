import {
  createProduccionModel,
} from "../models/produccion.model.js";

export const crearProduccionDesdePedido = async (pedidoId) => {
  return await createProduccionModel({
    PedidoClienteId: pedidoId,
    Estado: "En Proceso",
    FechaInicio: new Date(),
    FechaFin: null,
  });
};