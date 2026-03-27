import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getVentas, getVentaById, anularVenta, actualizarEstadoVenta, rechazarVenta } from '../services/service.ventas.js';

export const useVentas = () => {
  // Estados principales
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [openVer, setOpenVer] = useState(false);
  const [openAnular, setOpenAnular] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  // Paginación y filtros
  const [campoFiltro, setCampoFiltro] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar ventas (con filtros y paginación)
  const cargarVentas = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await getVentas(currentPage, itemsPerPage, campoFiltro, filtroValor, null, null);
      const data = resultado?.data && Array.isArray(resultado.data) ? resultado.data : [];
      const pagination = resultado?.pagination || {};
      setPaginatedData(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);
      if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) {
        setCurrentPage(pagination.totalPages);
      }
    } catch (error) {
      console.error("Error cargando ventas:", error);
      toast.error("Error al cargar las ventas");
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setCargando(false);
    }
  }, [currentPage, itemsPerPage, campoFiltro, filtroValor]);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  // Ver detalle de venta (carga completa si es necesario)
  const handleVerClick = async (venta) => {
    try {
      if (venta.detalle && venta.detalle.length > 0) {
        setVentaSeleccionada(venta);
      } else {
        const ventaCompleta = await getVentaById(venta.VentaId);
        if (!ventaCompleta) {
          toast.error('No se pudo obtener la información de la venta');
          return;
        }
        if (ventaCompleta.detalle && !Array.isArray(ventaCompleta.detalle)) {
          ventaCompleta.detalle = [ventaCompleta.detalle];
        }
        setVentaSeleccionada(ventaCompleta);
      }
      setOpenVer(true);
    } catch (error) {
      console.error("Error al cargar venta:", error);
      toast.error("Error al cargar los detalles de la venta");
    }
  };

  const handleAnularClick = (venta) => {
    setVentaSeleccionada(venta);
    setMotivoAnulacion('');
    setOpenAnular(true);
  };

  const handleRechazarClick = (venta) => {
    setVentaSeleccionada(venta);
    setMotivoRechazo('');
    setOpenRechazar(true);
  };

  const handleConfirmarRechazar = async (ventaId, motivo) => {
    try {
      const response = await rechazarVenta(ventaId, motivo);
      if (response.success) {
        toast.success("Venta rechazada correctamente");
        setOpenRechazar(false);
        setOpenVer(false);
        await cargarVentas();
      } else {
        toast.error(response.message || "Error al rechazar la venta");
      }
    } catch (error) {
      console.error("Error al rechazar venta:", error);
      toast.error(error.response?.data?.error || "Error al rechazar la venta");
    }
  };

  const handleConfirmarAnular = async (ventaId, motivo) => {
    try {
      const response = await anularVenta(ventaId, motivo);
      if (response.success) {
        toast.success("Venta anulada correctamente");
        setOpenAnular(false);
        setOpenVer(false);
        await cargarVentas();
      } else {
        toast.error(response.message || "Error al anular la venta");
      }
    } catch (error) {
      console.error("Error al anular venta:", error);
      toast.error(error.response?.data?.error || "Error al anular la venta");
    }
  };

  // Handlers de paginación
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  const handleLimpiarFiltros = () => {
    setCampoFiltro('');
    setFiltroValor('');
  };

  // Callback para actualizar venta después de cambio de estado (desde el modal)
  const handleEstadoActualizado = (ventaActualizada) => {
    if (ventaSeleccionada?.VentaId === ventaActualizada.VentaId) {
      setVentaSeleccionada(ventaActualizada);
    }
    cargarVentas();
  };

  return {
    // Estados
    ventas,
    ventaSeleccionada,
    cargando,
    openVer,
    openAnular,
    openRechazar,
    motivoAnulacion,
    motivoRechazo,
    campoFiltro,
    filtroValor,
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,

    // Setters
    setOpenVer,
    setOpenAnular,
    setOpenRechazar,
    setMotivoAnulacion,
    setMotivoRechazo,
    setCampoFiltro,
    setFiltroValor,

    // Handlers
    handleVerClick,
    handleAnularClick,
    handleRechazarClick,
    handleConfirmarRechazar,
    handleConfirmarAnular,
    handlePageChange,
    handleItemsPerPageChange,
    handleLimpiarFiltros,
    handleEstadoActualizado,
  };
};