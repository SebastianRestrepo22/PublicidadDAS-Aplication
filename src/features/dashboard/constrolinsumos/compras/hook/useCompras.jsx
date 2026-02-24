import { useState, useEffect } from "react";
import {
  getAllCompras,
  getAllProductos,
  getAllProveedores,
  updateCompra
} from "../services/services.compras";
import { toast } from "react-toastify";

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadoActivo, setEstadoActivo] = useState({});

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
      const estados = {};
      (data || []).forEach((c) => {
        estados[c.CompraId] = Number(c.Estado) === 1 ? 1 : 0;
      });
      setEstadoActivo(estados);
    } catch (err) {
      console.error("Error al cargar compras:", err);
      toast.error("No se pudieron cargar las compras");
    }
  };

  useEffect(() => {
    fetchCatalogos();
    fetchCompras();
  }, []);

  const toggleEstado = async (idCompra, nuevoEstadoBoolean) => {
    const nuevoEstadoNum = nuevoEstadoBoolean ? 1 : 0;
    const compraActual = compras.find((c) => c.CompraId === idCompra);
    if (!compraActual) return;
    try {
      await updateCompra(idCompra, {
        ProveedorId: compraActual.ProveedorId,
        Total: compraActual.Total,
        FechaRegistro: compraActual.FechaRegistro,
        Estado: nuevoEstadoNum,
      });
      setEstadoActivo((prev) => ({ ...prev, [idCompra]: nuevoEstadoNum }));
      setCompras((prev) =>
        prev.map((c) =>
          c.CompraId === idCompra ? { ...c, Estado: nuevoEstadoNum } : c
        )
      );
      toast.success('Estado actualizado correctamente');
    } catch (err) {
      console.error("Error al actualizar estado", err);
      toast.error("Error al actualizar estado");
    }
  };

  return {
    compras,
    productos,
    proveedores,
    loading,
    estadoActivo,
    fetchCompras,
    fetchCatalogos,
    toggleEstado,
    setCompras,
    setEstadoActivo
  };
};