import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Eye, Trash2, ArrowLeft } from "lucide-react";
import axios from "axios";

const API_URL = `http://localhost:3000/api/compras`;
const API_DETALLE_URL = `http://localhost:3000/api/detalle-compras`;

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
  const [viewMode, setViewMode] = useState("list");
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [formCrear, setFormCrear] = useState({
    ProveedorId: "",
    Total: 0,
    FechaRegistro: "",
    Estado: 1,
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
  ]);
  const [productos, setProductos] = useState([]);
  const [insumos, setInsumos] = useState([]);

  // --- Carga de productos e insumos ---
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

  // --- Carga de compras ---
  const fetchCompras = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/compras`);
      const comprasBase = Array.isArray(data) ? data : [];
      const comprasConDetalles = await Promise.all(
        comprasBase.map(async (compra) => {
          try {
            const { data: detalles } = await axios.get(`${API_DETALLE_URL}/compra/${compra.CompraId}`);
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

  // --- Navegación ---
  const goToCreate = () => {
    setFormCrear({ ProveedorId: "", Total: 0, FechaRegistro: "", Estado: 1 });
    setDetallesCrear([{ TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }]);
    setViewMode("create");
  };
  const goToView = (compra) => {
    setSelectedCompra(compra);
    setViewMode("view");
  };
  const goToEdit = (compra) => {
    setSelectedCompra(compra);
    setViewMode("edit");
  };
  const goToBackToList = () => {
    setViewMode("list");
    setSelectedCompra(null);
  };

  // --- Manejo de detalles en Crear ---
  const añadirDetalleCrear = () => {
    setDetallesCrear(prev => [
      ...prev,
      { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }
    ]);
  };
  const eliminarDetalleCrear = (index) => {
    if (detallesCrear.length === 1) return;
    setDetallesCrear(prev => prev.filter((_, i) => i !== index));
  };
  const actualizarDetalleCrear = (index, campo, valor) => {
    setDetallesCrear(prev => {
      const nuevos = [...prev];
      nuevos[index][campo] = valor;
      if (campo === "Cantidad" || campo === "PrecioUnitario") {
        const cantidad = parseFloat(nuevos[index].Cantidad) || 0;
        const precio = parseFloat(nuevos[index].PrecioUnitario) || 0;
        nuevos[index].Subtotal = cantidad * precio;
      }
      return nuevos;
    });
  };

  // --- Manejo de detalles en Editar ---
  const añadirDetalleEditar = () => {
    setSelectedCompra(prev => ({
      ...prev,
      detalle: [...prev.detalle, { TipoDetalle: "", ProductoServicioId: "", InsumoId: "", Cantidad: 1, Descripcion: "", PrecioUnitario: 0, Subtotal: 0 }]
    }));
  };
  const eliminarDetalleEditar = (index) => {
    if (!selectedCompra?.detalle || selectedCompra.detalle.length <= 1) return;
    setSelectedCompra(prev => ({
      ...prev,
      detalle: prev.detalle.filter((_, i) => i !== index),
    }));
  };
  const actualizarDetalleEditar = (index, campo, valor) => {
    setSelectedCompra(prev => {
      if (!prev) return prev;
      const nuevos = [...prev.detalle];
      nuevos[index][campo] = valor;
      if (campo === "Cantidad" || campo === "PrecioUnitario") {
        const cantidad = parseFloat(nuevos[index].Cantidad) || 0;
        const precio = parseFloat(nuevos[index].PrecioUnitario) || 0;
        nuevos[index].Subtotal = cantidad * precio;
      }
      const nuevoTotal = nuevos.reduce((sum, item) => sum + (item.Subtotal || 0), 0);
      return {
        ...prev,
        detalle: nuevos,
        Total: nuevoTotal,
      };
    });
  };

  // --- Guardado ---
  const handleCreate = async () => {
    try {
      const detallesLimpios = detallesCrear.map((d) => ({
        ...d,
        ProductoServicioId: d.ProductoServicioId?.trim() || null,
        InsumoId: d.InsumoId?.trim() || null,
        Subtotal: undefined,
      }));
      const total = detallesLimpios.reduce((sum, item) => sum + ((item.Cantidad || 0) * (item.PrecioUnitario || 0)), 0);
      const { data: compraCreada } = await axios.post(API_URL, {
        ...formCrear,
        FechaRegistro: formatearFecha(formCrear.FechaRegistro),
        Total: total,
      });
      for (const d of detallesLimpios) {
        await axios.post(API_DETALLE_URL, {
          CompraId: compraCreada.CompraId,
          ...d,
        });
      }
      goToBackToList();
      fetchCompras();
    } catch (err) {
      console.error("Error al crear compra:", err);
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedCompra) return;
      const total = selectedCompra.detalle.reduce((sum, item) => sum + (item.Subtotal || 0), 0);
      await axios.put(`${API_URL}/${selectedCompra.CompraId}`, {
        ProveedorId: selectedCompra.ProveedorId,
        Total: total,
        FechaRegistro: formatearFecha(selectedCompra.FechaRegistro),
        Estado: selectedCompra.Estado,
      });
      const { data: detallesActuales } = await axios.get(`${API_DETALLE_URL}/compra/${selectedCompra.CompraId}`);
      for (const d of detallesActuales) {
        await axios.delete(`${API_DETALLE_URL}/${d.DetalleCompraId}`);
      }
      const detallesLimpios = selectedCompra.detalle.map((d) => ({
        ...d,
        ProductoServicioId: d.ProductoServicioId?.trim() || null,
        InsumoId: d.InsumoId?.trim() || null,
        Subtotal: undefined,
      }));
      for (const d of detallesLimpios) {
        await axios.post(API_DETALLE_URL, {
          CompraId: selectedCompra.CompraId,
          ...d,
        });
      }
      goToBackToList();
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
      goToBackToList();
      fetchCompras();
    } catch (err) {
      console.error("Error al eliminar compra:", err);
      alert(err.response?.data?.error || err.message);
    }
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

  // === RENDER PRINCIPAL ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Compras</h1>

        {/* === LISTA === */}
        {viewMode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={goToCreate}
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
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto max-h-[600px] w-full">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
                  <tr>
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
                    <tr key={compra.CompraId} className="hover:bg-slate-50">
                      <td className="py-4 px-6">{compra.CompraId}</td>
                      <td className="py-4 px-6">{compra.ProveedorId}</td>
                      <td className="py-4 px-6">{compra.FechaRegistro}</td>
                      <td className="py-4 px-6 text-center">S/ {(Number(compra.Total) || 0).toFixed(2)}</td>
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
                          <button onClick={() => goToView(compra)}>
                            <Eye size={16} className="text-emerald-600 hover:text-emerald-800" />
                          </button>
                          <button onClick={() => goToEdit(compra)}>
                            <Edit size={16} className="text-blue-600 hover:text-blue-800" />
                          </button>
                          <button onClick={() => {
                            setSelectedCompra(compra);
                            handleDelete();
                          }}>
                            <Trash2 size={16} className="text-red-600 hover:text-red-800" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {comprasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        No hay compras a mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* === CREAR === */}
        {viewMode === "create" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goToBackToList}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Nueva compra</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Proveedor ID</label>
                <input
                  type="text"
                  placeholder="P001"
                  value={formCrear.ProveedorId}
                  onChange={(e) =>
                    setFormCrear({ ...formCrear, ProveedorId: e.target.value })
                  }
                  className="w-full h-11 px-3 border rounded"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Fecha de registro</label>
                <input
                  type="date"
                  value={formCrear.FechaRegistro}
                  onChange={(e) =>
                    setFormCrear({ ...formCrear, FechaRegistro: e.target.value })
                  }
                  className="w-full h-11 px-3 border rounded"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Total (Calculado)</label>
                <input
                  type="number"
                  readOnly
                  value={detallesCrear.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)}
                  className="w-full h-11 px-3 border rounded bg-gray-100"
                />
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={añadirDetalleCrear}
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={16} /> Agregar Artículo
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Artículos de la Compra</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Tipo</th>
                      <th className="py-2 px-4">Cantidad</th>
                      <th className="py-2 px-4">Precio Unit.</th>
                      <th className="py-2 px-4">Subtotal</th>
                      <th className="py-2 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesCrear.map((d, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={d.Descripcion}
                            onChange={(e) => actualizarDetalleCrear(index, "Descripcion", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <select
                            value={d.TipoDetalle || ""}
                            onChange={(e) => actualizarDetalleCrear(index, "TipoDetalle", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">Seleccione tipo</option>
                            <option value="Producto">Producto</option>
                            <option value="Insumo">Insumo</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select
                            disabled={d.TipoDetalle !== "Producto"}
                            value={d.ProductoServicioId || ""}
                            onChange={(e) => actualizarDetalleCrear(index, "ProductoServicioId", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">Seleccione producto</option>
                            {productos.map((p) => (
                              <option key={p.ProductoServicioId} value={p.ProductoServicioId}>
                                {p.Nombre} {p.Tipo ? `(${p.Tipo})` : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select
                            disabled={d.TipoDetalle !== "Insumo"}
                            value={d.InsumoId || ""}
                            onChange={(e) => actualizarDetalleCrear(index, "InsumoId", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">Seleccione insumo</option>
                            {insumos.map((i) => (
                              <option key={i.InsumoId} value={i.InsumoId}>
                                {i.Nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            value={d.Cantidad ?? ""}
                            onChange={(e) => actualizarDetalleCrear(index, "Cantidad", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            value={d.PrecioUnitario ?? ""}
                            onChange={(e) => actualizarDetalleCrear(index, "PrecioUnitario", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            readOnly
                            value={((d.Subtotal || 0)).toFixed(2)}
                            className="w-full px-2 py-1 border rounded bg-gray-100"
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Trash2
                            size={18}
                            className="text-red-600 cursor-pointer hover:text-red-800"
                            onClick={() => eliminarDetalleCrear(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>{detallesCrear.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)} US$</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Total:</span>
                <span>{detallesCrear.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)} US$</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <button
                type="button"
                onClick={handleCreate}
                className="flex-1 h-11 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Crear Compra
              </button>
              <button
                type="button"
                className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={goToBackToList}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* === EDITAR === */}
        {viewMode === "edit" && selectedCompra && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goToBackToList}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Editar compra #{selectedCompra.CompraId}</h3>
            </div>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={añadirDetalleEditar}
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={16} /> Agregar Artículo
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Artículos de la Compra</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Tipo</th>
                      <th className="py-2 px-4">Cantidad</th>
                      <th className="py-2 px-4">Precio Unit.</th>
                      <th className="py-2 px-4">Subtotal</th>
                      <th className="py-2 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompra.detalle?.map((d, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={d.Descripcion || ""}
                            onChange={(e) => actualizarDetalleEditar(index, "Descripcion", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <select
                            value={d.TipoDetalle || ""}
                            onChange={(e) => actualizarDetalleEditar(index, "TipoDetalle", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">Seleccione tipo</option>
                            <option value="Producto">Producto</option>
                            <option value="Insumo">Insumo</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select
                            disabled={d.TipoDetalle !== "Producto"}
                            value={d.ProductoServicioId || ""}
                            onChange={(e) => actualizarDetalleEditar(index, "ProductoServicioId", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">Seleccione producto</option>
                            {productos.map((p) => (
                              <option key={p.ProductoServicioId} value={p.ProductoServicioId}>
                                {p.Nombre} {p.Tipo ? `(${p.Tipo})` : ""}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select
                            disabled={d.TipoDetalle !== "Insumo"}
                            value={d.InsumoId || ""}
                            onChange={(e) => actualizarDetalleEditar(index, "InsumoId", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">Seleccione insumo</option>
                            {insumos.map((i) => (
                              <option key={i.InsumoId} value={i.InsumoId}>
                                {i.Nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            value={d.Cantidad ?? ""}
                            onChange={(e) => actualizarDetalleEditar(index, "Cantidad", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            value={d.PrecioUnitario ?? ""}
                            onChange={(e) => actualizarDetalleEditar(index, "PrecioUnitario", e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            readOnly
                            value={((d.Subtotal || 0)).toFixed(2)}
                            className="w-full px-2 py-1 border rounded bg-gray-100"
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <Trash2
                            size={18}
                            className="text-red-600 cursor-pointer hover:text-red-800"
                            onClick={() => eliminarDetalleEditar(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>{selectedCompra.detalle?.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)} US$</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Total:</span>
                <span>{Number(selectedCompra.Total || 0).toFixed(2)} US$</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 h-11 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Guardar cambios
              </button>
              <button
                type="button"
                className="flex-1 h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={goToBackToList}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* === VER === */}
        {viewMode === "view" && selectedCompra && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={goToBackToList}
                className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">Ver compra #{selectedCompra.CompraId}</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Artículos de la Compra</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Tipo</th>
                      <th className="py-2 px-4">Cantidad</th>
                      <th className="py-2 px-4">Precio Unit.</th>
                      <th className="py-2 px-4">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCompra.detalle?.map((d, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4">{d.Descripcion || "-"}</td>
                        <td className="py-2 px-4">
                          <span className="px-2 py-1 bg-gray-200 rounded text-xs">{d.TipoDetalle || "-"}</span>
                        </td>
                        <td className="py-2 px-4">{d.Cantidad || 0}</td>
                        <td className="py-2 px-4">{((d.PrecioUnitario || 0)).toFixed(2)} US$</td>
                        <td className="py-2 px-4">{((d.Subtotal || 0)).toFixed(2)} US$</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>{selectedCompra.detalle?.reduce((sum, item) => sum + (item.Subtotal || 0), 0).toFixed(2)} US$</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Total:</span>
                <span>{Number(selectedCompra.Total || 0).toFixed(2)} US$</span>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="w-full h-11 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={goToBackToList}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};