import axios from "axios";

// Recuperar el token del localStorage (o sessionStorage si usas eso)
const getAuthToken = () => {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
};

// Configurar una instancia de axios con base URL y auth automática
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token en cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// URLs
const VENTAS_URL = "/ventas";
const DETALLE_VENTAS_URL = "/detalleventas";

/** ------------------ VENTAS ------------------ **/

export const getVentas = async () => {
  try {
    const { data } = await apiClient.get(VENTAS_URL);
    return data;
  } catch (error) {
    console.error("Error en getVentas:", error.response?.data || error.message);
    return { status: false, message: "No se pudo obtener las ventas", error };
  }
};

export const getVentaById = async (id) => {
  try {
    const { data } = await apiClient.get(`${VENTAS_URL}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error en getVentaById (${id}):`, error.response?.data || error.message);
    return { status: false, message: "No se pudo obtener la venta", error };
  }
};

export const createVenta = async (ventaData) => {
  try {
    const { data } = await apiClient.post(VENTAS_URL, ventaData);
    return data;
  } catch (error) {
    console.error("Error en createVenta:", error.response?.data || error.message);
    return { status: false, message: "No se pudo crear la venta", error };
  }
};

export const updateVenta = async (id, ventaData) => {
  try {
    const { data } = await apiClient.put(`${VENTAS_URL}/${id}`, ventaData);
    return data;
  } catch (error) {
    console.error(`Error en updateVenta (${id}):`, error.response?.data || error.message);
    return { status: false, message: "No se pudo actualizar la venta", error };
  }
};

export const deleteVenta = async (id) => {
  try {
    const { data } = await apiClient.delete(`${VENTAS_URL}/${id}`);
    return data;
  } catch (error) {
    console.error(`Error en deleteVenta (${id}):`, error.response?.data || error.message);
    return { status: false, message: "No se pudo eliminar la venta", error };
  }
};

/** ------------------ DETALLES DE VENTA ------------------ **/

export const getDetallesByVenta = async (ventaId) => {
  try {
    const { data } = await apiClient.get(`${DETALLE_VENTAS_URL}/${ventaId}`);
    return data;
  } catch (error) {
    console.error(`Error en getDetallesByVenta (${ventaId}):`, error.response?.data || error.message);
    return { status: false, message: "No se pudo obtener los detalles", error };
  }
};

export const createDetalle = async (detalleData) => {
  try {
    const { data } = await apiClient.post(DETALLE_VENTAS_URL, detalleData);
    return data;
  } catch (error) {
    console.error("Error en createDetalle:", error.response?.data || error.message);
    return { status: false, message: "No se pudo crear el detalle", error };
  }
};

export const updateDetalle = async (detalleId, detalleData) => {
  try {
    const { data } = await apiClient.put(`${DETALLE_VENTAS_URL}/${detalleId}`, detalleData);
    return data;
  } catch (error) {
    console.error(`Error en updateDetalle (${detalleId}):`, error.response?.data || error.message);
    return { status: false, message: "No se pudo actualizar el detalle", error };
  }
};

export const deleteDetalle = async (detalleId) => {
  try {
    const { data } = await apiClient.delete(`${DETALLE_VENTAS_URL}/${detalleId}`);
    return data;
  } catch (error) {
    console.error(`Error en deleteDetalle (${detalleId}):`, error.response?.data || error.message);
    return { status: false, message: "No se pudo eliminar el detalle", error };
  }
};