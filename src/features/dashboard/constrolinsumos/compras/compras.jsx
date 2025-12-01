import React, { useEffect, useState } from "react";
import { Plus, Edit, Eye, Trash2, ChevronDown } from "lucide-react";
import Modal from "../../components/modals/modal";
import axios from "axios";

const API_URL = `http://localhost:3000/api/compras`;
const API_DETALLE_URL = `http://localhost:3000/api/detalle-compras`;

// --- NUEVA VERSIÓN ROBUSTA DE FORMATEAR FECHA ---
const formatearFecha = (f) => {
  if (!f) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return f;
  const d = new Date(f);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [estadoActivo, setEstadoActivo] = useState({});
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedCompra, setSelectedCompra] = useState(null);

  const [formCrear, setFormCrear] = useState({
    ProveedorId: "",
    Total: 0,
    FechaRegistro: "",
    Estado: 1,
  });

  const [formEditar, setFormEditar] = useState({
    CompraId: "",
    ProveedorId: "",
    Total: 0,
    FechaRegistro: "",
    Estado: 1,
    detalle: [],
  });

  const [detalles, setDetalles] = useState([
    { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "" }
  ]);

  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  // Cargar productos e insumos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProductos, resInsumos] = await Promise.all([
          axios.get("http://localhost:3000/service"),
          axios.get("http://localhost:3000/api/insumos")
        ]);

        setProductos(Array.isArray(resProductos.data) ? resProductos.data : []);
        setInsumos(Array.isArray(resInsumos.data) ? resInsumos.data : []);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    fetchData();
  }, []);

  // Cargar compras con detalles
  const fetchCompras = async () => {
    try {
      const { data } = await axios.get(API_URL);
      const comprasBase = Array.isArray(data) ? data : [];

      const comprasConDetalles = await Promise.all(
        comprasBase.map(async (compra) => {
          try {
            const { data: detalles } = await axios.get(
              `${API_DETALLE_URL}/compra/${compra.CompraId}`
            );

            return { ...compra, detalle: detalles || [] };
          } catch {
            return { ...compra, detalle: [] };
          }
        })
      );

      setCompras(comprasConDetalles);

      const estados = {};
      comprasConDetalles.forEach((c) => {
        estados[c.CompraId] = Number(c.Estado) === 1 ? 1 : 0;
      });

      setEstadoActivo(estados);
    } catch (err) {
      console.error("Error al cargar compras:", err);
    }
  };

  useEffect(() => {
    fetchCompras();
  }, []);

  const comprasFiltradas = compras.filter((c) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(c[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  // --- toggleExpand (FALTABA Y ROMPÍA TODO) ---
  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Manejo del detalle
  const añadirDetalle = () => {
    setDetalles([
      ...detalles,
      { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "" }
    ]);
  };

  const eliminarDetalle = (index) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = valor;
    setDetalles(nuevos);
  };

  // CREAR COMPRA + DETALLES
  const handleCreate = async () => {
    try {
      const detallesLimpios = detalles.map((d) => ({
        ...d,
        ProductoServicioId: d.ProductoServicioId?.trim() || null,
        InsumoId: d.InsumoId?.trim() || null,
      }));

      const { data: compraCreada } = await axios.post(API_URL, {
        ...formCrear,
        FechaRegistro: formatearFecha(formCrear.FechaRegistro),
      });

      for (const d of detallesLimpios) {
        await axios.post(API_DETALLE_URL, {
          CompraId: compraCreada.CompraId,
          ...d,
        });
      }

      setOpenCreate(false);
      setFormCrear({ ProveedorId: "", Total: 0, FechaRegistro: "", Estado: 1 });
      setDetalles([{ TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "" }]);

      fetchCompras();
    } catch (err) {
      console.error("Error al crear compra:", err);
      alert(err.response?.data?.error || err.message);
    }
  };

  // EDITAR COMPRA + DETALLES
  const handleEdit = async () => {
    try {
      const payloadCompra = {
        ProveedorId: formEditar.ProveedorId,
        Total: formEditar.Total,
        FechaRegistro: formatearFecha(formEditar.FechaRegistro),
        Estado: formEditar.Estado,
      };

      await axios.put(`${API_URL}/${formEditar.CompraId}`, payloadCompra);

      const { data: detallesActuales } = await axios.get(`${API_DETALLE_URL}/compra/${formEditar.CompraId}`);

      for (const d of detallesActuales) {
        await axios.delete(`${API_DETALLE_URL}/${d.DetalleCompraId}`);
      }

      const detallesLimpios = formEditar.detalle.map((d) => ({
        ...d,
        ProductoServicioId: d.ProductoServicioId?.trim() || null,
        InsumoId: d.InsumoId?.trim() || null,
      }));

      for (const d of detallesLimpios) {
        await axios.post(API_DETALLE_URL, {
          CompraId: formEditar.CompraId,
          ...d,
        });
      }

      setOpenEditar(false);
      fetchCompras();
    } catch (err) {
      console.error("Error al editar compra:", err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedCompra) return;
      await axios.delete(`${API_URL}/${selectedCompra.CompraId}`);
      setOpenEliminar(false);
      fetchCompras();
    } catch (err) {
      console.error("Error al eliminar compra:", err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const openEditarModal = (c) => {
    setSelectedCompra(c);
    setFormEditar({
      CompraId: c.CompraId,
      ProveedorId: c.ProveedorId,
      Total: c.Total,
      FechaRegistro: formatearFecha(c.FechaRegistro),  
      Estado: Number(c.Estado),
      detalle: c.detalle || [],
    });
    setOpenEditar(true);
  };

  const openVerModal = (c) => {
    setSelectedCompra(c);
    setFormEditar({
      CompraId: c.CompraId,
      ProveedorId: c.ProveedorId,
      Total: c.Total,
      FechaRegistro: formatearFecha(c.FechaRegistro),
      Estado: Number(c.Estado),
      detalle: c.detalle || [],
    });
    setOpenVer(true);
  };

  const openEliminarModal = (c) => {
    setSelectedCompra(c);
    setOpenEliminar(true);
  };

  const handleToggleEstado = async (idCompra, nuevoEstadoBoolean) => {
    const nuevoEstadoNum = nuevoEstadoBoolean ? 1 : 0;
    const compraActual = compras.find((c) => c.CompraId === idCompra);
    if (!compraActual) return;

    try {
      await axios.put(`${API_URL}/${idCompra}`, {
        ProveedorId: compraActual.ProveedorId,
        Total: compraActual.Total,
        FechaRegistro: formatearFecha(compraActual.FechaRegistro),
        Estado: nuevoEstadoNum,
      });

      setEstadoActivo((prev) => ({ ...prev, [idCompra]: nuevoEstadoNum }));

      setCompras((prev) =>
        prev.map((c) =>
          c.CompraId === idCompra ? { ...c, Estado: nuevoEstadoNum } : c
        )
      );
    } catch (err) {
      console.error("Error al actualizar estado", err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const renderModalForm = (type = "create") => {
    const isReadOnly = type === "ver";
    const formState = type === "create" ? formCrear : formEditar;
    const formSetter = type === "create" ? setFormCrear : setFormEditar;
    const detallesParaRender = type === "create" ? detalles : formState.detalle || [];

    return (
      <form className="flex flex-col gap-8 p-6 bg-white rounded-lg">
        {/* MASTER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Proveedor ID</label>
            <input
              type="text"
              placeholder="P001"
              readOnly={isReadOnly}
              value={formState.ProveedorId}
              onChange={(e) =>
                formSetter({ ...formState, ProveedorId: e.target.value })
              }
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Fecha de registro</label>
            <input
              type="date"
              readOnly={isReadOnly}
              value={formState.FechaRegistro}
              onChange={(e) =>
                formSetter({ ...formState, FechaRegistro: e.target.value })
              }
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium">Total</label>
            <input
              type="number"
              readOnly={isReadOnly}
              value={formState.Total}
              onChange={(e) =>
                formSetter({ ...formState, Total: Number(e.target.value) })
              }
              className="w-full h-11 px-3 border rounded bg-gray-100"
            />
          </div>
        </div>

        {/* BOTÓN AÑADIR DETALLE */}
        {!isReadOnly && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (type === "create") añadirDetalle();
                else {
                  formSetter({
                    ...formState,
                    detalle: [
                      ...formState.detalle,
                      { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "" }
                    ],
                  });
                }
              }}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={16} /> Añadir detalle
            </button>
          </div>
        )}

        {/* DETALLES DINÁMICOS */}
        <div className="grid grid-cols-1 gap-4">
          {detallesParaRender.map((d, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-6 gap-3 border p-3 rounded bg-gray-50"
            >
              <div className="flex flex-col gap-2">
                <label>Tipo Detalle</label>
                <select
                  disabled={isReadOnly}
                  value={d.TipoDetalle || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "TipoDetalle", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].TipoDetalle = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded bg-white"
                >
                  <option value="">Seleccione tipo</option>
                  <option value="Producto">Producto</option>
                  <option value="Insumo">Insumo</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Producto/Servicio</label>
                <select
                  disabled={isReadOnly || d.TipoDetalle !== "Producto"}
                  value={d.ProductoServicioId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "ProductoServicioId", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].ProductoServicioId = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded bg-white"
                >
                  <option value="">Seleccione producto</option>
                  {productos.map((p) => (
                    <option key={p.ProductoServicioId} value={p.ProductoServicioId}>
                      {p.Nombre} {p.Tipo ? `(${p.Tipo})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Insumo</label>
                <select
                  disabled={isReadOnly || d.TipoDetalle !== "Insumo"}
                  value={d.InsumoId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "InsumoId", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].InsumoId = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded bg-white"
                >
                  <option value="">Seleccione insumo</option>
                  {insumos.map((i) => (
                    <option key={i.InsumoId} value={i.InsumoId}>
                      {i.Nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Cantidad</label>
                <input
                  type="number"
                  readOnly={isReadOnly}
                  value={d.Cantidad ?? ""}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    if (type === "create") actualizarDetalle(index, "Cantidad", num);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].Cantidad = num;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label>Descripción</label>
                <input
                  type="text"
                  readOnly={isReadOnly}
                  value={d.Descripcion || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (type === "create") actualizarDetalle(index, "Descripcion", val);
                    else {
                      const copy = [...formState.detalle];
                      copy[index].Descripcion = val;
                      formSetter({ ...formState, detalle: copy });
                    }
                  }}
                  className="h-10 px-2 border rounded"
                />
              </div>

              {!isReadOnly && (
                <div className="md:col-span-6 flex justify-end">
                  <Trash2
                    size={18}
                    className="text-red-600 cursor-pointer hover:text-red-800"
                    onClick={() => {
                      if (type === "create") eliminarDetalle(index);
                      else {
                        const copy = [...formState.detalle];
                        copy.splice(index, 1);
                        formSetter({ ...formState, detalle: copy });
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* BOTONES */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          {type === "create" && (
            <button
              type="button"
              onClick={handleCreate}
              className="flex-1 h-11 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Crear
            </button>
          )}

          {type === "editar" && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 h-11 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar cambios
            </button>
          )}

          <button
            type="button"
            className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            onClick={() => {
              if (type === "create") setOpenCreate(false);
              if (type === "editar") setOpenEditar(false);
              if (type === "ver") setOpenVer(false);
            }}
          >
            {type === "ver" ? "Cerrar" : "Cancelar"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Compras</h1>

        {/* BARRA DE ACCIONES */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button
            onClick={() => {
              setFormCrear({ ProveedorId: "", Total: 0, FechaRegistro: "", Estado: 1 });
              setDetalles([
                { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "" }
              ]);
              setOpenCreate(true);
            }}
            className="inline-flex items-center gap-2 bg-green-800 text-white px-6 py-3 rounded-lg"
          >
            <Plus size={18} /> Nueva compra
          </button>

          <select
            value={filtroCampo}
            onChange={(e) => setFiltroCampo(e.target.value)}
            className="border rounded-lg px-4 py-3 bg-white"
          >
            <option value="">Filtrar por campo</option>
            <option value="CompraId">CompraID</option>
            <option value="ProveedorId">ProveedorID</option>
            <option value="FechaRegistro">Fecha</option>
          </select>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar compra"
              value={filtroText}
              onChange={(e) => setFiltroText(e.target.value)}
              className="border rounded-lg pl-10 pr-4 py-3 w-full"
            />
            <img
              src="/multimedia/lupa.png"
              alt="Buscar"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
          </div>
        </div>

        {/* MODALES */}
        <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
          <div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">Nueva compra</h3>
            {renderModalForm("create")}
          </div>
        </Modal>

        <Modal open={openEditar} onClose={() => setOpenEditar(false)}>
          <div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">Editar compra</h3>
            {renderModalForm("editar")}
          </div>
        </Modal>

        <Modal open={openVer} onClose={() => setOpenVer(false)}>
          <div className="w-[850px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-6">Ver compra</h3>
            {selectedCompra ? renderModalForm("ver") : <p>Cargando...</p>}
          </div>
        </Modal>

        <Modal open={openEliminar} onClose={() => setOpenEliminar(false)}>
          <div className="w-[750px] max-h-[90vh] overflow-y-auto p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">Eliminar compra</h3>
            <p className="mb-6">¿Está seguro de eliminar la compra?</p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded"
                onClick={handleDelete}
              >
                Eliminar
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded"
                onClick={() => setOpenEliminar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* TABLA PRINCIPAL */}
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto max-h-[600px] w-full">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-left text-white">Compra ID</th>
                <th className="px-4 py-3 text-left text-white">Proveedor ID</th>
                <th className="px-4 py-3 text-left text-white">Fecha Registro</th>
                <th className="px-4 py-3 text-center text-white">Total</th>
                <th className="px-4 py-3 text-center text-white">Estado</th>
                <th className="px-4 py-3 text-center text-white">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {comprasFiltradas.map((compra) => (
                <React.Fragment key={compra.CompraId}>
                  <tr className="hover:bg-slate-50">
                    <td className="py-4 px-6 text-center">
                      <button onClick={() => toggleExpand(compra.CompraId)}>
                        <ChevronDown
                          size={18}
                          className={`transform transition-transform ${expandedRow === compra.CompraId ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-6">{compra.CompraId}</td>
                    <td className="py-4 px-6">{compra.ProveedorId}</td>
                    <td className="py-4 px-6">{compra.FechaRegistro}</td>
                    <td className="py-4 px-6 text-center">S/ {Number(compra.Total || 0).toFixed(2)}</td>

                    <td className="py-4 px-6 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={Number(estadoActivo[compra.CompraId]) === 1}
                          onChange={(e) =>
                            handleToggleEstado(compra.CompraId, e.target.checked)
                          }
                        />
                        <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-all"></div>
                        <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-6 transition-all"></span>
                      </label>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openVerModal(compra)}>
                          <Eye size={16} className="text-emerald-600 hover:text-emerald-800" />
                        </button>
                        <button onClick={() => openEliminarModal(compra)}>
                          <Trash2 size={16} className="text-red-600 hover:text-red-800" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* DETALLE */}
                  {expandedRow === compra.CompraId && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="py-3 px-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="py-2 px-4">DetalleCompraId</th>
                                <th className="py-2 px-4">TipoDetalle</th>
                                <th className="py-2 px-4">ProductoServicioId</th>
                                <th className="py-2 px-4">InsumoId</th>
                                <th className="py-2 px-4">Cantidad</th>
                                <th className="py-2 px-4">Descripcion</th>
                                <th className="py-2 px-4 text-center">Acciones</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(compra.detalle || []).map((item) => (
                                <tr key={item.DetalleCompraId}>
                                  <td className="py-2 px-4">{item.DetalleCompraId}</td>
                                  <td className="py-2 px-4">{item.TipoDetalle}</td>
                                  <td className="py-2 px-4">{item.ProductoServicioId || "-"}</td>
                                  <td className="py-2 px-4">{item.InsumoId || "-"}</td>
                                  <td className="py-2 px-4">{item.Cantidad}</td>
                                  <td className="py-2 px-4">{item.Descripcion}</td>

                                  <td className="py-2 px-4 text-center">
                                    <button onClick={() => openVerModal(compra)}>
                                      <Eye size={14} className="text-emerald-600 hover:text-emerald-800" />
                                    </button>
                                  </td>
                                </tr>
                              ))}

                              {(compra.detalle || []).length === 0 && (
                                <tr>
                                  <td colSpan={7} className="py-2 text-center text-gray-500">
                                    Sin detalles
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {comprasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No hay compras a mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
