import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2, ChevronDown } from "lucide-react";
import Modal from "../../components/modals/modal";
import axios from "axios";

const API_URL = `http://localhost:3000/api/produccion`;
const API_DETALLE_URL = `http://localhost:3000/api/detalle-produccion`;

export const Produccion = () => {
  const [producciones, setProducciones] = useState([]);
  const [estadoActivo, setEstadoActivo] = useState({});
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedProduccion, setSelectedProduccion] = useState(null);

  const [formCrear, setFormCrear] = useState({
    PedidoClienteId: "",
    Estado: "En Proceso",
    FechaInicio: "",
    FechaFin: "",
  });

  const [formEditar, setFormEditar] = useState({
    ProduccionId: "",
    PedidoClienteId: "",
    Estado: "En Proceso",
    FechaInicio: "",
    FechaFin: "",
    detalle: [],
  });

  const [detalles, setDetalles] = useState([{ InsumoId: "", CantidadUsada: 1 }]);
  const [pedidos, setPedidos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPedidos, resInsumos] = await Promise.all([
          axios.get("http://localhost:3000/api/pedidos-clientes"),
          axios.get("http://localhost:3000/api/insumos"),
        ]);
        setPedidos(Array.isArray(resPedidos.data) ? resPedidos.data : []);
        setInsumos(Array.isArray(resInsumos.data) ? resInsumos.data : []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    fetchData();
  }, []);

  const fetchProducciones = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/produccion`);
      const produccionesBase = Array.isArray(data) ? data : [];
      const produccionesConDetalles = await Promise.all(
        produccionesBase.map(async (prod) => {
          try {
            const { data: detalles } = await axios.get(`${ `http://localhost:3000/api/detalle-produccion`}/${prod.ProduccionId}`);
            return { ...prod, detalle: detalles || [] };
          } catch {
            return { ...prod, detalle: [] };
          }
        })
      );
      setProducciones(produccionesConDetalles);
      const estados = {};
      produccionesConDetalles.forEach((p) => {
        estados[p.ProduccionId] = p.Estado || "En Proceso";
      });
      setEstadoActivo(estados);
    } catch (err) {
      console.error("Error al cargar producciones:", err);
    }
  };

  useEffect(() => {
    fetchProducciones();
  }, []);

  const produccionesFiltradas = producciones.filter((p) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(p[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);
  const añadirDetalle = () => setDetalles([...detalles, { InsumoId: "", CantidadUsada: 1 }]);
  const eliminarDetalle = (index) => { if (detalles.length > 1) setDetalles(detalles.filter((_, i) => i !== index)); };
  const actualizarDetalle = (index, campo, valor) => { const nuevos = [...detalles]; nuevos[index][campo] = valor; setDetalles(nuevos); };

  const handleCreate = async () => {
  try {
    // Validaciones
    if (!formCrear.PedidoClienteId) return alert("Debe seleccionar un pedido");
    if (!formCrear.FechaInicio) return alert("Debe seleccionar la fecha de inicio");

    // Limpiar detalles
    const detallesLimpios = detalles
      .map((d) => ({
        InsumoId: (d.InsumoId || "").trim(),
        CantidadUsada: Number(d.CantidadUsada) || 1,
      }))
      .filter((d) => d.InsumoId !== "");

    if (detallesLimpios.length === 0)
      return alert("Debe agregar al menos un insumo");

    // Mostrar datos que se enviarán (opcional, para debug)
    console.log("Datos a enviar:", { ...formCrear, detalle: detallesLimpios });

    // POST al backend
    await axios.post(`http://localhost:3000/api/produccion`, { ...formCrear, detalle: detallesLimpios });

    // Resetear formulario y detalles
    setFormCrear({
      PedidoClienteId: "",
      Estado: "En Proceso",
      FechaInicio: "",
      FechaFin: "",
    });
    setDetalles([{ InsumoId: "", CantidadUsada: 1 }]);
    setOpenCreate(false);

    // Recargar producciones
    fetchProducciones();
  } catch (err) {
    console.error("Error al crear producción:", err);
    alert(
      "Error al crear producción: " +
        (err.response?.data?.error || err.message)
    );
  }
};


  const handleEdit = async () => {
    try {
      if (!formEditar.PedidoClienteId) return alert("Debe seleccionar un pedido");
      if (!formEditar.FechaInicio) return alert("Debe seleccionar la fecha inicio");

      const detallesLimpios = formEditar.detalle
        .map((d) => ({ InsumoId: (d.InsumoId || "").trim(), CantidadUsada: Number(d.CantidadUsada) || 1 }))
        .filter((d) => d.InsumoId !== "");

      await axios.put(`${`http://localhost:3000/api/produccion`}/${formEditar.ProduccionId}`, {
        PedidoClienteId: formEditar.PedidoClienteId,
        Estado: formEditar.Estado,
        FechaInicio: formEditar.FechaInicio,
        FechaFin: formEditar.FechaFin || null,
      });

      const { data: detallesActuales } = await axios.get(`${ `http://localhost:3000/api/detalle-produccion`}/${formEditar.ProduccionId}`);
      for (const detalle of detallesActuales) await axios.delete(`${ `http://localhost:3000/api/detalle-produccion`}/${detalle.DetalleProduccionId}`);
      for (const detalle of detallesLimpios) await axios.post( `http://localhost:3000/api/detalle-produccion`, { ProduccionId: formEditar.ProduccionId, ...detalle });

      setOpenEditar(false);
      fetchProducciones();
    } catch (err) {
      console.error("Error al editar producción:", err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedProduccion) return;
      await axios.delete(`${`http://localhost:3000/api/produccion`}/${selectedProduccion.ProduccionId}`);
      setOpenEliminar(false);
      fetchProducciones();
    } catch (err) {
      console.error("Error al eliminar producción:", err);
      alert("Error al eliminar producción: " + (err.response?.data?.error || err.message));
    }
  };

  const openEditarModal = (p) => { setSelectedProduccion(p); setFormEditar({ ...p, detalle: p.detalle || [] }); setOpenEditar(true); };
  const openVerModal = (p) => { setSelectedProduccion(p); setFormEditar({ ...p, detalle: p.detalle || [] }); setOpenVer(true); };
  const openEliminarModal = (p) => { setSelectedProduccion(p); setOpenEliminar(true); };

  const handleToggleEstado = async (idProduccion, estadoActual) => {
    const nuevoEstado = estadoActual === "En Proceso" ? "Finalizado" : "En Proceso";
    const produccionActual = producciones.find((p) => p.ProduccionId === idProduccion);
    if (!produccionActual) return;
    try {
      await axios.put(`${`http://localhost:3000/api/produccion`}/${idProduccion}`, { ...produccionActual, Estado: nuevoEstado });
      setEstadoActivo((prev) => ({ ...prev, [idProduccion]: nuevoEstado }));
      setProducciones((prev) => prev.map((p) => (p.ProduccionId === idProduccion ? { ...p, Estado: nuevoEstado } : p)));
    } catch (err) {
      console.error("Error al actualizar estado", err);
      alert("Error al actualizar estado: " + (err.response?.data?.error || err.message));
    }
  };

  const getEstadoColor = (estado) => (estado === "Finalizado" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800");

  const renderModalForm = (type = "create") => {
    const isReadOnly = type === "ver";
    const formState = type === "create" ? formCrear : formEditar;
    const formSetter = type === "create" ? setFormCrear : setFormEditar;
    const detallesParaRender = type === "create" ? detalles : formState.detalle || [];

    return (
      <form className="flex flex-col gap-8 p-6 bg-white rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Pedido Cliente</label>
            <select
              disabled={isReadOnly}
              value={formState.PedidoClienteId}
              onChange={(e) => formSetter({ ...formState, PedidoClienteId: e.target.value })}
              className="w-full h-11 px-3 border rounded bg-gray-100"
            >
              <option key="default-pedido" value="">Seleccione pedido</option>
              {pedidos.map((p, index) => (
                <option key={p.PedidoClienteId ?? `pedido-${index}`} value={p.PedidoClienteId ?? ""}>
                  {p.PedidoClienteId ? `${p.PedidoClienteId} - Cliente: ${p.ClienteId}` : "Pedido sin ID"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Estado</label>
            <select
              disabled={isReadOnly}
              value={formState.Estado}
              onChange={(e) => formSetter({ ...formState, Estado: e.target.value })}
              className="w-full h-11 px-3 border rounded bg-gray-100"
            >
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha Inicio</label>
            <input
              type="datetime-local"
              readOnly={isReadOnly}
              value={formState.FechaInicio}
              onChange={(e) => formSetter({ ...formState, FechaInicio: e.target.value })}
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha Fin</label>
            <input
              type="datetime-local"
              readOnly={isReadOnly}
              value={formState.FechaFin}
              onChange={(e) => formSetter({ ...formState, FechaFin: e.target.value })}
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (type === "create") añadirDetalle();
                else formSetter({ ...formState, detalle: [...formState.detalle, { InsumoId: "", CantidadUsada: 1 }] });
              }}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} /> Añadir insumo
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {detallesParaRender.map((d, index) => (
            <div key={d.DetalleProduccionId ?? `detalle-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-3 border p-3 rounded bg-gray-50">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label>Insumo</label>
                <select
                  disabled={isReadOnly}
                  value={d.InsumoId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "InsumoId", val);
                    else { const copy = [...formState.detalle]; copy[index].InsumoId = val; formSetter({ ...formState, detalle: copy }); }
                  }}
                  className="h-10 px-2 border rounded bg-white"
                >
                  <option key="default-insumo" value="">Seleccione insumo</option>
                  {insumos.map((i, idx) => (
                    <option key={i.InsumoId ?? `insumo-${idx}`} value={i.InsumoId ?? ""}>
                      {i.Nombre ? `${i.Nombre} - Stock: ${i.CantidadDisponible}` : "Insumo sin nombre"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Cantidad Usada</label>
                <input
                  type="number"
                  readOnly={isReadOnly}
                  value={d.CantidadUsada ?? ""}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (type === "create") actualizarDetalle(index, "CantidadUsada", num);
                    else { const copy = [...formState.detalle]; copy[index].CantidadUsada = num; formSetter({ ...formState, detalle: copy }); }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              {!isReadOnly && (
                <div className="md:col-span-3 flex justify-end">
                  <Trash2
                    size={18}
                    className="text-red-600 cursor-pointer hover:text-red-800"
                    onClick={() => {
                      if (type === "create") eliminarDetalle(index);
                      else { const copy = [...formState.detalle]; copy.splice(index, 1); formSetter({ ...formState, detalle: copy }); }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          {type === "create" && <button type="button" onClick={handleCreate} className="flex-1 h-11 bg-green-500 text-white rounded hover:bg-green-600">Crear</button>}
          {type === "editar" && <button type="button" onClick={handleEdit} className="flex-1 h-11 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar cambios</button>}
          <button type="button" className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={() => { if (type === "create") setOpenCreate(false); if (type === "editar") setOpenEditar(false); if (type === "ver") setOpenVer(false); }}>
            {type === "ver" ? "Cerrar" : "Cancelar"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Producción</h1>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link
            onClick={() => { setFormCrear({ PedidoClienteId: "", Estado: "En Proceso", FechaInicio: "", FechaFin: "" }); setDetalles([{ InsumoId: "", CantidadUsada: 1 }]); setOpenCreate(true); }}
            className="inline-flex items-center gap-2 bg-green-800 text-white px-6 py-3 rounded-lg"
          >
            <Plus size={18} /> Nueva producción
          </Link>

          <select value={filtroCampo} onChange={(e) => setFiltroCampo(e.target.value)} className="border rounded-lg px-4 py-3 bg-white">
            <option value="">Filtrar por campo</option>
            <option value="ProduccionId">ProducciónID</option>
            <option value="PedidoClienteId">PedidoID</option>
            <option value="Estado">Estado</option>
          </select>

          <div className="relative flex-1 max-w-md">
            <input type="text" placeholder="Buscar producción" value={filtroText} onChange={(e) => setFiltroText(e.target.value)} className="border rounded-lg pl-10 pr-4 py-3 w-full" />
            <img src="/multimedia/lupa.png" alt="Buscar" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
          </div>
        </div>

        {/* MODALES */}
        <Modal open={openCreate} onClose={() => setOpenCreate(false)}><div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl"><h3 className="text-lg font-bold mb-6">Nueva producción</h3>{renderModalForm("create")}</div></Modal>
        <Modal open={openEditar} onClose={() => setOpenEditar(false)}><div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl"><h3 className="text-lg font-bold mb-6">Editar producción</h3>{renderModalForm("editar")}</div></Modal>
        <Modal open={openVer} onClose={() => setOpenVer(false)}><div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl"><h3 className="text-lg font-bold mb-6">Ver producción</h3>{selectedProduccion ? renderModalForm("ver") : <p>Cargando...</p>}</div></Modal>
        <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}><div className="w-[750px] max-h-[90vh] overflow-y-auto p-6 rounded-xl"><h3 className="text-lg font-bold mb-4">Eliminar producción</h3><p className="mb-6">¿Está seguro de eliminar la producción?</p><div className="flex gap-4"><button className="flex-1 bg-red-500 text-white py-2 rounded" onClick={handleDelete}>Eliminar</button><button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded" onClick={() => setOpenEliminar(false)}>Cancelar</button></div></div></Modal>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto max-h-[600px] w-full">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-left text-white">Producción ID</th>
                <th className="px-4 py-3 text-left text-white">Pedido Cliente ID</th>
                <th className="px-4 py-3 text-left text-white">Fecha Inicio</th>
                <th className="px-4 py-3 text-left text-white">Fecha Fin</th>
                <th className="px-4 py-3 text-center text-white">Estado</th>
                <th className="px-4 py-3 text-center text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {produccionesFiltradas.map((produccion) => (
                <React.Fragment key={produccion.ProduccionId}>
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-center"><button onClick={() => toggleExpand(produccion.ProduccionId)}><ChevronDown size={18} className={`transform transition-transform ${expandedRow === produccion.ProduccionId ? "rotate-180" : ""}`} /></button></td>
                    <td className="py-4 px-6">{produccion.ProduccionId}</td>
                    <td className="py-4 px-6">{produccion.PedidoClienteId}</td>
                    <td className="py-4 px-6">{produccion.FechaInicio}</td>
                    <td className="py-4 px-6">{produccion.FechaFin}</td>
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => handleToggleEstado(produccion.ProduccionId, estadoActivo[produccion.ProduccionId])} className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(estadoActivo[produccion.ProduccionId])}`}>{estadoActivo[produccion.ProduccionId]}</button>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openVerModal(produccion)}><Eye size={16} className="text-emerald-600 hover:text-emerald-800" /></button>
                        <button onClick={() => openEditarModal(produccion)}><Edit size={16} className="text-blue-600 hover:text-blue-800" /></button>
                        <button onClick={() => openEliminarModal(produccion)}><Trash2 size={16} className="text-red-600 hover:text-red-800" /></button>
                      </div>
                    </td>
                  </tr>

                  {expandedRow === produccion.ProduccionId && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="py-3 px-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="py-2 px-4">DetalleProducciónId</th>
                                <th className="py-2 px-4">InsumoId</th>
                                <th className="py-2 px-4">Cantidad Usada</th>
                                <th className="py-2 px-4 text-center">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(produccion.detalle || []).map((item, idx) => (
                                <tr key={item.DetalleProduccionId ?? `detalle-${produccion.ProduccionId}-${idx}`}>
                                  <td className="py-2 px-4">{item.DetalleProduccionId}</td>
                                  <td className="py-2 px-4">{item.InsumoId}</td>
                                  <td className="py-2 px-4">{item.CantidadUsada}</td>
                                  <td className="py-2 px-4 text-center">
                                    <button onClick={() => openVerModal(produccion)}><Eye size={14} className="text-emerald-600 hover:text-emerald-800" /></button>
                                  </td>
                                </tr>
                              ))}
                              {(produccion.detalle || []).length === 0 && (
                                <tr><td colSpan={4} className="py-2 text-center text-gray-500">Sin detalles</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {produccionesFiltradas.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-gray-500">No hay producciones a mostrar</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
