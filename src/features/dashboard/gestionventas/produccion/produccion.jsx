// src/features/dashboard/gestionventas/produccion/Produccion.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit, Eye, Trash2, ArrowLeft, Search, CheckCircle, Filter } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as produccionService from "./services/services.produccion";

// ─── UTILIDADES ───────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
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
  const str = String(id || "");
  return str.length > 6 ? `...${str.slice(-6)}` : str;
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────
export const Produccion = () => {
  const navigate = useNavigate();
  const { id, detalleIndex } = useParams();
  const location = useLocation();

  // ─── DETECCIÓN DE MODO ───────────────────────────────────────
  const mode = useMemo(() => {
    const path = location.pathname;
    if (path === "/dashboard/produccion") return "list";
    if (path === "/dashboard/produccion/nuevo") return "create";
    if (path === "/dashboard/produccion/nuevo/seleccionar-pedido") return "select-pedido";
    if (path.match(/^\/dashboard\/produccion\/nuevo\/seleccionar-insumo\/\d+$/)) return "select-insumo";
    if (path.match(/^\/dashboard\/produccion\/\d+$/) && !path.includes("/editar")) return "view";
    if (path.match(/^\/dashboard\/produccion\/\d+\/editar$/)) return "edit";
    if (path.match(/^\/dashboard\/produccion\/\d+\/editar\/seleccionar-pedido$/)) return "select-pedido";
    if (path.match(/^\/dashboard\/produccion\/\d+\/editar\/seleccionar-insumo\/\d+$/)) return "select-insumo";
    return "list";
  }, [location.pathname]);

  const isEditMode = mode.includes("edit");
  const isCreateMode = mode.includes("create");

  // ─── ESTADOS ─────────────────────────────────────────────────
  const [producciones, setProducciones] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [formCrear, setFormCrear] = useState({
    PedidoClienteId: "",
    Estado: "En Proceso",
    FechaInicio: formatDateForInput(new Date()),
    FechaFin: "",
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 },
  ]);
  const [formEditar, setFormEditar] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  // Estados para selección
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // ─── CARGA INICIAL DE PEDIDOS E INSUMOS ──────────────────────
  useEffect(() => {
    const fetchRelacionados = async () => {
      try {
        const [pedidosData, insumosData] = await Promise.all([
          produccionService.getAllPedidos(),
          produccionService.getAllInsumos(),
        ]);
        // ✅ CORREGIDO: Incluye "en_produccion" para que los pedidos automáticos aparezcan
        const pedidosValidos = pedidosData.filter(p =>
          ["Confirmado", "Aprobado", "Pagado", "en_produccion"].includes(p.Estado)
        );
        setPedidos(pedidosValidos);
        setInsumos(insumosData);
      } catch (err) {
        console.error("Error cargando datos relacionados:", err);
        toast.error("Error al cargar pedidos o insumos");
      }
    };
    fetchRelacionados();
  }, []);

  // ─── CARGAR LISTA DE PRODUCCIONES ────────────────────────────
  const fetchProducciones = async () => {
    setLoading(true);
    try {
      const data = await produccionService.getAllProducciones();
      setProducciones(data);
    } catch (err) {
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

  // ─── CARGAR PRODUCCIÓN (VER/EDITAR) ──────────────────────────
  useEffect(() => {
    if ((mode === "view" || mode === "edit") && id) {
      const cargarProduccion = async () => {
        setLoading(true);
        try {
          const produccionCompleta = await produccionService.getProduccionCompleta(id);
          const produccionFormateada = {
            ...produccionCompleta,
            FechaInicio: formatDateForInput(produccionCompleta.FechaInicio),
            FechaFin: formatDateForInput(produccionCompleta.FechaFin),
            detalle: (produccionCompleta.detalle || []).map(item => ({
              ...item,
              _tempId: item.DetalleProduccionId || crypto.randomUUID(),
              // ✅ Enriquecer con datos del insumo
              InsumoData: insumos.find(i => i.InsumoId === item.InsumoId) || null,
            })),
          };
          setFormEditar(produccionFormateada);
        } catch (err) {
          console.error("Error cargando producción:", err);
          toast.error("Error al cargar producción");
          navigate("/dashboard/produccion");
        } finally {
          setLoading(false);
        }
      };
      // Solo cargar si ya se tienen los insumos (evita render vacío)
      if (insumos.length > 0) {
        cargarProduccion();
      }
    }
  }, [mode, id, navigate, insumos]);

  // ─── RESETEAR PAGINACIÓN Y BÚSQUEDA AL ENTRAR A SELECCIÓN ───
  useEffect(() => {
    if (mode === "select-pedido" || mode === "select-insumo") {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [mode]);

  // ─── FILTROS ─────────────────────────────────────────────────
  const produccionesFiltradas = producciones.filter((p) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(p[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  // ─── NAVEGACIÓN ──────────────────────────────────────────────
  const goToBackToList = () => {
    setErrores({});
    navigate("/dashboard/produccion");
  };
  const goToCreate = () => navigate("/dashboard/produccion/nuevo");
  const goToView = (p) => navigate(`/dashboard/produccion/${p.ProduccionId}`);
  const goToEdit = (p) => navigate(`/dashboard/produccion/${p.ProduccionId}/editar`);
  const goToSelectPedido = () => {
    if (isCreateMode) {
      navigate("/dashboard/produccion/nuevo/seleccionar-pedido");
    } else if (isEditMode) {
      navigate(`/dashboard/produccion/${id}/editar/seleccionar-pedido`);
    }
  };
  const goToSelectInsumo = (index) => {
    if (isCreateMode) {
      navigate(`/dashboard/produccion/nuevo/seleccionar-insumo/${index}`);
    } else if (isEditMode) {
      navigate(`/dashboard/produccion/${id}/editar/seleccionar-insumo/${index}`);
    }
  };
  const goBackToForm = () => {
    if (isCreateMode) {
      navigate("/dashboard/produccion/nuevo");
    } else if (isEditMode) {
      navigate(`/dashboard/produccion/${id}/editar`);
    } else {
      navigate("/dashboard/produccion");
    }
  };

  // ─── MANEJO DE SELECCIONES ───────────────────────────────────
  const handleSelectPedido = (pedidoId) => {
    if (isCreateMode) {
      setFormCrear((prev) => ({ ...prev, PedidoClienteId: pedidoId }));
    } else if (isEditMode) {
      setFormEditar((prev) => ({ ...prev, PedidoClienteId: pedidoId }));
    }
    goBackToForm();
  };

  const handleSelectInsumo = (insumoId) => {
    const idx = parseInt(detalleIndex, 10);
    if (isNaN(idx)) return;
    if (isCreateMode) {
      setDetallesCrear((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], InsumoId: insumoId };
        return copy;
      });
    } else if (isEditMode && formEditar) {
      setFormEditar((prev) => {
        const copyDetalle = [...prev.detalle];
        copyDetalle[idx] = { ...copyDetalle[idx], InsumoId: insumoId };
        return { ...prev, detalle: copyDetalle };
      });
    }
    goBackToForm();
  };

  // ─── MANEJO DE DETALLES (CREAR) ──────────────────────────────
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

  // ─── MANEJO DE DETALLES (EDITAR) ─────────────────────────────
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

  // ─── CRUD ────────────────────────────────────────────────────
  const handleCreate = async () => {
    const errores = validarFormulario(formCrear, detallesCrear);
    if (Object.keys(errores).length) {
      setErrores(errores);
      toast.error("Por favor corrige los errores");
      return;
    }
    try {
      const detallesLimpios = detallesCrear
        .map((d) => ({
          InsumoId: d.InsumoId.trim(),
          CantidadUsada: Number(d.CantidadUsada),
        }))
        .filter((d) => d.InsumoId);
      await produccionService.createProduccion({
        ...formCrear,
        detalle: detallesLimpios,
      });
      toast.success("Producción creada exitosamente");
      goToBackToList();
    } catch (err) {
      toast.error("Error al crear producción: " + (err.response?.data?.message || err.message || "Error desconocido"));
    }
  };

  const handleEdit = async () => {
    if (!formEditar) return;
    const errores = validarFormulario(formEditar, formEditar.detalle);
    if (Object.keys(errores).length) {
      setErrores(errores);
      toast.error("Por favor corrige los errores");
      return;
    }
    try {
      const produccionData = {
        PedidoClienteId: formEditar.PedidoClienteId,
        Estado: formEditar.Estado,
        FechaInicio: formEditar.FechaInicio,
        FechaFin: formEditar.FechaFin || null,
      };
      const detallesLimpios = formEditar.detalle
        .map((d) => ({
          InsumoId: d.InsumoId.trim(),
          CantidadUsada: Number(d.CantidadUsada),
        }))
        .filter((d) => d.InsumoId);
      await produccionService.updateProduccionConDetalles(formEditar.ProduccionId, produccionData, detallesLimpios);
      toast.success("Producción actualizada exitosamente");
      goToBackToList();
    } catch (err) {
      toast.error("Error al editar producción: " + (err.response?.data?.message || err.message || "Error desconocido"));
    }
  };

  const handleDelete = async (idProduccion) => {
    if (!window.confirm("¿Está seguro de eliminar esta producción?")) return;
    try {
      await produccionService.deleteProduccion(idProduccion);
      setProducciones((prev) => prev.filter((p) => p.ProduccionId !== idProduccion));
      toast.success("Producción eliminada");
    } catch (err) {
      toast.error("Error al eliminar producción");
    }
  };

  const toggleEstado = async (idProduccion, nuevoEstado) => {
    try {
      await produccionService.updateProduccion(idProduccion, { Estado: nuevoEstado });
      setProducciones((prev) =>
        prev.map((p) => (p.ProduccionId === idProduccion ? { ...p, Estado: nuevoEstado } : p))
      );
      toast.success("Estado actualizado");
    } catch (err) {
      toast.error("Error al actualizar estado");
    }
  };

  // ─── UTILIDADES DE RENDER ────────────────────────────────────
  const getEstadoColor = (estado) =>
    estado === "Finalizado" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";

  const getFilteredAndPaginatedData = (data, term) => {
    const filtered = data.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term.toLowerCase()))
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    return { filtered, paginated, total: filtered.length };
  };

  // ─── RENDER: SELECCIÓN DE PEDIDO ─────────────────────────────
  if (mode === "select-pedido") {
    const { filtered: pedidosFiltrados, paginated: pedidosPaginados, total } = getFilteredAndPaginatedData(pedidos, searchTerm);
    const totalPages = Math.ceil(total / itemsPerPage);
    return (
      <div className="min-h-screen bg-slate-50 p-6">
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
                setCurrentPage(1);
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
                <div
                  key={p.PedidoClienteId}
                  onClick={() => handleSelectPedido(p.PedidoClienteId)}
                  className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">Pedido #{getShortId(p.PedidoClienteId)}</div>
                    <div className="text-sm text-gray-600">
                      {p.NombreCliente || "Cliente desconocido"} • {p.Estado}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(p.FechaRegistro)}</div>
                  </div>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-gray-600">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
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
  if (mode === "select-insumo") {
    const { filtered: insumosFiltrados, paginated: insumosPaginados, total } = getFilteredAndPaginatedData(insumos, searchTerm);
    const totalPages = Math.ceil(total / itemsPerPage);
    return (
      <div className="min-h-screen bg-slate-50 p-6">
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
                setCurrentPage(1);
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
                <div
                  key={i.InsumoId}
                  onClick={() => handleSelectInsumo(i.InsumoId)}
                  className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{i.Nombre}</div>
                    <div className="text-sm text-gray-600">
                      {i.Categoria || "Sin categoría"} • Stock: <span className="font-semibold">{i.Stock || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{i.Descripcion || "Sin descripción"}</div>
                  </div>
                  <CheckCircle className="text-green-500 w-5 h-5" />
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-gray-600">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? "text-gray-400" : "text-blue-600 hover:bg-blue-50"}`}
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

  // ─── RENDER: LISTA / CREAR / VER / EDITAR ────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Gestión de Producción</h1>

        {/* LISTA */}
        {mode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <button
                  onClick={goToCreate}
                  className="bg-green-800 hover:bg-green-900 text-white px-5 py-3 rounded-lg flex items-center gap-2 w-full lg:w-auto justify-center transition-colors"
                >
                  <Plus size={18} /> Nueva producción
                </button>
                <div className="relative w-full lg:w-1/2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar producción por cualquier campo..."
                    value={filtroText}
                    onChange={(e) => setFiltroText(e.target.value)}
                    className="border rounded-lg pl-10 pr-4 py-3 w-full focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Filter className="text-slate-500" size={18} />
                  <select
                    value={filtroCampo}
                    onChange={(e) => setFiltroCampo(e.target.value)}
                    className="border rounded-lg px-4 py-3 bg-white text-slate-700 w-full lg:w-48 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Filtrar por campo</option>
                    <option value="ProduccionId">Producción ID</option>
                    <option value="PedidoClienteId">Pedido ID</option>
                    <option value="Estado">Estado</option>
                    <option value="FechaInicio">Fecha Inicio</option>
                    <option value="FechaFin">Fecha Fin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-white text-left font-medium">ID</th>
                        <th className="px-4 py-3 text-white text-left font-medium">Pedido</th>
                        <th className="px-4 py-3 text-white text-left font-medium">Fecha Inicio</th>
                        <th className="px-4 py-3 text-white text-left font-medium">Fecha Fin</th>
                        <th className="px-4 py-3 text-white text-center font-medium">Estado</th>
                        <th className="px-4 py-3 text-white text-center font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {produccionesFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            {producciones.length === 0
                              ? "No hay producciones registradas."
                              : filtroText
                              ? `No se encontraron producciones con "${filtroText}"`
                              : "No hay resultados"}
                          </td>
                        </tr>
                      ) : (
                        produccionesFiltradas.map((p) => (
                          <tr key={p.ProduccionId} className="hover:bg-slate-50">
                            <td className="py-4 px-4 font-medium">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                                #{getShortId(p.ProduccionId)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono bg-blue-50 px-2 py-1 rounded text-xs">
                                #{getShortId(p.PedidoClienteId)}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">{formatDate(p.FechaInicio)}</td>
                            <td className="py-4 px-4 whitespace-nowrap">{formatDate(p.FechaFin)}</td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center">
                                <select
                                  value={p.Estado}
                                  onChange={(e) => toggleEstado(p.ProduccionId, e.target.value)}
                                  className={`px-3 py-2 text-sm font-medium border rounded focus:ring-2 focus:ring-blue-300 ${getEstadoColor(p.Estado)}`}
                                >
                                  <option value="En Proceso">En Proceso</option>
                                  <option value="Finalizado">Finalizado</option>
                                </select>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => goToView(p)} className="p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                                  <Eye size={16} className="text-emerald-600" />
                                </button>
                                <button onClick={() => goToEdit(p)} className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100">
                                  <Edit size={16} className="text-blue-600" />
                                </button>
                                <button onClick={() => handleDelete(p.ProduccionId)} className="p-2 bg-red-50 rounded-lg hover:bg-red-100">
                                  <Trash2 size={16} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* CREAR */}
        {mode === "create" && (
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Nueva producción</h3>
                <p className="text-sm text-gray-600">Complete todos los campos obligatorios (*)</p>
              </div>
            </div>
            {errores.detalles && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{errores.detalles}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-700">
                  Pedido Cliente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={formCrear.PedidoClienteId ? `Pedido #${getShortId(formCrear.PedidoClienteId)}` : ""}
                  placeholder="Haz clic para seleccionar un pedido"
                  className={`w-full h-11 px-3 border rounded-lg ${errores.pedido ? "border-red-500" : "border-gray-300"} bg-white cursor-pointer hover:bg-gray-50`}
                  onClick={goToSelectPedido}
                />
                {errores.pedido && <span className="text-red-500 text-xs mt-1 block">{errores.pedido}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-700">Estado</label>
                <select
                  value={formCrear.Estado}
                  onChange={(e) => setFormCrear({ ...formCrear, Estado: e.target.value })}
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="En Proceso">En Proceso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-700">
                  Fecha Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formCrear.FechaInicio}
                  onChange={(e) => {
                    setFormCrear({ ...formCrear, FechaInicio: e.target.value });
                    if (errores.fechaInicio) setErrores((prev) => ({ ...prev, fechaInicio: "" }));
                  }}
                  className={`w-full h-11 px-3 border rounded-lg ${errores.fechaInicio ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                />
                {errores.fechaInicio && <span className="text-red-500 text-xs">{errores.fechaInicio}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-slate-700">Fecha Fin (opcional)</label>
                <input
                  type="datetime-local"
                  value={formCrear.FechaFin}
                  onChange={(e) => setFormCrear({ ...formCrear, FechaFin: e.target.value })}
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-slate-700">
                  Insumos utilizados <span className="text-red-500">*</span>
                </h4>
                <button onClick={añadirDetalleCrear} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus size={15} /> Añadir insumo
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {detallesCrear.map((d, index) => (
                  <div key={d._tempId} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">
                          Insumo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={d.InsumoId ? insumos.find((i) => i.InsumoId === d.InsumoId)?.Nombre || d.InsumoId : ""}
                          placeholder="Haz clic para seleccionar un insumo"
                          className={`h-10 px-3 border rounded bg-white cursor-pointer w-full ${errores[`insumo-${index}`] ? "border-red-500" : "border-gray-300"} hover:bg-gray-50`}
                          onClick={() => goToSelectInsumo(index)}
                        />
                        {errores[`insumo-${index}`] && <span className="text-red-500 text-xs mt-1 block">{errores[`insumo-${index}`]}</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700">
                          Cantidad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={d.CantidadUsada}
                          onChange={(e) => {
                            actualizarDetalleCrear(index, "CantidadUsada", Number(e.target.value));
                            if (errores[`cantidad-${index}`]) setErrores((prev) => ({ ...prev, [`cantidad-${index}`]: "" }));
                          }}
                          className={`h-10 px-3 border rounded w-full ${errores[`cantidad-${index}`] ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                        />
                        {errores[`cantidad-${index}`] && <span className="text-red-500 text-xs mt-1">{errores[`cantidad-${index}`]}</span>}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      {detallesCrear.length > 1 && (
                        <button
                          onClick={() => eliminarDetalleCrear(index)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={16} /> <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <button onClick={handleCreate} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 rounded-lg font-medium">
                Crear producción
              </button>
              <button onClick={goToBackToList} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 h-11 rounded-lg font-medium">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* VER */}
        {mode === "view" && (
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Producción #{getShortId(id)}</h3>
                <p className="text-sm text-gray-600">Detalles de la producción</p>
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando producción...</p>
              </div>
            ) : formEditar ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Producción ID</div>
                    <div className="font-bold text-lg text-slate-800">#{getShortId(formEditar.ProduccionId)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Pedido ID</div>
                    <div className="font-bold text-lg text-blue-600">#{getShortId(formEditar.PedidoClienteId)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Estado</div>
                    <div className={`inline-block px-3 py-1 rounded-full font-medium ${getEstadoColor(formEditar.Estado)}`}>
                      {formEditar.Estado}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Fecha Inicio</div>
                    <div className="font-bold text-slate-800">{formatDate(formEditar.FechaInicio)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Fecha Fin</div>
                    <div className="font-bold text-slate-800">{formatDate(formEditar.FechaFin)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Total Insumos</div>
                    <div className="font-bold text-lg text-slate-800">{formEditar.detalle?.length || 0}</div>
                  </div>
                </div>

                {/* ✅ DETALLE DE INSUMOS - SOLO EN MODO VER */}
                {formEditar.detalle?.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">Insumos utilizados</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-3 px-4 text-left font-medium text-slate-700">Insumo</th>
                            <th className="py-3 px-4 text-left font-medium text-slate-700">Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formEditar.detalle.map((d, idx) => (
                            <tr key={d._tempId || idx} className="border-t hover:bg-gray-50">
                              <td className="py-3 px-4">
                                {d.InsumoData ? (
                                  <>
                                    <div className="font-medium">{d.InsumoData.Nombre}</div>
                                    {d.InsumoData.Categoria && (
                                      <div className="text-xs text-gray-500">{d.InsumoData.Categoria}</div>
                                    )}
                                    {d.InsumoData.Descripcion && (
                                      <div className="text-xs text-gray-500 italic">{d.InsumoData.Descripcion}</div>
                                    )}
                                  </>
                                ) : (
                                  <div className="font-medium text-red-500">Insumo no encontrado (ID: {d.InsumoId})</div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                  {d.CantidadUsada} unidades
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button onClick={goToBackToList} className="w-full h-11 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                    Volver a la lista
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="text-red-500 mb-2">No se pudo cargar la producción.</div>
                <button onClick={goToBackToList} className="text-blue-600 hover:text-blue-800">Volver a la lista</button>
              </div>
            )}
          </div>
        )}

        {/* EDITAR */}
        {mode === "edit" && (
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Editar producción #{getShortId(id)}</h3>
                <p className="text-sm text-gray-600">Modifique los campos necesarios</p>
              </div>
            </div>
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Cargando datos...</p>
              </div>
            ) : formEditar ? (
              <>
                {errores.detalles && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">{errores.detalles}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-slate-700">
                      Pedido Cliente <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formEditar.PedidoClienteId ? `Pedido #${getShortId(formEditar.PedidoClienteId)}` : ""}
                      placeholder="Haz clic para seleccionar un pedido"
                      className={`w-full h-11 px-3 border rounded-lg ${errores.pedido ? "border-red-500" : "border-gray-300"} bg-white cursor-pointer hover:bg-gray-50`}
                      onClick={goToSelectPedido}
                    />
                    {errores.pedido && <span className="text-red-500 text-xs mt-1 block">{errores.pedido}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-slate-700">Estado</label>
                    <select
                      value={formEditar.Estado}
                      onChange={(e) => setFormEditar({ ...formEditar, Estado: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="En Proceso">En Proceso</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-slate-700">
                      Fecha Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formEditar.FechaInicio}
                      onChange={(e) => {
                        setFormEditar({ ...formEditar, FechaInicio: e.target.value });
                        if (errores.fechaInicio) setErrores((prev) => ({ ...prev, fechaInicio: "" }));
                      }}
                      className={`w-full h-11 px-3 border rounded-lg ${errores.fechaInicio ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                    />
                    {errores.fechaInicio && <span className="text-red-500 text-xs">{errores.fechaInicio}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-slate-700">Fecha Fin (opcional)</label>
                    <input
                      type="datetime-local"
                      value={formEditar.FechaFin || ""}
                      onChange={(e) => setFormEditar({ ...formEditar, FechaFin: e.target.value })}
                      className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-slate-700">
                      Insumos utilizados <span className="text-red-500">*</span>
                    </h4>
                    <button onClick={añadirDetalleEditar} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Plus size={15} /> Añadir insumo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {formEditar.detalle.map((d, index) => (
                      <div key={d._tempId} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">
                              Insumo <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={d.InsumoId ? insumos.find((i) => i.InsumoId === d.InsumoId)?.Nombre || d.InsumoId : ""}
                              placeholder="Haz clic para seleccionar un insumo"
                              className={`h-10 px-3 border rounded bg-white cursor-pointer w-full ${errores[`insumo-${index}`] ? "border-red-500" : "border-gray-300"} hover:bg-gray-50`}
                              onClick={() => goToSelectInsumo(index)}
                            />
                            {errores[`insumo-${index}`] && <span className="text-red-500 text-xs mt-1 block">{errores[`insumo-${index}`]}</span>}
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">
                              Cantidad <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={d.CantidadUsada}
                              onChange={(e) => {
                                actualizarDetalleEditar(index, "CantidadUsada", Number(e.target.value));
                                if (errores[`cantidad-${index}`]) setErrores((prev) => ({ ...prev, [`cantidad-${index}`]: "" }));
                              }}
                              className={`h-10 px-3 border rounded w-full ${errores[`cantidad-${index}`] ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                            />
                            {errores[`cantidad-${index}`] && <span className="text-red-500 text-xs mt-1">{errores[`cantidad-${index}`]}</span>}
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          {formEditar.detalle.length > 1 && (
                            <button
                              onClick={() => eliminarDetalleEditar(index)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                            >
                              <Trash2 size={16} /> <span>Eliminar</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                  <button onClick={handleEdit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg font-medium">
                    Guardar cambios
                  </button>
                  <button onClick={goToBackToList} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 h-11 rounded-lg font-medium">
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-red-500">No se pudo cargar la producción para editar.</div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover />
    </div>
  );
};