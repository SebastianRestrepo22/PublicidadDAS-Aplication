import axios from "axios";

const BASE_URL = "http://localhost:3000/api/ventas";
const DETALLE_URL = "http://localhost:3000/api/detalleventas";

/** ------------------ VENTAS ------------------ **/

// Listar todas las ventas
export const getVentas = async () => {
  try {
    const { data } = await axios.get(BASE_URL);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo obtener las ventas", error };
  }
};

// Obtener venta por ID
export const getVentaById = async (id) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo obtener la venta", error };
  }
};

// Crear venta con detalles
export const createVenta = async (ventaData) => {
  try {
    const { data } = await axios.post(BASE_URL, ventaData);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo crear la venta", error };
  }
};

// Actualizar venta (y opcionalmente sus detalles)
export const updateVenta = async (id, ventaData) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/${id}`, ventaData);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo actualizar la venta", error };
  }
};

// Eliminar venta
export const deleteVenta = async (id) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/${id}`);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo eliminar la venta", error };
  }
};

/** ------------------ DETALLES ------------------ **/

// Obtener detalles de una venta
export const getDetallesByVenta = async (ventaId) => {
  try {
    const { data } = await axios.get(`${DETALLE_URL}/${ventaId}`);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo obtener los detalles", error };
  }
};

// Crear un detalle de venta independiente
export const createDetalle = async (detalleData) => {
  try {
    const { data } = await axios.post(DETALLE_URL, detalleData);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo crear el detalle", error };
  }
};

// Actualizar detalle de venta
export const updateDetalle = async (detalleId, detalleData) => {
  try {
    const { data } = await axios.put(`${DETALLE_URL}/${detalleId}`, detalleData);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo actualizar el detalle", error };
  }
};

// Eliminar detalle de venta
export const deleteDetalle = async (detalleId) => {
  try {
    const { data } = await axios.delete(`${DETALLE_URL}/${detalleId}`);
    return data;
  } catch (error) {
    return { status: false, message: "No se pudo eliminar el detalle", error };
  }
};