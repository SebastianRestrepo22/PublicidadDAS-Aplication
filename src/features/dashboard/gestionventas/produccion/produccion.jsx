// src/features/dashboard/gestionventas/produccion/Produccion.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Eye, Trash2, ArrowLeft, Search, CheckCircle, Save, X } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as produccionService from "./services/services.produccion";
// Importar servicios necesarios
import { getAllPedidosClientes } from "../pedidos/services/services.pedidosClientes";
import { getAllInsumos as getAllInsumosService } from "../produccion/services/services.produccion";
import { updatePedidoCliente } from "../pedidos/services/services.pedidosClientes";
// Importar componente de paginación
import { Pagination } from "../../components/paginacion/pagination";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
  } catch {
    return dateString;
  }
};

const getShortId = (id) => {
  if (!id) return "—";
  const str = String(id);
  return str.length > 6 ? str.slice(-6) : str;
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────
export const Produccion = () => {
  const navigate = useNavigate();
  const { id, detalleIndex } = useParams();
  const location = useLocation();

  // ─── DETECCIÓN DE MODO ───────────────────────────────────────
  const mode = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/seleccionar-insumo/')) {
      return path.includes('/editar/') ? 'select-insumo-edit' : 'select-insumo';
    }
    if (path.includes('/seleccionar-pedido')) {
      return path.includes('/editar/') ? 'select-pedido-edit' : 'select-pedido';
    }
    if (path === "/dashboard/produccion/nuevo") return 'create';
    if (path.match(/\/dashboard\/produccion\/[^/]+\/editar$/)) return 'edit';
    if (path.match(/\/dashboard\/produccion\/[^/]+$/)) {
      const lastSegment = path.split('/').pop();
      if (lastSegment !== 'produccion' && lastSegment !== 'nuevo' && !lastSegment.includes('editar') && !lastSegment.includes('seleccionar')) {
        return 'view';
      }
    }
    return 'list';
  }, [location.pathname]);

  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";
  const isSelectPedidoMode = mode === "select-pedido" || mode === "select-pedido-edit";
  const isSelectInsumoMode = mode === "select-insumo" || mode === "select-insumo-edit";

  // ─── ESTADOS ─────────────────────────────────────────────────
  const [producciones, setProducciones] = useState([]);

  // 👇 Estados para paginación (reemplazan el filtrado simple)
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");

  // Estados para CREAR
  const [formCrear, setFormCrear] = useState({
    PedidoClienteId: "",
    Estado: "En Proceso",
    FechaInicio: formatDateForInput(new Date()),
    FechaFin: "",
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 },
  ]);

  // Estados para EDITAR/VER
  const [produccionDetalle, setProduccionDetalle] = useState(null);
  const [formEditar, setFormEditar] = useState(null);

  // Datos maestros
  const [pedidos, setPedidos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  // Estados de UI
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para selección
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPageSelect, setCurrentPageSelect] = useState(1);
  const itemsPerPageSelect = 4;

  // ─── FUNCIÓN AUXILIAR DE PAGINACIÓN ───────────────────────────
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // ─── CARGAR DATOS INICIALES ─────────────────────────────────
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [pedidosData, insumosData] = await Promise.all([
          getAllPedidosClientes(),
          getAllInsumosService()
        ]);
        const pedidosConfirmados = pedidosData.filter(p => p.Estado === "confirmado");
        setPedidos(pedidosConfirmados);
        setInsumos(insumosData);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        toast.error("Error al cargar datos iniciales");
      }
    };
    cargarDatosIniciales();
  }, []);

  // ─── CARGAR LISTA DE PRODUCCIONES ────────────────────────────
  const fetchProducciones = async () => {
    setLoading(true);
    try {
      const data = await produccionService.getAllProducciones();
      setAllData(data);
      setTotalItems(data.length);

      const totalPagesCalc = Math.ceil(data.length / itemsPerPage);
      setTotalPages(totalPagesCalc > 0 ? totalPagesCalc : 1);
      if (currentPage > totalPagesCalc && totalPagesCalc > 0) {
        setCurrentPage(totalPagesCalc);
      }

      const paginated = paginateData(data);
      setPaginatedData(paginated);
    } catch (err) {
      console.error("Error cargando producciones:", err);
      toast.error("Error al cargar producciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "list") {
      fetchProducciones();
    }
  }, [mode]);

  // ─── EFECTO: RECALCULAR PAGINACIÓN CUANDO CAMBIA FILTRO O PÁGINA ───────
  useEffect(() => {
    if (allData.length === 0) return;

    // Aplicar filtro
    const filtered = allData.filter((p) => {
      if (!filtroCampo || !filtroText.trim()) return true;
      const valor = String(p[filtroCampo] || "").toLowerCase();
      return valor.includes(filtroText.toLowerCase());
    });

    setTotalItems(filtered.length);
    const totalPagesCalc = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalPagesCalc > 0 ? totalPagesCalc : 1);

    // Ajustar página si es necesario
    if (currentPage > totalPagesCalc && totalPagesCalc > 0) {
      setCurrentPage(totalPagesCalc);
    }

    // Paginar
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    setPaginatedData(paginated);
  }, [filtroCampo, filtroText, currentPage, itemsPerPage, allData]);

  // ─── Resto de lógica (carga detalle, selección, edición, etc.) ───────
  useEffect(() => {
    if ((isViewMode || isEditMode) && id) {
      if (isEditMode && formEditar) return;
      const cargarProduccionDetalle = async () => {
        setLoading(true);
        try {
          const produccionCompleta = await produccionService.getProduccionCompleta(id);
          if (!produccionCompleta) throw new Error("Producción no encontrada");

          const detalleConInfo = produccionCompleta.detalle?.map(item => ({
            ...item,
            InsumoInfo: insumos.find(i => i.InsumoId === item.InsumoId) || null
          })) || [];

          const datosProduccion = { ...produccionCompleta, detalle: detalleConInfo };
          setProduccionDetalle(datosProduccion);

          if (isEditMode) {
            setFormEditar({
              ProduccionId: produccionCompleta.ProduccionId,
              PedidoClienteId: produccionCompleta.PedidoClienteId,
              Estado: produccionCompleta.Estado,
              FechaInicio: formatDateForInput(produccionCompleta.FechaInicio),
              FechaFin: formatDateForInput(produccionCompleta.FechaFin),
              detalle: detalleConInfo.map(item => ({
                DetalleProduccionId: item.DetalleProduccionId,
                InsumoId: item.InsumoId,
                CantidadUsada: item.CantidadUsada,
                _tempId: item.DetalleProduccionId || crypto.randomUUID(),
              }))
            });
          }
        } catch (err) {
          console.error(" Error cargando producción:", err);
          toast.error("Error al cargar producción");
          navigate("/dashboard/produccion");
        } finally {
          setLoading(false);
        }
      };

      if (insumos.length > 0) {
        cargarProduccionDetalle();
      } else {
        cargarProduccionDetalle();
      }
    }
  }, [mode, id, navigate, insumos, isViewMode, isEditMode, formEditar]);

  useEffect(() => {
    if (isSelectPedidoMode || isSelectInsumoMode) {
      setSearchTerm("");
      setCurrentPageSelect(1);
    }
  }, [isSelectPedidoMode, isSelectInsumoMode]);

  // ─── NAVEGACIÓN ──────────────────────────────────────────────
  const goToBackToList = () => {
    setErrores({});
    navigate("/dashboard/produccion");
  };
  const goToCreate = () => navigate("/dashboard/produccion/nuevo");
  const goToView = (produccionId) => {
    if (!produccionId) {
      toast.error("ID de producción inválido");
      return;
    }
    navigate(`/dashboard/produccion/${produccionId}`);
  };
  const goToEdit = (produccionId) => {
    if (!produccionId) {
      toast.error("ID de producción inválido");
      return;
    }
    navigate(`/dashboard/produccion/${produccionId}/editar`);
  };
  const goToSelectPedido = () => {
    const path = location.pathname;
    if (path.includes("/nuevo") && !path.includes("/editar")) {
      navigate("/dashboard/produccion/nuevo/seleccionar-pedido");
    } else if (path.includes("/editar")) {
      navigate(`/dashboard/produccion/${id}/editar/seleccionar-pedido`);
    }
  };
  const goToSelectInsumo = (index) => {
    const path = location.pathname;
    if (path.includes("/nuevo") && !path.includes("/editar")) {
      navigate(`/dashboard/produccion/nuevo/seleccionar-insumo/${index}`);
    } else if (path.includes("/editar")) {
      navigate(`/dashboard/produccion/${id}/editar/seleccionar-insumo/${index}`);
    }
  };
  const goBackToForm = () => {
    const path = location.pathname;
    if (path.includes("/nuevo") && !path.includes("/editar")) {
      navigate("/dashboard/produccion/nuevo");
    } else if (path.includes("/editar")) {
      navigate(`/dashboard/produccion/${id}/editar`);
    } else {
      navigate("/dashboard/produccion");
    }
  };

  // ─── MANEJO DE SELECCIONES ───────────────────────────────────
  const handleSelectPedido = (pedidoId) => {
    if (mode === "select-pedido") {
      setFormCrear((prev) => ({ ...prev, PedidoClienteId: pedidoId }));
    } else if (mode === "select-pedido-edit") {
      setFormEditar((prev) => ({ ...prev, PedidoClienteId: pedidoId }));
    }
    goBackToForm();
  };
  const handleSelectInsumo = (insumoId) => {
    const idx = parseInt(detalleIndex, 10);
    if (isNaN(idx)) {
      toast.error("Índice de detalle inválido");
      return;
    }
    if (mode === "select-insumo") {
      setDetallesCrear((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], InsumoId: insumoId };
        return copy;
      });
    } else if (mode === "select-insumo-edit" && formEditar) {
      setFormEditar((prev) => {
        if (!prev) return prev;
        const copyDetalle = [...prev.detalle];
        copyDetalle[idx] = { ...copyDetalle[idx], InsumoId: insumoId };
        return { ...prev, detalle: copyDetalle };
      });
    }
    goBackToForm();
  };

  // ─── MANEJO DE DETALLES (CREAR / EDITAR) ──────────────────────
  const añadirDetalleCrear = () =>
    setDetallesCrear((prev) => [
      ...prev,
      { _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 },
    ]);
  const eliminarDetalleCrear = (index) => {
    if (detallesCrear.length > 1) {
      setDetallesCrear((prev) => prev.filter((_, i) => i !== index));
    }
  };
  const actualizarDetalleCrear = (index, campo, valor) => {
    setDetallesCrear((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: valor };
      return copy;
    });
  };
  const añadirDetalleEditar = () => {
    if (!formEditar) return;
    setFormEditar((prev) => ({
      ...prev,
      detalle: [
        ...prev.detalle,
        { _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 },
      ],
    }));
  };
  const eliminarDetalleEditar = (index) => {
    if (!formEditar || formEditar.detalle.length <= 1) return;
    setFormEditar((prev) => ({
      ...prev,
      detalle: prev.detalle.filter((_, i) => i !== index),
    }));
  };
  const actualizarDetalleEditar = (index, campo, valor) => {
    setFormEditar((prev) => {
      if (!prev) return prev;
      const nuevos = [...prev.detalle];
      nuevos[index] = { ...nuevos[index], [campo]: valor };
      return { ...prev, detalle: nuevos };
    });
  };

  // ─── VALIDACIÓN ──────────────────────────────────────────────
  const validarFormulario = (form, detalles) => {
    const errores = {};
    if (!form.PedidoClienteId?.trim()) errores.pedido = "Debe seleccionar un pedido";
    if (!form.FechaInicio) errores.fechaInicio = "La fecha de inicio es obligatoria";
    if (!detalles?.length) {
      errores.detalles = "Debe agregar al menos un insumo";
    } else {
      detalles.forEach((d, i) => {
        if (!d.InsumoId) errores[`insumo-${i}`] = `Insumo ${i + 1}: seleccione un insumo`;
        if (!d.CantidadUsada || Number(d.CantidadUsada) <= 0) {
          errores[`cantidad-${i}`] = `Insumo ${i + 1}: cantidad debe ser > 0`;
        }
      });
    }
    return errores;
  };

  // ─── ACTUALIZAR PEDIDO A "TERMINADO" ─────────────────────────
  const actualizarPedidoATerminado = async (pedidoId) => {
    try {
      await updatePedidoCliente(pedidoId, { Estado: "terminado" });
      toast.success(`✅ Pedido #${getShortId(pedidoId)} actualizado a "terminado"`);
    } catch (err) {
      console.error("Error al actualizar pedido a terminado:", err);
      toast.warn("Producción finalizada, pero no se pudo actualizar el pedido.");
    }
  };

  // ─── ALERTAS CONFIRMACIÓN ────────────────────────────────────
  const confirmDelete = async (idProduccion) => {
    if (!window.confirm("¿Está seguro de eliminar esta producción? Esta acción no se puede deshacer.")) return;
    try {
      await produccionService.deleteProduccion(idProduccion);
      setAllData(prev => prev.filter(p => p.ProduccionId !== idProduccion));
      toast.success("Producción eliminada exitosamente");
    } catch (err) {
      toast.error("Error al eliminar producción: " + err.message);
    }
  };
  const confirmToggleEstado = async (idProduccion, nuevoEstado) => {
    if (!window.confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado}"?`)) return;
    try {
      const produccionActual = allData.find(p => p.ProduccionId === idProduccion);
      const eraFinalizado = produccionActual?.Estado === "Finalizado";
      const seraFinalizado = nuevoEstado === "Finalizado";
      await produccionService.updateProduccion(idProduccion, { Estado: nuevoEstado });
      setAllData(prev =>
        prev.map(p => (p.ProduccionId === idProduccion ? { ...p, Estado: nuevoEstado } : p))
      );
      if (seraFinalizado && !eraFinalizado && produccionActual?.PedidoClienteId) {
        await actualizarPedidoATerminado(produccionActual.PedidoClienteId);
      }
      toast.success(`Estado actualizado a "${nuevoEstado}"`);
    } catch (err) {
      toast.error("Error al actualizar estado: " + err.message);
    }
  };

  // ─── CRUD - CREAR ────────────────────────────────────────────
  const handleCreate = async () => {
    const errores = validarFormulario(formCrear, detallesCrear);
    if (Object.keys(errores).length) {
      setErrores(errores);
      toast.error("Por favor corrige los errores antes de continuar");
      return;
    }
    if (!window.confirm("¿Está seguro de crear esta producción?")) return;
    setLoading(true);
    try {
      const detallesLimpios = detallesCrear
        .map((d) => ({ InsumoId: d.InsumoId.trim(), CantidadUsada: Number(d.CantidadUsada) }))
        .filter((d) => d.InsumoId);
      const resultado = await produccionService.createProduccion({
        ...formCrear,
        detalle: detallesLimpios,
      });
      toast.success("Producción creada exitosamente");
      setFormCrear({
        PedidoClienteId: "",
        Estado: "En Proceso",
        FechaInicio: formatDateForInput(new Date()),
        FechaFin: "",
      });
      setDetallesCrear([{ _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 }]);
      setErrores({});
      if (resultado?.ProduccionId) {
        navigate(`/dashboard/produccion/${resultado.ProduccionId}`);
      } else {
        goToBackToList();
      }
    } catch (err) {
      console.error("Error al crear producción:", err);
      toast.error("Error al crear producción: " + (err.response?.data?.message || err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // ─── CRUD - EDITAR ───────────────────────────────────────────
  const handleEdit = async () => {
    if (!formEditar) {
      toast.error("No hay datos para editar");
      return;
    }
    const errores = validarFormulario(formEditar, formEditar.detalle);
    if (Object.keys(errores).length) {
      setErrores(errores);
      toast.error("Por favor corrige los errores antes de continuar");
      return;
    }
    if (!window.confirm("¿Está seguro de guardar los cambios?")) return;
    setLoading(true);
    try {
      const produccionAnterior = allData.find(p => p.ProduccionId === id);
      const eraFinalizada = produccionAnterior?.Estado === "Finalizado";
      const seraFinalizada = formEditar.Estado === "Finalizado";

      const produccionData = {
        PedidoClienteId: formEditar.PedidoClienteId,
        Estado: formEditar.Estado,
        FechaInicio: formEditar.FechaInicio,
        FechaFin: formEditar.FechaFin || null,
      };

      const detallesLimpios = formEditar.detalle
        .map((d) => ({
          DetalleProduccionId: d.DetalleProduccionId,
          InsumoId: d.InsumoId.trim(),
          CantidadUsada: Number(d.CantidadUsada),
        }))
        .filter((d) => d.InsumoId);

      await produccionService.updateProduccionConDetalles(
        formEditar.ProduccionId,
        produccionData,
        detallesLimpios
      );

      if (seraFinalizada && !eraFinalizada) {
        await actualizarPedidoATerminado(formEditar.PedidoClienteId);
      }
      toast.success("Producción actualizada exitosamente");
      await fetchProducciones();
      navigate(`/dashboard/produccion/${id}`);
    } catch (err) {
      console.error("Error al editar producción:", err);
      toast.error("Error al editar producción: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  // ─── UTILIDADES DE RENDER ────────────────────────────────────
  const getEstadoColor = (estado) =>
    estado === "Finalizado" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";

  const getFilteredAndPaginatedData = (data, term) => {
    const filtered = data.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term.toLowerCase()))
    );
    const startIndex = (currentPageSelect - 1) * itemsPerPageSelect;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPageSelect);
    return { filtered, paginated, total: filtered.length };
  };

  const getNombreInsumo = (insumoId) => {
    const insumo = insumos.find(i => i.InsumoId === insumoId);
    return insumo ? insumo.Nombre : `Insumo #${getShortId(insumoId)}`;
  };

  // ─── RENDER: SELECCIÓN DE PEDIDO ─────────────────────────────
  if (isSelectPedidoMode) {
    const { filtered: pedidosFiltrados, paginated: pedidosPaginados, total } = getFilteredAndPaginatedData(pedidos, searchTerm);
    const totalPages = Math.ceil(total / itemsPerPageSelect);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goBackToForm} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Seleccionar Pedido</h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, ID o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPageSelect(1);
              }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border divide-y max-h-[500px] overflow-auto">
            {pedidosPaginados.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? `No se encontraron pedidos con "${searchTerm}"` : "No hay pedidos confirmados"}
              </div>
            ) : (
              pedidosPaginados.map((p) => (
                <button
                  key={p.PedidoClienteId}
                  onClick={() => handleSelectPedido(p.PedidoClienteId)}
                  className="w-full p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-left"
                >
                  <div>
                    <div className="font-medium">Pedido #{getShortId(p.PedidoClienteId)}</div>
                    <div className="text-sm text-gray-600">
                      {p.NombreCliente || "Cliente desconocido"} • {p.Estado}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(p.FechaRegistro)}</div>
                  </div>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </button>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPageSelect((prev) => Math.max(1, prev - 1))}
                disabled={currentPageSelect === 1}
                className={`px-3 py-1 rounded ${currentPageSelect === 1 ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-gray-600">Página {currentPageSelect} de {totalPages}</span>
              <button
                onClick={() => setCurrentPageSelect((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPageSelect === totalPages}
                className={`px-3 py-1 rounded ${currentPageSelect === totalPages ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    );
  }

  // ─── RENDER: SELECCIÓN DE INSUMO ─────────────────────────────
  if (isSelectInsumoMode) {
    const { filtered: insumosFiltrados, paginated: insumosPaginados, total } = getFilteredAndPaginatedData(insumos, searchTerm);
    const totalPages = Math.ceil(total / itemsPerPageSelect);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goBackToForm} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Seleccionar Insumo</h2>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar insumo por nombre, categoría..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPageSelect(1);
              }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border divide-y max-h-[500px] overflow-auto">
            {insumosPaginados.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? `No se encontraron insumos con "${searchTerm}"` : "No hay insumos disponibles"}
              </div>
            ) : (
              insumosPaginados.map((i) => (
                <button
                  key={i.InsumoId}
                  onClick={() => handleSelectInsumo(i.InsumoId)}
                  className="w-full p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-left"
                >
                  <div>
                    <div className="font-medium">{i.Nombre}</div>
                    <div className="text-sm text-gray-600">
                      {i.Categoria || "Sin categoría"} • Stock: <span className="font-semibold">{i.Stock || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{i.Descripcion || "Sin descripción"}</div>
                  </div>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </button>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPageSelect((prev) => Math.max(1, prev - 1))}
                disabled={currentPageSelect === 1}
                className={`px-3 py-1 rounded ${currentPageSelect === 1 ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-gray-600">Página {currentPageSelect} de {totalPages}</span>
              <button
                onClick={() => setCurrentPageSelect((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPageSelect === totalPages}
                className={`px-3 py-1 rounded ${currentPageSelect === totalPages ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    );
  }

  // ─── RENDER: LISTA ───────────────────────────────────────────
  if (mode === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Producción</h1>
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={goToCreate}
              className="bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 whitespace-wrap hover:bg-green-900 transition-colors"
            >
              <Plus size={18} /> Nueva producción
            </button>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar producción..."
                  value={filtroText}
                  onChange={(e) => setFiltroText(e.target.value)}
                  className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border rounded-lg px-4 py-3 bg-white text-slate-700 w-full sm:w-auto"
              >
                <option value="">Filtrar por Campo</option>
                <option value="ProduccionId">Producción ID</option>
                <option value="PedidoClienteId">Pedido ID</option>
                <option value="Estado">Estado</option>
                <option value="FechaInicio">Fecha Inicio</option>
                <option value="FechaFin">Fecha Fin</option>
              </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-white text-left">ID Producción</th>
                      <th className="px-4 py-3 text-white text-left">Pedido ID</th>
                      <th className="px-4 py-3 text-white text-left">Fecha Inicio</th>
                      <th className="px-4 py-3 text-white text-left">Fecha Fin</th>
                      <th className="px-4 py-3 text-white text-left">Estado</th>
                      <th className="px-4 py-3 text-white text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          {allData.length === 0
                            ? "No hay producciones registradas."
                            : filtroText
                            ? `No se encontraron producciones con "${filtroText}"`
                            : "No hay resultados"}
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((p) => (
                        <tr key={p.ProduccionId} className="hover:bg-slate-50">
                          <td className="py-4 px-4">#{getShortId(p.ProduccionId)}</td>
                          <td className="py-4 px-4">#{getShortId(p.PedidoClienteId)}</td>
                          <td className="py-4 px-4">{formatDate(p.FechaInicio)}</td>
                          <td className="py-4 px-4">{formatDate(p.FechaFin)}</td>
                          <td className="py-4 px-4">
                            <button
                              onClick={() => confirmToggleEstado(
                                p.ProduccionId,
                                p.Estado === "En Proceso" ? "Finalizado" : "En Proceso"
                              )}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(p.Estado)} hover:opacity-80 transition-opacity`}
                            >
                              {p.Estado}
                            </button>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-3">
                              <button
                                onClick={() => goToView(p.ProduccionId)}
                                className="p-1 hover:bg-emerald-50 rounded"
                                title="Ver detalles"
                              >
                                <Eye size={16} className="text-emerald-600" />
                              </button>
                              <button
                                onClick={() => goToEdit(p.ProduccionId)}
                                className="p-1 hover:bg-blue-50 rounded"
                                title="Editar"
                              >
                                <Edit size={16} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => confirmDelete(p.ProduccionId)}
                                className="p-1 hover:bg-red-50 rounded"
                                title="Eliminar"
                              >
                                <Trash2 size={16} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {allData.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // ─── RENDER: CREAR ───────────────────────────────────────────
  if (mode === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-lg font-bold">Nueva producción</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {errores.detalles && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                {errores.detalles}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Pedido Cliente *</label>
                <button
                  type="button"
                  className={`w-full h-11 px-3 border rounded-lg text-left ${errores.pedido ? "border-red-500" : "border-gray-300"} bg-white hover:bg-gray-50 flex justify-between items-center`}
                  onClick={goToSelectPedido}
                >
                  <span className={formCrear.PedidoClienteId ? "text-gray-800" : "text-gray-500"}>
                    {formCrear.PedidoClienteId ? `#${getShortId(formCrear.PedidoClienteId)}` : "Seleccionar pedido"}
                  </span>
                  <Search size={16} />
                </button>
                {errores.pedido && <span className="text-red-500 text-xs">{errores.pedido}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Estado</label>
                <select
                  value={formCrear.Estado}
                  onChange={(e) => setFormCrear({ ...formCrear, Estado: e.target.value })}
                  className="w-full h-11 px-3 border rounded"
                >
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha Inicio *</label>
                <input
                  type="datetime-local"
                  value={formCrear.FechaInicio}
                  onChange={(e) => setFormCrear({ ...formCrear, FechaInicio: e.target.value })}
                  className={`w-full h-11 px-3 border rounded ${errores.fechaInicio ? "border-red-500" : "border-gray-300"}`}
                />
                {errores.fechaInicio && <span className="text-red-500 text-xs">{errores.fechaInicio}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha Fin (opcional)</label>
                <input
                  type="datetime-local"
                  value={formCrear.FechaFin}
                  onChange={(e) => setFormCrear({ ...formCrear, FechaFin: e.target.value })}
                  className="w-full h-11 px-3 border rounded"
                />
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Insumos utilizados *</h4>
                <button onClick={añadirDetalleCrear} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                  <Plus size={15} /> Añadir insumo
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {detallesCrear.map((d, index) => (
                  <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-3 rounded">
                    <div className="flex flex-col gap-2">
                      <label>Insumo *</label>
                      <button
                        type="button"
                        className={`h-10 px-2 border rounded text-left ${errores[`insumo-${index}`] ? "border-red-500" : "border-gray-300"} bg-white hover:bg-gray-50 flex justify-between items-center`}
                        onClick={() => goToSelectInsumo(index)}
                      >
                        <span className={d.InsumoId ? "text-gray-800" : "text-gray-500"}>
                          {d.InsumoId ? getNombreInsumo(d.InsumoId) : "Seleccionar insumo"}
                        </span>
                        <Search size={16} />
                      </button>
                      {errores[`insumo-${index}`] && <span className="text-red-500 text-xs">{errores[`insumo-${index}`]}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Cantidad *</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={d.CantidadUsada}
                        onChange={(e) => actualizarDetalleCrear(index, "CantidadUsada", Number(e.target.value))}
                        className={`h-10 px-2 border rounded ${errores[`cantidad-${index}`] ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errores[`cantidad-${index}`] && <span className="text-red-500 text-xs">{errores[`cantidad-${index}`]}</span>}
                    </div>
                    <div className="flex items-end">
                      {detallesCrear.length > 1 && (
                        <button
                          onClick={() => eliminarDetalleCrear(index)}
                          className="h-10 px-4 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCreate}
                disabled={loading}
                className={`flex-1 h-11 rounded flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Crear Producción
                  </>
                )}
              </button>
              <button
                onClick={goToBackToList}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 h-11 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancelar
              </button>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // ─── RENDER: VER ─────────────────────────────────────────────
  if (mode === "view") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-lg font-bold">Producción #{getShortId(id)}</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando producción...</p>
              </div>
            ) : produccionDetalle ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Producción ID</div>
                    <div className="font-bold">#{getShortId(produccionDetalle.ProduccionId)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Pedido ID</div>
                    <div className="font-bold">#{getShortId(produccionDetalle.PedidoClienteId)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Estado</div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(produccionDetalle.Estado)}`}>
                      {produccionDetalle.Estado}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Fecha Inicio</div>
                    <div className="font-bold">{formatDate(produccionDetalle.FechaInicio)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Fecha Fin</div>
                    <div className="font-bold">{formatDate(produccionDetalle.FechaFin)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Insumos</div>
                    <div className="font-bold">{produccionDetalle.detalle?.length || 0}</div>
                  </div>
                </div>
                {produccionDetalle.detalle?.length > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-4">Insumos utilizados</h4>
                    <div className="overflow-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left">Insumo</th>
                            <th className="py-3 px-4 text-left">Cantidad</th>
                            <th className="py-3 px-4 text-left">Categoría</th>
                          </tr>
                        </thead>
                        <tbody>
                          {produccionDetalle.detalle.map((d, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="font-medium">
                                  {d.InsumoInfo?.Nombre || `Insumo #${getShortId(d.InsumoId)}`}
                                </div>
                                {d.InsumoInfo?.Descripcion && (
                                  <div className="text-xs text-gray-500 mt-1">{d.InsumoInfo.Descripcion}</div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold">{d.CantidadUsada}</span> unidades
                              </td>
                              <td className="py-3 px-4">
                                {d.InsumoInfo?.Categoria || "Sin categoría"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700">No hay insumos registrados para esta producción.</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <button
                    onClick={goToBackToList}
                    className="w-full h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Volver a la lista
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-red-500">
                <p>No se pudo cargar la producción.</p>
                <button
                  onClick={goToBackToList}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Volver a la lista
                </button>
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // ─── RENDER: EDITAR ──────────────────────────────────────────
  if (mode === "edit") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(`/dashboard/produccion/${id}`)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-lg font-bold">Editar producción #{getShortId(id)}</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {loading && !formEditar ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando datos...</p>
              </div>
            ) : formEditar ? (
              <>
                {errores.detalles && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                    {errores.detalles}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Pedido Cliente *</label>
                    <button
                      type="button"
                      className={`w-full h-11 px-3 border rounded-lg text-left ${errores.pedido ? "border-red-500" : "border-gray-300"} bg-white hover:bg-gray-50 flex justify-between items-center`}
                      onClick={goToSelectPedido}
                    >
                      <span className={formEditar.PedidoClienteId ? "text-gray-800" : "text-gray-500"}>
                        {formEditar.PedidoClienteId ? `#${getShortId(formEditar.PedidoClienteId)}` : "Seleccionar pedido"}
                      </span>
                      <Search size={16} />
                    </button>
                    {errores.pedido && <span className="text-red-500 text-xs">{errores.pedido}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Estado</label>
                    <select
                      value={formEditar.Estado}
                      onChange={(e) => setFormEditar({ ...formEditar, Estado: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                    >
                      <option value="En Proceso">En Proceso</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      {formEditar.Estado === "Finalizado" &&
                        "Al marcar como Finalizado, el pedido asociado se actualizará a 'terminado'"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Fecha Inicio *</label>
                    <input
                      type="datetime-local"
                      value={formEditar.FechaInicio}
                      onChange={(e) => setFormEditar({ ...formEditar, FechaInicio: e.target.value })}
                      className={`w-full h-11 px-3 border rounded ${errores.fechaInicio ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errores.fechaInicio && <span className="text-red-500 text-xs">{errores.fechaInicio}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Fecha Fin (opcional)</label>
                    <input
                      type="datetime-local"
                      value={formEditar.FechaFin || ""}
                      onChange={(e) => setFormEditar({ ...formEditar, FechaFin: e.target.value || null })}
                      className="w-full h-11 px-3 border rounded"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Insumos utilizados *</h4>
                    <button onClick={añadirDetalleEditar} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
                      <Plus size={15} /> Añadir insumo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {formEditar.detalle.map((d, index) => (
                      <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-3 rounded">
                        <div className="flex flex-col gap-2">
                          <label>Insumo *</label>
                          <button
                            type="button"
                            className={`h-10 px-2 border rounded text-left ${errores[`insumo-${index}`] ? "border-red-500" : "border-gray-300"} bg-white hover:bg-gray-50 flex justify-between items-center`}
                            onClick={() => goToSelectInsumo(index)}
                          >
                            <span className={d.InsumoId ? "text-gray-800" : "text-gray-500"}>
                              {d.InsumoId ? getNombreInsumo(d.InsumoId) : "Seleccionar insumo"}
                            </span>
                            <Search size={16} />
                          </button>
                          {errores[`insumo-${index}`] && <span className="text-red-500 text-xs">{errores[`insumo-${index}`]}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label>Cantidad *</label>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={d.CantidadUsada}
                            onChange={(e) => actualizarDetalleEditar(index, "CantidadUsada", Number(e.target.value))}
                            className={`h-10 px-2 border rounded ${errores[`cantidad-${index}`] ? "border-red-500" : "border-gray-300"}`}
                          />
                          {errores[`cantidad-${index}`] && <span className="text-red-500 text-xs">{errores[`cantidad-${index}`]}</span>}
                        </div>
                        <div className="flex items-end">
                          {formEditar.detalle.length > 1 && (
                            <button
                              onClick={() => eliminarDetalleEditar(index)}
                              className="h-10 px-4 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className={`flex-1 h-11 rounded flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Guardar Cambios
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/produccion/${id}`)}
                    disabled={loading}
                    className="flex-1 bg-gray-200 text-gray-700 h-11 rounded hover:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-red-500">
                <p>No se pudo cargar la producción para editar.</p>
                <button
                  onClick={() => navigate(`/dashboard/produccion/${id}`)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Volver a la vista
                </button>
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // ─── DEFAULT RENDER ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Producción</h1>
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
          <p className="text-gray-600">Modo no reconocido. Redirigiendo...</p>
          <button
            onClick={goToBackToList}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};