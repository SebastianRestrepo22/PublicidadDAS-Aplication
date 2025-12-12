import React, { useState, useMemo } from "react";
import { Plus, Edit, Eye, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Componente principal de ventas
export const Ventas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Determinar el modo de vista
  const mode = useMemo(() => {
    if (location.pathname === "/dashboard/ventas/nuevo") return "create";
    if (id && location.pathname === `/dashboard/ventas/${id}/editar`) return "edit";
    if (id && location.pathname === `/dashboard/ventas/${id}`) return "view";
    return "list";
  }, [location.pathname, id]);

  // Datos de ejemplo
  const [ventas, setVentas] = useState([
    {
      id: 1,
      cedula: "1001",
      nombre: "Litografía Central",
      fecha: "2025-09-01",
      metodo: "Efectivo",
      total: 250,
      estado: "Activo",
      detalle: [
        {
          id: "P001",
          nombre: "Tarjetas de presentación",
          tipo: "Producto",
          descripcion: "Impresas full color",
          cantidad: 100,
          alto: "9 cm",
          ancho: "5 cm",
          descuento: "0%",
          url: "/public/img/tarjetas.png"
        },
        {
          id: "P002",
          nombre: "Afiches A3",
          tipo: "Producto",
          descripcion: "Papel couché brillante",
          cantidad: 50,
          alto: "42 cm",
          ancho: "29.7 cm",
          descuento: "5%",
          url: "/public/img/afiche.png"
        }
      ]
    },
    {
      id: 2,
      cedula: "1002",
      nombre: "Imprenta Express",
      fecha: "2025-09-05",
      metodo: "Transferencia",
      total: 180,
      estado: "Finalizado",
      detalle: [
        {
          id: "P003",
          nombre: "Folletos A4",
          tipo: "Producto",
          descripcion: "Doble cara",
          cantidad: 200,
          alto: "29.7 cm",
          ancho: "21 cm",
          descuento: "10%",
          url: "/public/img/folletos.png"
        }
      ]
    }
  ]);

  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [formEdit, setFormEdit] = useState(null);
  const [formCrear, setFormCrear] = useState({
    cedula: "",
    nombre: "",
    fecha: "",
    metodo: "",
    total: 0,
    estado: "Activo",
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { _tempId: crypto.randomUUID(), id: "", nombre: "", tipo: "", descripcion: "", cantidad: 1, alto: "", ancho: "", descuento: "", url: "" },
  ]);

  // Navegación
  const goToBackToList = () => {
    setFormEdit(null);
    navigate("/dashboard/ventas");
  };

  const goToCreate = () => navigate("/dashboard/ventas/nuevo");
  const goToView = (venta) => navigate(`/dashboard/ventas/${venta.id}`);
  const goToEdit = (venta) => navigate(`/dashboard/ventas/${venta.id}/editar`);

  // Filtro de ventas
  const ventasFiltradas = ventas.filter((v) => {
    if (!filtroCampo || !filtroText.trim()) return true;
    const valor = String(v[filtroCampo] || "").toLowerCase();
    return valor.includes(filtroText.toLowerCase());
  });

  // Manejo de detalles (crear)
  const añadirDetalleCrear = () => {
    setDetallesCrear(prev => [...prev, {
      _tempId: crypto.randomUUID(),
      id: "",
      nombre: "",
      tipo: "",
      descripcion: "",
      cantidad: 1,
      alto: "",
      ancho: "",
      descuento: "",
      url: ""
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
        { _tempId: crypto.randomUUID(), id: "", nombre: "", tipo: "", descripcion: "", cantidad: 1, alto: "", ancho: "", descuento: "", url: "" }
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

  // Guardar operaciones
  const handleCreate = () => {
    const nuevaVenta = {
      id: ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1,
      ...formCrear,
      detalle: detallesCrear.map(d => ({
        id: d.id,
        nombre: d.nombre,
        tipo: d.tipo,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        alto: d.alto,
        ancho: d.ancho,
        descuento: d.descuento,
        url: d.url
      }))
    };
    setVentas(prev => [...prev, nuevaVenta]);
    goToBackToList();
  };

  const handleEdit = () => {
    if (!formEdit) return;
    setVentas(prev => prev.map(v => v.id === formEdit.id ? formEdit : v));
    goToBackToList();
  };

  const handleDelete = (ventaId) => {
    setVentas(prev => prev.filter(v => v.id !== ventaId));
  };

  const actualizarEstadoVenta = (ventaId, nuevoEstado) => {
    setVentas(prev =>
      prev.map(v =>
        v.id === ventaId ? { ...v, estado: nuevoEstado } : v
      )
    );
  };

  // ===== RENDER PRINCIPAL =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Ventas</h1>

        {/* === LISTA === */}
        {mode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4">
              <button onClick={goToCreate} className="bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2">
                <Plus size={18} /> Nueva venta
              </button>
              <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border rounded-lg px-4 py-3 bg-white text-slate-700"
              >
                <option value="">Filtrar por campo</option>
                <option value="id">Venta ID</option>
                <option value="cedula">Cédula ID</option>
                <option value="nombre">Nombre</option>
                <option value="fecha">Fecha</option>
                <option value="metodo">Método de pago</option>
                <option value="total">Total</option>
                <option value="estado">Estado</option>
              </select>
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar venta"
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
                    <th className="px-4 py-3 text-white text-left">Venta ID</th>
                    <th className="px-4 py-3 text-white text-left">Cédula ID</th>
                    <th className="px-4 py-3 text-white text-left">Nombre</th>
                    <th className="px-4 py-3 text-white text-left">Fecha</th>
                    <th className="px-4 py-3 text-white text-left">Método</th>
                    <th className="px-4 py-3 text-white text-left">Total</th>
                    <th className="px-4 py-3 text-white text-left">Estado</th>
                    <th className="px-4 py-3 text-white text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ventasFiltradas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-slate-50">
                      <td className="py-4 px-6">{venta.id}</td>
                      <td className="py-4 px-6">{venta.cedula}</td>
                      <td className="py-4 px-6">{venta.nombre}</td>
                      <td className="py-4 px-6">{venta.fecha}</td>
                      <td className="py-4 px-6">{venta.metodo}</td>
                      <td className="py-4 px-6">$ {venta.total.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <select
                          value={venta.estado}
                          onChange={(e) => actualizarEstadoVenta(venta.id, e.target.value)}
                          className="px-2 py-1 border rounded bg-white text-slate-700 text-sm"
                        >
                          <option value="Activo">Activo</option>
                          <option value="Cancelado">Cancelado</option>
                          <option value="Finalizado">Finalizado</option>
                          <option value="Pendiente">Pendiente</option>
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <button onClick={() => goToView(venta)}>
                            <Eye size={16} className="text-emerald-600" />
                          </button>
                          <button onClick={() => goToEdit(venta)}>
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(venta.id)}>
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
              <h3 className="text-lg font-bold">Nueva venta</h3>
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Venta ID</label>
                  <input
                    type="text"
                    value={ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1}
                    readOnly
                    className="w-full h-11 px-3 border rounded bg-gray-50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Cédula ID</label>
                  <input
                    type="text"
                    value={formCrear.cedula}
                    onChange={(e) => setFormCrear({ ...formCrear, cedula: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                    placeholder="Ej: 1001"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Nombre Cliente</label>
                  <input
                    type="text"
                    value={formCrear.nombre}
                    onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                    placeholder="Ej: Litografía Central"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Fecha de registro</label>
                  <input
                    type="date"
                    value={formCrear.fecha}
                    onChange={(e) => setFormCrear({ ...formCrear, fecha: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Método de pago</label>
                  <select
                    value={formCrear.metodo}
                    onChange={(e) => setFormCrear({ ...formCrear, metodo: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Total</label>
                  <input
                    type="number"
                    value={formCrear.total}
                    onChange={(e) => setFormCrear({ ...formCrear, total: parseFloat(e.target.value) || 0 })}
                    className="w-full h-11 px-3 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={añadirDetalleCrear}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={15} /> Añadir detalle
                </button>
              </div>

              {/* Detalles de la venta */}
              <div className="grid grid-cols-1 gap-4">
                {detallesCrear.map((d, index) => (
                  <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-8 gap-3 border p-3 rounded">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">ID Producto</label>
                      <input
                        type="text"
                        value={d.id}
                        onChange={(e) => actualizarDetalleCrear(index, "id", e.target.value)}
                        className="h-10 px-2 border rounded"
                        placeholder="P001"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Nombre</label>
                      <input
                        type="text"
                        value={d.nombre}
                        onChange={(e) => actualizarDetalleCrear(index, "nombre", e.target.value)}
                        className="h-10 px-2 border rounded"
                        placeholder="Tarjetas de presentación"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <select
                        value={d.tipo}
                        onChange={(e) => actualizarDetalleCrear(index, "tipo", e.target.value)}
                        className="h-10 px-2 border rounded bg-white"
                      >
                        <option value="">Seleccionar</option>
                        <option value="Producto">Producto</option>
                        <option value="Servicio">Servicio</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Descripción</label>
                      <input
                        type="text"
                        value={d.descripcion}
                        onChange={(e) => actualizarDetalleCrear(index, "descripcion", e.target.value)}
                        className="h-10 px-2 border rounded"
                        placeholder="Impresas full color"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Cantidad</label>
                      <input
                        type="number"
                        value={d.cantidad}
                        onChange={(e) => actualizarDetalleCrear(index, "cantidad", e.target.value)}
                        className="h-10 px-2 border rounded"
                        min="1"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Alto</label>
                      <input
                        type="text"
                        value={d.alto}
                        onChange={(e) => actualizarDetalleCrear(index, "alto", e.target.value)}
                        className="h-10 px-2 border rounded"
                        placeholder="9 cm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Ancho</label>
                      <input
                        type="text"
                        value={d.ancho}
                        onChange={(e) => actualizarDetalleCrear(index, "ancho", e.target.value)}
                        className="h-10 px-2 border rounded"
                        placeholder="5 cm"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Descuento</label>
                      <input
                        type="text"
                        value={d.descuento}
                        onChange={(e) => actualizarDetalleCrear(index, "descuento", e.target.value)}
                        className="h-10 px-2 border rounded"
                        placeholder="0%"
                      />
                    </div>
                    <div className="md:col-span-8 flex justify-end">
                      <button
                        type="button"
                        onClick={() => eliminarDetalleCrear(index)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm">Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="flex-1 bg-green-500 text-white h-11 rounded"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={goToBackToList}
                  className="flex-1 bg-gray-200 text-gray-700 h-11 rounded"
                >
                  Cancelar
                </button>
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
                Ver venta #{ventas.find(v => v.id === Number(id))?.id || id}
              </h3>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Detalles de la Venta</h4>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4">Producto/Servicio</th>
                      <th className="py-2 px-4">Nombre</th>
                      <th className="py-2 px-4">Tipo</th>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Cantidad</th>
                      <th className="py-2 px-4">Alto</th>
                      <th className="py-2 px-4">Ancho</th>
                      <th className="py-2 px-4">Descuento</th>
                      <th className="py-2 px-4">Imagen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const venta = ventas.find(v => v.id === Number(id));
                      return venta?.detalle?.map((d, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 px-4">{d.id}</td>
                          <td className="py-2 px-4">{d.nombre}</td>
                          <td className="py-2 px-4">{d.tipo}</td>
                          <td className="py-2 px-4">{d.descripcion || "—"}</td>
                          <td className="py-2 px-4">{d.cantidad}</td>
                          <td className="py-2 px-4">{d.alto || "—"}</td>
                          <td className="py-2 px-4">{d.ancho || "—"}</td>
                          <td className="py-2 px-4">{d.descuento || "—"}</td>
                          <td className="py-2 px-4">
                            {d.url ? <img src={d.url} className="w-14 h-14 object-cover rounded" /> : "—"}
                          </td>
                        </tr>
                      )) || (
                        <tr><td colSpan="9" className="py-4 text-center">No hay detalles</td></tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-6">
              <button onClick={goToBackToList} className="w-full h-11 bg-gray-200 text-gray-700 rounded">
                Cerrar
              </button>
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
                Editar venta #{formEdit?.id || id}
              </h3>
            </div>
            
            {formEdit ? (
              <>
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={añadirDetalleEditar}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus size={15} /> Añadir detalle
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-4">Detalles de la Venta</h4>
                  <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-2 px-4">Producto/Servicio</th>
                          <th className="py-2 px-4">Nombre</th>
                          <th className="py-2 px-4">Tipo</th>
                          <th className="py-2 px-4">Descripción</th>
                          <th className="py-2 px-4">Cantidad</th>
                          <th className="py-2 px-4">Alto</th>
                          <th className="py-2 px-4">Ancho</th>
                          <th className="py-2 px-4">Descuento</th>
                          <th className="py-2 px-4">Imagen</th>
                          <th className="py-2 px-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formEdit.detalle.map((d, idx) => (
                          <tr key={d._tempId} className="border-t">
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.id}
                                onChange={(e) => actualizarDetalleEditar(idx, "id", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.nombre}
                                onChange={(e) => actualizarDetalleEditar(idx, "nombre", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <select
                                value={d.tipo}
                                onChange={(e) => actualizarDetalleEditar(idx, "tipo", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              >
                                <option value="">Seleccionar</option>
                                <option value="Producto">Producto</option>
                                <option value="Servicio">Servicio</option>
                              </select>
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.descripcion}
                                onChange={(e) => actualizarDetalleEditar(idx, "descripcion", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="number"
                                value={d.cantidad}
                                onChange={(e) => actualizarDetalleEditar(idx, "cantidad", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.alto}
                                onChange={(e) => actualizarDetalleEditar(idx, "alto", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.ancho}
                                onChange={(e) => actualizarDetalleEditar(idx, "ancho", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.descuento}
                                onChange={(e) => actualizarDetalleEditar(idx, "descuento", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <input
                                type="text"
                                value={d.url}
                                onChange={(e) => actualizarDetalleEditar(idx, "url", e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                              {d.url && <img src={d.url} className="w-14 h-14 object-cover rounded mt-1" />}
                            </td>
                            <td className="py-2 px-4 text-center">
                              <Trash2
                                size={18}
                                className="text-red-600 cursor-pointer"
                                onClick={() => eliminarDetalleEditar(idx)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex-1 bg-blue-500 text-white h-11 rounded"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={goToBackToList}
                    className="flex-1 bg-gray-200 text-gray-700 h-11 rounded"
                  >
                    Cancelar
                  </button>
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