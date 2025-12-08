import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Plus, Edit, Eye, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export const PedidosClientes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Estabilizamos 'mode' con useMemo
  const mode = useMemo(() => {
    if (location.pathname === "/dashboard/pedidosClientes/nuevo") return "create";
    if (id && location.pathname === `/dashboard/pedidosClientes/${id}/editar`) return "edit";
    if (id && location.pathname === `/dashboard/pedidosClientes/${id}`) return "view";
    return "list";
  }, [location.pathname, id]);

  const [pedidos, setPedidos] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [formEdit, setFormEdit] = useState(null);
  const [formCrear, setFormCrear] = useState({
    ClienteId: "",
    FechaRegistro: "",
    Total: 0,
    Estado: "pendiente",
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { _tempId: crypto.randomUUID(), ProductoServicioId: "", Cantidad: 1, Alto: "", Ancho: "", Descripcion: "", UrlImagen: "" },
  ]);
  const [productos, setProductos] = useState([]);

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/service/");
        setProductos(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        console.error("Error cargando productos/servicios:", err);
      }
    };
    fetchProductos();
  }, []);

  // Cargar pedidos (solo en modo lista)
  const fetchPedidos = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/pedidos-clientes`);
      const pedidosBase = Array.isArray(data) ? data : [];
      const pedidosConDetalles = await Promise.all(
        pedidosBase.map(async (p) => {
          try {
            const res = await axios.get(`http://localhost:3000/api/detalle-pedido/${p.PedidoClienteId}`);
            const detalle = Array.isArray(res.data) ? res.data : [];
            return {
              ...p,
              detalle: detalle.map(item => ({
                ...item,
                _tempId: item.DetallePedidoClienteId || crypto.randomUUID()
              }))
            };
          } catch {
            return { ...p, detalle: [] };
          }
        })
      );
      setPedidos(pedidosConDetalles);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    }
  };

  useEffect(() => {
    if (mode === "list") fetchPedidos();
  }, [mode]);

  // Cargar pedido para ver/editar
  useEffect(() => {
    if (mode === "view" || mode === "edit") {
      const cargarPedido = async () => {
        try {
          const pedidoRes = await axios.get(`http://localhost:3000/api/pedidos-clientes/${id}`);
          const detalleRes = await axios.get(`http://localhost:3000/api/detalle-pedido/${id}`);
          const pedido = pedidoRes.data;
          const detalle = detalleRes.data;
          const pedidoCompleto = {
            ...pedido,
            detalle: (Array.isArray(detalle) ? detalle : []).map(item => ({
              ...item,
              _tempId: item.DetallePedidoClienteId || crypto.randomUUID()
            }))
          };
          if (mode === "edit") setFormEdit(pedidoCompleto);
        } catch {
          navigate("/dashboard/pedidosClientes");
        }
      };
      cargarPedido();
    }
  }, [mode, id, navigate]);

  // Filtro de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(p[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  // Navegación
  const goToBackToList = () => {
    setFormEdit(null);
    navigate("/dashboard/pedidosClientes");
  };

  const goToCreate = () => navigate("/dashboard/pedidosClientes/nuevo");
  const goToView = (pedido) => navigate(`/dashboard/pedidosClientes/${pedido.PedidoClienteId}`);
  const goToEdit = (pedido) => navigate(`/dashboard/pedidosClientes/${pedido.PedidoClienteId}/editar`);

  // Manejo de detalles (crear)
  const añadirDetalleCrear = () => {
    setDetallesCrear(prev => [...prev, {
      _tempId: crypto.randomUUID(),
      ProductoServicioId: "",
      Cantidad: 1,
      Alto: "",
      Ancho: "",
      Descripcion: "",
      UrlImagen: ""
    }]);
  };

  const eliminarDetalleCrear = (index) => {
    if (detallesCrear.length > 1) {
      setDetallesCrear(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actualizarDetalleCrear = (index, campo, valor) => {
    setDetallesCrear(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: valor };
      return copy;
    });
  };

  // Manejo de detalles (editar)
  const actualizarDetalleEditar = (index, campo, valor) => {
    setFormEdit(prev => {
      if (!prev) return prev;
      const nuevos = [...prev.detalle];
      nuevos[index] = { ...nuevos[index], [campo]: valor };
      return { ...prev, detalle: nuevos };
    });
  };

  const añadirDetalleEditar = () => {
    if (!formEdit) return;
    setFormEdit(prev => ({
      ...prev,
      detalle: [
        ...prev.detalle,
        { _tempId: crypto.randomUUID(), ProductoServicioId: "", Cantidad: 1, Alto: "", Ancho: "", Descripcion: "", UrlImagen: "" }
      ]
    }));
  };

  const eliminarDetalleEditar = (index) => {
    if (!formEdit || formEdit.detalle.length <= 1) return;
    setFormEdit(prev => ({
      ...prev,
      detalle: prev.detalle.filter((_, i) => i !== index)
    }));
  };

  // Guardar
  const handleCreate = async () => {
    try {
      const detallesLimpios = detallesCrear.map(d => ({
        ProductoServicioId: String(d.ProductoServicioId).trim(),
        Cantidad: Number(d.Cantidad) || 1,
        Alto: d.Alto || "",
        Ancho: d.Ancho || "",
        Descripcion: d.Descripcion || "",
        UrlImagen: d.UrlImagen || "",
      }));
      await axios.post(`http://localhost:3000/api/pedidos-clientes`, {
        ClienteId: formCrear.ClienteId.trim(),
        FechaRegistro: formCrear.FechaRegistro,
        Total: Number(formCrear.Total) || 0,
        Estado: formCrear.Estado,
        detalle: detallesLimpios,
      });
      goToBackToList();
      fetchPedidos();
    } catch (err) {
      console.error("Error al crear pedido:", err);
    }
  };

  const handleEdit = async () => {
    if (!formEdit) return;
    try {
      await axios.put(`http://localhost:3000/api/pedidos-clientes/${formEdit.PedidoClienteId}`, {
        ClienteId: formEdit.ClienteId,
        FechaRegistro: formEdit.FechaRegistro,
        Total: formEdit.Total,
        Estado: formEdit.Estado,
      });

      const res = await axios.get(`http://localhost:3000/api/detalle-pedido/${formEdit.PedidoClienteId}`);
      for (const d of res.data) {
        await axios.delete(`http://localhost:3000/api/detalle-pedido/${d.DetallePedidoClienteId}`);
      }

      for (const d of formEdit.detalle) {
        await axios.post(`http://localhost:3000/api/detalle-pedido`, {
          PedidoClienteId: formEdit.PedidoClienteId,
          ...d,
        });
      }

      goToBackToList();
      fetchPedidos();
    } catch (err) {
      console.error("Error al editar pedido:", err);
    }
  };

  const handleDelete = async (pedidoId) => {
    await axios.delete(`http://localhost:3000/api/pedidos-clientes/${pedidoId}`);
    fetchPedidos();
  };

  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const pedidoActual = pedidos.find(p => p.PedidoClienteId === pedidoId);
      if (!pedidoActual) return;

      await axios.put(`http://localhost:3000/api/pedidos-clientes/${pedidoId}`, {
        ClienteId: pedidoActual.ClienteId,
        FechaRegistro: pedidoActual.FechaRegistro,
        Total: pedidoActual.Total,
        Estado: nuevoEstado,
      });

      setPedidos(prev =>
        prev.map(p =>
          p.PedidoClienteId === pedidoId ? { ...p, Estado: nuevoEstado } : p
        )
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  // ===== RENDER PRINCIPAL =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>

        {/* === LISTA === */}
        {mode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4">
              <button onClick={goToCreate} className="bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                <Plus size={18} /> Nuevo pedido
              </button>
              <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border rounded-lg px-4 py-3 bg-white text-slate-700"
              >
                <option value="">Filtrar por Campo</option>
                <option value="PedidoClienteId">Pedido ID</option>
                <option value="NombreCliente">Cliente</option>
                <option value="FechaRegistro">Fecha</option>
              </select>
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar pedido"
                  value={filtroText}
                  onChange={(e) => setFiltroText(e.target.value)}
                  className="border rounded-lg pl-10 pr-4 py-3 w-full"
                />
                <img
                  src="/multimedia/lupa.png"
                  alt="Buscar"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-auto max-h-[600px]">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-white text-left">Pedido ID</th>
                    <th className="px-4 py-3 text-white text-left">Cliente</th>
                    <th className="px-4 py-3 text-white text-left">Fecha Registro</th>
                    <th className="px-4 py-3 text-white text-left">Total</th>
                    <th className="px-4 py-3 text-white text-left">Estado</th>
                    <th className="px-4 py-3 text-white text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.PedidoClienteId} className="hover:bg-slate-50">
                      <td className="py-4 px-6">{pedido.PedidoClienteId}</td>
                      <td className="py-4 px-6">{pedido.NombreCliente || "—"} </td>
                      <td className="py-4 px-6">{pedido.FechaRegistro}</td>
                      <td className="py-4 px-6">$ {Number(pedido.Total || 0).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <select
                          value={pedido.Estado}
                          onChange={(e) => actualizarEstadoPedido(pedido.PedidoClienteId, e.target.value)}
                          className="px-2 py-1 border rounded bg-white text-slate-700 text-sm"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="en_produccion">En Producción</option>
                          <option value="terminado">Terminado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <button onClick={() => goToView(pedido)}>
                            <Eye size={16} className="text-emerald-600" />
                          </button>
                          <button onClick={() => goToEdit(pedido)}>
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(pedido.PedidoClienteId)}>
                            <Trash2 size={16} className="text-red-600" />
                          </button>
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
              <h3 className="text-lg font-bold">Nuevo pedido</h3>
            </div>
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Cliente ID (Cédula)</label>
                  <input
                    type="text"
                    value={formCrear.ClienteId}
                    onChange={(e) => setFormCrear({ ...formCrear, ClienteId: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Fecha de registro</label>
                  <input
                    type="date"
                    value={formCrear.FechaRegistro}
                    onChange={(e) => setFormCrear({ ...formCrear, FechaRegistro: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Total</label>
                  <input
                    type="number"
                    value={formCrear.Total}
                    onChange={(e) => setFormCrear({ ...formCrear, Total: Number(e.target.value) })}
                    className="w-full h-11 px-3 border rounded"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium">Estado</label>
                <select
                  value={formCrear.Estado}
                  onChange={(e) => setFormCrear({ ...formCrear, Estado: e.target.value })}
                  className="w-full h-11 px-3 border rounded"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="en_produccion">En Producción</option>
                  <option value="terminado">Terminado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={añadirDetalleCrear} className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2">
                  <Plus size={15} /> Añadir detalle
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {detallesCrear.map((d, index) => (
                  <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-7 gap-3 border p-3 rounded">
                    <div className="flex flex-col gap-2">
                      <label>Producto / Servicio</label>
                      <select
                        value={d.ProductoServicioId || ""}
                        onChange={(e) => actualizarDetalleCrear(index, "ProductoServicioId", e.target.value)}
                        className="h-10 px-2 border rounded bg-white"
                      >
                        <option value="">Seleccione</option>
                        {productos.map((p) => (
                          <option key={p.ProductoServicioId} value={p.ProductoServicioId}>
                            {p.Nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        value={d.Cantidad ?? ""}
                        onChange={(e) => actualizarDetalleCrear(index, "Cantidad", Number(e.target.value))}
                        className="h-10 px-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Alto</label>
                      <input
                        type="text"
                        value={d.Alto || ""}
                        onChange={(e) => actualizarDetalleCrear(index, "Alto", e.target.value)}
                        className="h-10 px-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Ancho</label>
                      <input
                        type="text"
                        value={d.Ancho || ""}
                        onChange={(e) => actualizarDetalleCrear(index, "Ancho", e.target.value)}
                        className="h-10 px-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Descripción</label>
                      <input
                        type="text"
                        value={d.Descripcion || ""}
                        onChange={(e) => actualizarDetalleCrear(index, "Descripcion", e.target.value)}
                        className="h-10 px-2 border rounded"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label>Url Imagen</label>
                      <input
                        type="text"
                        value={d.UrlImagen || ""}
                        onChange={(e) => actualizarDetalleCrear(index, "UrlImagen", e.target.value)}
                        className="h-10 px-2 border rounded"
                      />
                      {d.UrlImagen && (
                        <img src={d.UrlImagen} alt="preview" className="w-20 h-20 object-cover rounded mt-1" />
                      )}
                    </div>
                    <div className="md:col-span-7 flex justify-end">
                      <Trash2 size={18} className="text-red-600 cursor-pointer" onClick={() => eliminarDetalleCrear(index)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={handleCreate} className="flex-1 bg-green-500 text-white h-11 rounded">Crear</button>
                <button type="button" onClick={goToBackToList} className="flex-1 bg-gray-200 text-gray-700 h-11 rounded">Cancelar</button>
              </div>
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
              <h3 className="text-lg font-bold">
                Ver pedido #{pedidos.find(p => p.PedidoClienteId === id)?.PedidoClienteId || id}
              </h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Detalles del Pedido</h4>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4">Producto/Servicio</th>
                      <th className="py-2 px-4">Cantidad</th>
                      <th className="py-2 px-4">Alto</th>
                      <th className="py-2 px-4">Ancho</th>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Imagen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const pedido = pedidos.find(p => p.PedidoClienteId === id);
                      return pedido?.detalle?.map((d, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 px-4">{d.ProductoServicioId}</td>
                          <td className="py-2 px-4">{d.Cantidad}</td>
                          <td className="py-2 px-4">{d.Alto || "—"}</td>
                          <td className="py-2 px-4">{d.Ancho || "—"}</td>
                          <td className="py-2 px-4">{d.Descripcion || "—"}</td>
                          <td className="py-2 px-4">
                            {d.UrlImagen ? <img src={d.UrlImagen} className="w-14 h-14 object-cover rounded" /> : "—"}
                          </td>
                        </tr>
                      )) || (
                        <tr><td colSpan="6" className="py-4 text-center">Cargando detalles...</td></tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6">
              <button onClick={goToBackToList} className="w-full h-11 bg-gray-200 text-gray-700 rounded">Cerrar</button>
            </div>
          </div>
        )}

        {/* === EDITAR === */}
        {mode === "edit" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">
                Editar pedido #{formEdit?.PedidoClienteId || id}
              </h3>
            </div>
            {formEdit ? (
              <>
                <div className="flex justify-end mb-4">
                  <button type="button" onClick={añadirDetalleEditar} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={15} /> Añadir detalle
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-4">Detalles del Pedido</h4>
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-2 px-4">Producto/Servicio</th>
                          <th className="py-2 px-4">Cantidad</th>
                          <th className="py-2 px-4">Alto</th>
                          <th className="py-2 px-4">Ancho</th>
                          <th className="py-2 px-4">Descripción</th>
                          <th className="py-2 px-4">Imagen</th>
                          <th className="py-2 px-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formEdit.detalle.map((d, idx) => (
                          <tr key={d._tempId} className="border-t">
                            <td className="py-2 px-4">
                              <select
                                value={d.ProductoServicioId || ""}
                                onChange={(e) => actualizarDetalleEditar(idx, "ProductoServicioId", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              >
                                <option value="">Seleccione</option>
                                {productos.map((p) => (
                                  <option key={p.ProductoServicioId} value={p.ProductoServicioId}>
                                    {p.Nombre}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                value={d.Cantidad ?? ""}
                                onChange={(e) => actualizarDetalleEditar(idx, "Cantidad", Number(e.target.value))}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.Alto || ""}
                                onChange={(e) => actualizarDetalleEditar(idx, "Alto", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.Ancho || ""}
                                onChange={(e) => actualizarDetalleEditar(idx, "Ancho", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.Descripcion || ""}
                                onChange={(e) => actualizarDetalleEditar(idx, "Descripcion", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.UrlImagen || ""}
                                onChange={(e) => actualizarDetalleEditar(idx, "UrlImagen", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                              {d.UrlImagen && <img src={d.UrlImagen} className="w-14 h-14 object-cover rounded mt-1" />}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <Trash2 size={18} className="text-red-600 cursor-pointer" onClick={() => eliminarDetalleEditar(idx)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={handleEdit} className="flex-1 bg-blue-500 text-white h-11 rounded">Guardar cambios</button>
                  <button type="button" onClick={goToBackToList} className="flex-1 bg-gray-200 text-gray-700 h-11 rounded">Cancelar</button>
                </div>
              </>
            ) : (
              <div className="p-6">Cargando...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};