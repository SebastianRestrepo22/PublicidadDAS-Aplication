import { useState, useEffect } from "react";
import {
  getComprasPaginated,
  buscarCompras,
  getAllProductos,
  getAllProveedoresSimple
} from "../services/services.compras";
import { toast } from "react-toastify";

export const ESTADOS_COMPRA = {
  APROBADO: 'aprobado' // 🔥 Solo un estado
};

export const useCompras = () => {
  const [compras, setCompras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Estados para paginación
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroValor, setFiltroValor] = useState("");

  const fetchProductos = async () => {
    try {
      const resProductos = await getAllProductos();
      setProductos(resProductos || []);
      return resProductos;
    } catch (err) {
      console.error("Error cargando productos:", err);
      return [];
    }
  };

  const fetchProveedores = async () => {
    try {
      const resProveedores = await getAllProveedoresSimple();
      setProveedores(resProveedores || []);
      return resProveedores;
    } catch (err) {
      console.error("Error cargando proveedores:", err);
      return [];
    }
  };

  const fetchCatalogos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProductos(),
        fetchProveedores()
      ]);
    } catch (err) {
      console.error("Error cargando catálogos:", err);
      toast.error("Error al cargar datos iniciales");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompras = async () => {
    console.log("🔍 fetchCompras - INICIANDO con:", {
      currentPage,
      itemsPerPage,
      filtroCampo,
      filtroValor
    });

    try {
      let resultado;

      if (filtroCampo && filtroValor) {
        resultado = await buscarCompras(filtroCampo, filtroValor, currentPage, itemsPerPage);
      } else {
        resultado = await getComprasPaginated(currentPage, itemsPerPage);
      }

      console.log("📥 fetchCompras - RESPUESTA CRUDA:", resultado);

      if (!resultado) {
        console.error("❌ resultado es null/undefined");
        setInitialLoading(false);
        return;
      }

      // 🔥 Extraer datos y paginación
      const data = resultado?.data || [];
      const pagination = resultado?.pagination || { 
        totalItems: 0, 
        totalPages: 1, 
        currentPage, 
        itemsPerPage 
      };

      console.log("✅ fetchCompras - DATOS EXTRAÍDOS:", {
        cantidad: data.length,
        pagination
      });

      // 🔥 ACTUALIZAR ESTADOS
      setPaginatedData(data);
      setCompras(data);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);
      
      setInitialLoading(false);

    } catch (err) {
      console.error("❌ fetchCompras - ERROR:", err);
      setPaginatedData([]);
      setCompras([]);
      setTotalItems(0);
      setTotalPages(1);
      setInitialLoading(false);
    }
  };

  // 🔥 Cargar catálogos al montar
  useEffect(() => {
    fetchCatalogos();
  }, []);

  // 🔥 Cargar compras al montar el componente
  useEffect(() => {
    console.log("🔄 Cargando compras iniciales...");
    fetchCompras();
  }, []);

  // 🔥 Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroCampo, filtroValor]);

  // 🔥 Cargar compras cuando cambian: página, items por página o filtros
  useEffect(() => {
    console.log("🔄 EJECUTANDO fetchCompras POR CAMBIO EN DEPENDENCIAS");
    fetchCompras();
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor]);

  return {
    compras,
    paginatedData,
    productos,
    proveedores,
    loading,
    initialLoading,
    ESTADOS_COMPRA,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    filtroCampo,
    setFiltroCampo,
    filtroValor,
    setFiltroValor,
    fetchCompras,
    fetchProductos,
    fetchCatalogos,
    setCompras
  };
};