import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Plus, Edit, Eye, Trash2, ArrowLeft, Search } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Helper: solo primeras 3 letras o dígitos
const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const Produccion = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const mode = useMemo(() => {
    if (location.pathname === "/dashboard/produccion/nuevo") return "create";
    if (id && location.pathname === `/dashboard/produccion/${id}/editar`) return "edit";
    if (id && location.pathname === `/dashboard/produccion/${id}`) return "view";
    return "list";
  }, [location.pathname, id]);

  const [producciones, setProducciones] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [formCrear, setFormCrear] = useState({
    PedidoClienteId: "",
    Estado: "En Proceso",
    FechaInicio: "",
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

  // === Cargar pedidos e insumos ===
  useEffect(() => {
    const fetchRelacionados = async () => {
      try {
        const [resPedidos, resInsumos] = await Promise.all([
          axios.get("http://localhost:3000/api/pedidos-clientes"),
          axios.get("http://localhost:3000/api/insumos"),
        ]);
        setPedidos(Array.isArray(resPedidos.data) ? resPedidos.data : []);
        setInsumos(Array.isArray(resInsumos.data) ? resInsumos.data : []);
      } catch (err) {
        toast.error("Error al cargar pedidos o insumos");
      }
    };
    fetchRelacionados();
  }, []);

  // === Cargar producciones (solo datos básicos en lista) ===
  const fetchProducciones = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/produccion");
      setProducciones(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al cargar producciones");
    }
  };

  useEffect(() => {
    if (mode === "list") fetchProducciones();
  }, [mode]);

  // === Cargar para ver/editar (con detalles) ===
  useEffect(() => {
    if (mode === "view" || mode === "edit") {
      setLoading(true);
      const cargarProduccion = async () => {
        try {
          const res = await axios.get(`http://localhost:3000/api/produccion/${id}`);
          const detalleRes = await axios.get(`http://localhost:3000/api/detalle-produccion/${id}`);
          const detalle = Array.isArray(detalleRes.data)
            ? detalleRes.data.map(item => ({ ...item, _tempId: item.DetalleProduccionId || crypto.randomUUID() }))
            : [];
          const produccionCompleta = { ...res.data, detalle };
          if (mode === "edit") setFormEditar(produccionCompleta);
          if (mode === "view") setFormEditar(produccionCompleta);
        } catch (err) {
          toast.error("Error al cargar producción");
          navigate("/dashboard/produccion");
        } finally {
          setLoading(false);
        }
      };
      cargarProduccion();
    }
  }, [mode, id, navigate]);

  // === Filtro ===
  const produccionesFiltradas = producciones.filter((p) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(p[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  // === Navegación ===
  const goToBackToList = () => {
    setErrores({});
    navigate("/dashboard/produccion");
  };
  const goToCreate = () => {
    setErrores({});
    navigate("/dashboard/produccion/nuevo");
  };
  const goToView = (p) => navigate(`/dashboard/produccion/${p.ProduccionId}`);
  const goToEdit = (p) => navigate(`/dashboard/produccion/${p.ProduccionId}/editar`);

  // === Detalles - Crear ===
  const añadirDetalleCrear = () => {
    setDetallesCrear(prev => [...prev, { _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 }]);
  };
  const eliminarDetalleCrear = (index) => {
    if (detallesCrear.length > 1) setDetallesCrear(prev => prev.filter((_, i) => i !== index));
  };
  const actualizarDetalleCrear = (index, campo, valor) => {
    setDetallesCrear(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: valor };
      return copy;
    });
  };

  // === Detalles - Editar ===
  const añadirDetalleEditar = () => {
    if (!formEditar) return;
    setFormEditar(prev => ({ ...prev, detalle: [...prev.detalle, { _tempId: crypto.randomUUID(), InsumoId: "", CantidadUsada: 1 }] }));
  };
  const eliminarDetalleEditar = (index) => {
    if (!formEditar || formEditar.detalle.length <= 1) return;
    setFormEditar(prev => ({ ...prev, detalle: prev.detalle.filter((_, i) => i !== index) }));
  };
  const actualizarDetalleEditar = (index, campo, valor) => {
    setFormEditar(prev => {
      if (!prev) return prev;
      const nuevos = [...prev.detalle];
      nuevos[index] = { ...nuevos[index], [campo]: valor };
      return { ...prev, detalle: nuevos };
    });
  };

  // === Validación ===
  const validarFormulario = (form, detalles) => {
    const errores = {};
    if (!form.PedidoClienteId?.trim()) errores.pedido = "Debe seleccionar un pedido";
    if (!form.FechaInicio) errores.fechaInicio = "La fecha de inicio es obligatoria";
    if (!detalles || detalles.length === 0) errores.detalles = "Debe agregar al menos un insumo";
    for (let i = 0; i < detalles.length; i++) {
      if (!detalles[i].InsumoId) errores[`insumo-${i}`] = `Insumo ${i + 1}: seleccione un insumo`;
      if (!detalles[i].CantidadUsada || Number(detalles[i].CantidadUsada) <= 0) {
        errores[`cantidad-${i}`] = `Insumo ${i + 1}: cantidad debe ser > 0`;
      }
    }
    return errores;
  };

  // === Guardar ===
  const handleCreate = async () => {
    const errores = validarFormulario(formCrear, detallesCrear);
    if (Object.keys(errores).length > 0) {
      setErrores(errores);
      toast.error("Por favor corrige los errores");
      return;
    }
    setErrores({});
    try {
      const detallesLimpios = detallesCrear
        .map(d => ({ InsumoId: d.InsumoId?.trim(), CantidadUsada: Number(d.CantidadUsada) || 1 }))
        .filter(d => d.InsumoId);
      await axios.post("http://localhost:3000/api/produccion", { ...formCrear, detalle: detallesLimpios });
      toast.success("Producción creada exitosamente");
      goToBackToList();
    } catch (err) {
      toast.error("Error al crear producción: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async () => {
    if (!formEditar) return;
    const errores = validarFormulario(formEditar, formEditar.detalle);
    if (Object.keys(errores).length > 0) {
      setErrores(errores);
      toast.error("Por favor corrige los errores");
      return;
    }
    setErrores({});
    try {
      await axios.put(`http://localhost:3000/api/produccion/${formEditar.ProduccionId}`, {
        PedidoClienteId: formEditar.PedidoClienteId,
        Estado: formEditar.Estado,
        FechaInicio: formEditar.FechaInicio,
        FechaFin: formEditar.FechaFin || null,
      });

      const { data: detallesActuales } = await axios.get(`http://localhost:3000/api/detalle-produccion/${formEditar.ProduccionId}`);
      for (const d of detallesActuales) {
        await axios.delete(`http://localhost:3000/api/detalle-produccion/${d.DetalleProduccionId}`);
      }
      for (const d of formEditar.detalle) {
        if (d.InsumoId?.trim()) {
          await axios.post("http://localhost:3000/api/detalle-produccion", {
            ProduccionId: formEditar.ProduccionId,
            InsumoId: d.InsumoId.trim(),
            CantidadUsada: Number(d.CantidadUsada) || 1,
          });
        }
      }
      toast.success("Producción actualizada exitosamente");
      goToBackToList();
    } catch (err) {
      toast.error("Error al editar producción: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (idProduccion) => {
    if (!window.confirm("¿Está seguro de eliminar esta producción?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/produccion/${idProduccion}`);
      setProducciones(prev => prev.filter(p => p.ProduccionId !== idProduccion));
      toast.success("Producción eliminada");
    } catch (err) {
      toast.error("Error al eliminar producción");
    }
  };

  // ✅ CORRECCIÓN CLAVE: enviar todos los campos al cambiar estado
  const toggleEstado = async (idProduccion, nuevoEstado) => {
    const produccionActual = producciones.find(p => p.ProduccionId === idProduccion);
    if (!produccionActual) return;

    try {
      await axios.put(`http://localhost:3000/api/produccion/${idProduccion}`, {
        PedidoClienteId: produccionActual.PedidoClienteId,
        Estado: nuevoEstado,
        FechaInicio: produccionActual.FechaInicio,
        FechaFin: produccionActual.FechaFin || null,
      });
      setProducciones(prev =>
        prev.map(p =>
          p.ProduccionId === idProduccion ? { ...p, Estado: nuevoEstado } : p
        )
      );
      toast.success("Estado actualizado");
    } catch (err) {
      toast.error("Error al actualizar estado");
    }
  };

  const getEstadoColor = (estado) =>
    estado === "Finalizado" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";

  // === RENDER ===
  return (
    <div className="min-h-screen bg-slate-50 p-6"> {/* ✅ Fondo neutro */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Producción</h1>

        {/* === LISTA === */}
        {mode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4">
              <button onClick={goToCreate} className="bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                <Plus size={18} /> Nueva producción
              </button>
              <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border rounded-lg px-4 py-3 bg-white text-slate-700"
              >
                <option value="">Filtrar por campo</option>
                <option value="ProduccionId">Producción ID</option>
                <option value="PedidoClienteId">Pedido ID</option>
                <option value="Estado">Estado</option>
              </select>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar producción"
                  value={filtroText}
                  onChange={(e) => setFiltroText(e.target.value)}
                  className="border rounded-lg pl-10 pr-4 py-3 w-full"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[600px]">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-white text-left">Producción ID</th>
                    <th className="px-4 py-3 text-white text-left">Pedido ID</th>
                    <th className="px-4 py-3 text-white text-left">Fecha Inicio</th>
                    <th className="px-4 py-3 text-white text-left">Fecha Fin</th>
                    <th className="px-4 py-3 text-white text-center">Estado</th>
                    <th className="px-4 py-3 text-white text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {produccionesFiltradas.map((p) => (
                    <tr key={p.ProduccionId} className="hover:bg-slate-50">
                      <td className="py-4 px-6">{getShortId(p.ProduccionId)}</td>
                      <td className="py-4 px-6">{getShortId(p.PedidoClienteId)}</td>
                      <td className="py-4 px-6">{p.FechaInicio}</td>
                      <td className="py-4 px-6">{p.FechaFin || "—"}</td>
                      <td className="py-4 px-6 text-center">
                        <select
                          value={p.Estado}
                          onChange={(e) => toggleEstado(p.ProduccionId, e.target.value)}
                          className={`px-3 py-1 text-xs font-medium border rounded focus:ring-2 focus:ring-blue-300 focus:outline-none ${getEstadoColor(p.Estado)}`}
                        >
                          <option value="En Proceso">En Proceso</option>
                          <option value="Finalizado">Finalizado</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => goToView(p)}><Eye size={16} className="text-emerald-600 hover:text-emerald-800" /></button>
                          <button onClick={() => goToEdit(p)}><Edit size={16} className="text-blue-600 hover:text-blue-800" /></button>
                          <button onClick={() => handleDelete(p.ProduccionId)}><Trash2 size={16} className="text-red-600 hover:text-red-800" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* === CREAR === */}
        {mode === "create" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Nueva producción</h3>
            </div>
            {errores.detalles && <div className="text-red-500 text-sm mb-2">{errores.detalles}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Pedido Cliente *</label>
                <select
                  value={formCrear.PedidoClienteId}
                  onChange={(e) => {
                    setFormCrear({ ...formCrear, PedidoClienteId: e.target.value });
                    if (errores.pedido) setErrores(prev => ({ ...prev, pedido: "" }));
                  }}
                  className={`w-full h-11 px-3 border rounded ${errores.pedido ? "border-red-500" : ""}`}
                >
                  <option value="">Seleccione un pedido</option>
                  {pedidos.map((p) => (
                    <option key={p.PedidoClienteId} value={p.PedidoClienteId}>
                      {getShortId(p.PedidoClienteId)} - {p.NombreCliente || p.ClienteId}
                    </option>
                  ))}
                </select>
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
                  onChange={(e) => {
                    setFormCrear({ ...formCrear, FechaInicio: e.target.value });
                    if (errores.fechaInicio) setErrores(prev => ({ ...prev, fechaInicio: "" }));
                  }}
                  className={`w-full h-11 px-3 border rounded ${errores.fechaInicio ? "border-red-500" : ""}`}
                />
                {errores.fechaInicio && <span className="text-red-500 text-xs">{errores.fechaInicio}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha Fin</label>
                <input
                  type="datetime-local"
                  value={formCrear.FechaFin}
                  onChange={(e) => setFormCrear({ ...formCrear, FechaFin: e.target.value })}
                  className="w-full h-11 px-3 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <button type="button" onClick={añadirDetalleCrear} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={15} /> Añadir insumo
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {detallesCrear.map((d, index) => (
                <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 rounded bg-gray-50">
                  <div className="flex flex-col gap-2">
                    <label>Insumo *</label>
                    <select
                      value={d.InsumoId || ""}
                      onChange={(e) => {
                        actualizarDetalleCrear(index, "InsumoId", e.target.value);
                        if (errores[`insumo-${index}`]) {
                          setErrores(prev => ({ ...prev, [`insumo-${index}`]: "" }));
                        }
                      }}
                      className={`h-10 px-2 border rounded bg-white ${errores[`insumo-${index}`] ? "border-red-500" : ""}`}
                    >
                      <option value="">Seleccione</option>
                      {insumos.map((i) => (
                        <option key={i.InsumoId} value={i.InsumoId}>
                          {i.Nombre} (Stock: {i.Stock})
                        </option>
                      ))}
                    </select>
                    {errores[`insumo-${index}`] && <span className="text-red-500 text-xs">{errores[`insumo-${index}`]}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Cantidad Usada *</label>
                    <input
                      type="number"
                      min="1"
                      value={d.CantidadUsada}
                      onChange={(e) => {
                        actualizarDetalleCrear(index, "CantidadUsada", Number(e.target.value));
                        if (errores[`cantidad-${index}`]) {
                          setErrores(prev => ({ ...prev, [`cantidad-${index}`]: "" }));
                        }
                      }}
                      className={`h-10 px-2 border rounded ${errores[`cantidad-${index}`] ? "border-red-500" : ""}`}
                    />
                    {errores[`cantidad-${index}`] && <span className="text-red-500 text-xs">{errores[`cantidad-${index}`]}</span>}
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Trash2 size={18} className="text-red-600 cursor-pointer" onClick={() => eliminarDetalleCrear(index)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={handleCreate} className="flex-1 bg-green-500 text-white h-11 rounded">Crear</button>
              <button type="button" onClick={goToBackToList} className="flex-1 bg-gray-200 text-gray-700 h-11 rounded">Cancelar</button>
            </div>
          </div>
        )}

        {/* === VER === */}
        {mode === "view" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Ver producción #{getShortId(id)}</h3>
            </div>
            {loading ? (
              <div className="p-6">Cargando...</div>
            ) : formEditar ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><strong>Producción ID:</strong> {getShortId(formEditar.ProduccionId)}</div>
                  <div><strong>Pedido ID:</strong> {getShortId(formEditar.PedidoClienteId)}</div>
                  <div><strong>Fecha Inicio:</strong> {formEditar.FechaInicio || "—"}</div>
                  <div><strong>Fecha Fin:</strong> {formEditar.FechaFin || "—"}</div>
                  <div>
                    <strong>Estado:</strong>{' '}
                    <span className={`px-2 py-1 rounded ${getEstadoColor(formEditar.Estado)}`}>
                      {formEditar.Estado}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2">Insumos utilizados:</h4>
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm border rounded">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-2 px-4">Insumo</th>
                          <th className="py-2 px-4">Cantidad Usada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formEditar.detalle.map((d, idx) => (
                          <tr key={d._tempId || idx} className="border-t">
                            <td className="py-2 px-4">{insumos.find(i => i.InsumoId === d.InsumoId)?.Nombre || d.InsumoId}</td>
                            <td className="py-2 px-4">{d.CantidadUsada}</td>
                          </tr>
                        ))}
                        {formEditar.detalle.length === 0 && (
                          <tr><td colSpan={2} className="py-2 text-center text-gray-500">Sin insumos</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button onClick={goToBackToList} className="w-full h-11 bg-gray-200 text-gray-700 rounded">Cerrar</button>
              </div>
            ) : (
              <div className="p-6 text-red-500">No se pudo cargar la producción.</div>
            )}
          </div>
        )}

        {/* === EDITAR === */}
        {mode === "edit" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Editar producción #{getShortId(id)}</h3>
            </div>
            {loading ? (
              <div className="p-6">Cargando...</div>
            ) : formEditar ? (
              <>
                {errores.detalles && <div className="text-red-500 text-sm mb-2">{errores.detalles}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Pedido Cliente *</label>
                    <select
                      value={formEditar.PedidoClienteId}
                      onChange={(e) => {
                        setFormEditar({ ...formEditar, PedidoClienteId: e.target.value });
                        if (errores.pedido) setErrores(prev => ({ ...prev, pedido: "" }));
                      }}
                      className={`w-full h-11 px-3 border rounded ${errores.pedido ? "border-red-500" : ""}`}
                    >
                      <option value="">Seleccione un pedido</option>
                      {pedidos.map((p) => (
                        <option key={p.PedidoClienteId} value={p.PedidoClienteId}>
                          {getShortId(p.PedidoClienteId)} - {p.NombreCliente || p.ClienteId}
                        </option>
                      ))}
                    </select>
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
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Fecha Inicio *</label>
                    <input
                      type="datetime-local"
                      value={formEditar.FechaInicio}
                      onChange={(e) => {
                        setFormEditar({ ...formEditar, FechaInicio: e.target.value });
                        if (errores.fechaInicio) setErrores(prev => ({ ...prev, fechaInicio: "" }));
                      }}
                      className={`w-full h-11 px-3 border rounded ${errores.fechaInicio ? "border-red-500" : ""}`}
                    />
                    {errores.fechaInicio && <span className="text-red-500 text-xs">{errores.fechaInicio}</span>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Fecha Fin</label>
                    <input
                      type="datetime-local"
                      value={formEditar.FechaFin || ""}
                      onChange={(e) => setFormEditar({ ...formEditar, FechaFin: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <button type="button" onClick={añadirDetalleEditar} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={15} /> Añadir insumo
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {formEditar.detalle.map((d, index) => (
                    <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 rounded bg-gray-50">
                      <div className="flex flex-col gap-2">
                        <label>Insumo *</label>
                        <select
                          value={d.InsumoId || ""}
                          onChange={(e) => {
                            actualizarDetalleEditar(index, "InsumoId", e.target.value);
                            if (errores[`insumo-${index}`]) {
                              setErrores(prev => ({ ...prev, [`insumo-${index}`]: "" }));
                            }
                          }}
                          className={`h-10 px-2 border rounded bg-white ${errores[`insumo-${index}`] ? "border-red-500" : ""}`}
                        >
                          <option value="">Seleccione</option>
                          {insumos.map((i) => (
                            <option key={i.InsumoId} value={i.InsumoId}>
                              {i.Nombre} (Stock: {i.Stock})
                            </option>
                          ))}
                        </select>
                        {errores[`insumo-${index}`] && <span className="text-red-500 text-xs">{errores[`insumo-${index}`]}</span>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label>Cantidad Usada *</label>
                        <input
                          type="number"
                          min="1"
                          value={d.CantidadUsada}
                          onChange={(e) => {
                            actualizarDetalleEditar(index, "CantidadUsada", Number(e.target.value));
                            if (errores[`cantidad-${index}`]) {
                              setErrores(prev => ({ ...prev, [`cantidad-${index}`]: "" }));
                            }
                          }}
                          className={`h-10 px-2 border rounded ${errores[`cantidad-${index}`] ? "border-red-500" : ""}`}
                        />
                        {errores[`cantidad-${index}`] && <span className="text-red-500 text-xs">{errores[`cantidad-${index}`]}</span>}
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Trash2 size={18} className="text-red-600 cursor-pointer" onClick={() => eliminarDetalleEditar(index)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={handleEdit} className="flex-1 bg-blue-500 text-white h-11 rounded">Guardar cambios</button>
                  <button type="button" onClick={goToBackToList} className="flex-1 bg-gray-200 text-gray-700 h-11 rounded">Cancelar</button>
                </div>
              </>
            ) : (
              <div className="p-6 text-red-500">No se pudo cargar la producción.</div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};