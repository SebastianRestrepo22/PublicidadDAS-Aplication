import { useState, useEffect } from "react";
import {
  getAllCompras,
  getAllProductos,
  getAllProveedores,
  updateCompraEstado  // Asegúrate de importar esta función
} from "../services/services.compras";
import { toast } from "react-toastify";

// Constantes para los estados
export const ESTADOS_COMPRA = {
  PENDIENTE: 'pendiente',
  ORDEN_ENVIADA: 'orden_enviada',
  RECIBIDO: 'recibido',
  ANULADA: 'anulada'
};

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalogos = async () => {
    setLoading(true);
    try {
      const [resProductos, resProveedores] = await Promise.all([
        getAllProductos().catch(err => {
          console.error("Error cargando productos:", err);
          toast.warning("No se pudieron cargar los productos.");
          return [];
        }),
        getAllProveedores().catch(err => {
          console.error("Error cargando proveedores:", err);
          toast.warning("No se pudieron cargar los proveedores.");
          return [];
        })
      ]);
      setProductos(resProductos || []);
      setProveedores(resProveedores || []);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
      toast.error("Error al cargar datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompras = async () => {
    try {
      const data = await getAllCompras();
      setCompras(data || []);
    } catch (err) {
      console.error("Error al cargar compras:", err);
      toast.error("No se pudieron cargar las compras");
    }
  };

  useEffect(() => {
    fetchCatalogos();
    fetchCompras();
  }, []);

  const actualizarEstado = async (idCompra, nuevoEstado, productosAActualizar = null, motivo = "") => {
    try {
      console.log("Actualizando estado:", { idCompra, nuevoEstado, motivo }); // LOG PARA DEBUG
      
      const result = await updateCompraEstado(idCompra, nuevoEstado, {
        productos: productosAActualizar,
        motivoCancelacion: motivo
      });
      
      console.log("Respuesta del servidor:", result); // LOG PARA DEBUG
      
      // Actualizar la compra en el estado local
      setCompras((prev) =>
        prev.map((c) =>
          c.CompraId === idCompra ? { ...c, Estado: nuevoEstado, MotivoCancelacion: motivo } : c
        )
      );
      
      // Si se actualizó el inventario, recargar productos
      if (nuevoEstado === ESTADOS_COMPRA.RECIBIDO) {
        await fetchCatalogos();
      }
      
      toast.success(result.message || 'Estado actualizado correctamente');
      return result;
    } catch (err) {
      console.error("Error detallado al actualizar estado:", err);
      console.error("Respuesta del error:", err.response?.data); // LOG PARA DEBUG
      toast.error(err.response?.data?.error || "Error al actualizar estado");
      throw err;
    }
  };

  const puedeCambiarEstado = (estadoActual, nuevoEstado) => {
    const flujoEstados = {
      [ESTADOS_COMPRA.PENDIENTE]: [ESTADOS_COMPRA.ORDEN_ENVIADA, ESTADOS_COMPRA.ANULADA],
      [ESTADOS_COMPRA.ORDEN_ENVIADA]: [ESTADOS_COMPRA.RECIBIDO, ESTADOS_COMPRA.ANULADA],
      [ESTADOS_COMPRA.RECIBIDO]: [],
      [ESTADOS_COMPRA.ANULADA]: []
    };
    
    return flujoEstados[estadoActual]?.includes(nuevoEstado) || false;
  };

  return {
    compras,
    productos,
    proveedores,
    loading,
    ESTADOS_COMPRA,
    fetchCompras,
    fetchCatalogos,
    actualizarEstado,
    puedeCambiarEstado,
    setCompras
  };
};