import React, { useEffect, useState, useMemo } from "react";
import {
  Plus, Eye, Trash2, ArrowLeft, Search, X,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
// Servicios
import {
  getAllPedidosClientes,
  getPedidoById,
  createPedidoCliente,
  updatePedidoCliente,
  deletePedidoCliente,
  getDetallesByPedidoId,
  getAllProductos,
} from "./services/services.pedidosClientes";
import { Pagination } from "../../components/paginacion/pagination"; // 👈 Importado
// ⚙️ CONFIGURACIÓN
const BACKEND_URL = "http://localhost:3000"; // ← AJUSTA SI TU BACKEND USA OTRO PUERTO

export const PedidosClientes = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const mode = useMemo(() => {
    if (location.pathname === "/dashboard/pedidosClientes/nuevo") return "create";
    if (id && location.pathname === `/dashboard/pedidosClientes/${id}`) return "view";
    if (location.pathname === `/dashboard/pedidosClientes/nuevo/seleccionar-producto`) return "select-product";
    return "list";
  }, [location.pathname, id]);

  const [pedidos, setPedidos] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [productoSearch, setProductoSearch] = useState("");
  const [productoFilter, setProductoFilter] = useState("todos");

  // 👇 Estados para PAGINACIÓN PRINCIPAL
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Puedes ajustar a 4 si prefieres
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formCrear, setFormCrear] = useState({
    ClienteId: "",
    FechaRegistro: "",
    Total: 0,
    Estado: "pendiente",
    metodo_pago: "transferencia",
    nombre_recibe: "",
    telefono_entrega: "",
    direccion_entrega: "",
    voucher: "",
  });
  const [detallesCrear, setDetallesCrear] = useState([
    { _tempId: crypto.randomUUID(), ProductoServicioId: "", Cantidad: 1, Alto: "", Ancho: "", Descripcion: "", UrlImagen: "" },
  ]);
  const [productos, setProductos] = useState([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" });

  // === Formatear fecha en español ===
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // === Alertas ===
  const showAlert = (message, type = "info") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "info" }), 3000);
  };

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getAllProductos();
        setProductos(data);
      } catch (err) {
        console.error("Error cargando productos/servicios:", err);
      }
    };
    fetchProductos();
  }, []);

  // Cargar pedidos
  const fetchPedidos = async () => {
    try {
      const pedidosBase = await getAllPedidosClientes();
      const pedidosConDetalles = await Promise.all(
        pedidosBase.map(async (p) => {
          try {
            const detalle = await getDetallesByPedidoId(p.PedidoClienteId);
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

  // Cargar pedido para ver
  useEffect(() => {
    if (mode === "view") {
      const cargarPedido = async () => {
        try {
          const pedido = await getPedidoById(id);
          const detalle = await getDetallesByPedidoId(id);
          const pedidoCompleto = {
            ...pedido,
            detalle: (Array.isArray(detalle) ? detalle : []).map(item => ({
              ...item,
              _tempId: item.DetallePedidoClienteId || crypto.randomUUID()
            }))
          };
          setPedidos(prev => prev.map(p => p.PedidoClienteId === id ? pedidoCompleto : p));
        } catch {
          navigate("/dashboard/pedidosClientes");
        }
      };
      cargarPedido();
    }
  }, [mode, id, navigate]);

  // 👇 Reemplazar pedidosFiltrados por lógica de paginación
  useEffect(() => {
    let filtered = pedidos;
    if (filtroCampo && filtroText.trim()) {
      filtered = pedidos.filter((p) => {
        const valor = String(p[filtroCampo] || "").toLowerCase();
        return valor.includes(filtroText.toLowerCase());
      });
    }
    setAllData(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [filtroText, filtroCampo, pedidos]);

  // 👇 Efecto para paginar
  useEffect(() => {
    if (allData.length > 0) {
      const totalPagesCalc = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(totalPagesCalc > 0 ? totalPagesCalc : 1);
      if (currentPage > totalPagesCalc && totalPagesCalc > 0) {
        setCurrentPage(totalPagesCalc);
      }
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedData(allData.slice(startIndex, endIndex));
    } else {
      setPaginatedData([]);
      setTotalPages(1);
    }
  }, [itemsPerPage, currentPage, allData]);

  // Filtro para productos en modal
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch = p.Nombre.toLowerCase().includes(productoSearch.toLowerCase());
      const matchesType = productoFilter === "todos" || 
        (productoFilter === "producto" && p.Tipo?.toLowerCase() === "producto") ||
        (productoFilter === "insumo" && p.Tipo?.toLowerCase() === "insumo");
      return matchesSearch && matchesType;
    });
  }, [productos, productoSearch, productoFilter]);

  // Garantizar 4 filas visibles
  const productosConPadding = useMemo(() => {
    const results = [...productosFiltrados];
    while (results.length < 4) {
      results.push({ ProductoServicioId: `placeholder-${results.length}`, Nombre: "", SKU: "", Precio: 0, Stock: 0, placeholder: true });
    }
    return results;
  }, [productosFiltrados]);

  // Navegación
  const goToBackToList = () => navigate("/dashboard/pedidosClientes");
  const goToCreate = () => navigate("/dashboard/pedidosClientes/nuevo");
  const goToView = (pedido) => navigate(`/dashboard/pedidosClientes/${pedido.PedidoClienteId}`);
  const goToSelectProduct = (index) => {
    setSelectedProductIndex(index);
    navigate("/dashboard/pedidosClientes/nuevo/seleccionar-producto");
  };

  // Función para reducir el ID (últimos 6 dígitos)
  const shortenId = (id) => {
    if (!id) return "—";
    const strId = String(id);
    return strId.length > 6 ? strId.slice(-6) : strId;
  };

  // Detalles
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

  // Guardar pedido
  const handleCreate = async () => {
    try {
      const detallesLimpios = detallesCrear.map(d => ({
        ProductoServicioId: String(d.ProductoServicioId).trim(),
        Cantidad: Number(d.Cantidad) || 1,
        Alto: d.Alto || (productos.find(p => p.ProductoServicioId === d.ProductoServicioId)?.Alto || ""),
        Ancho: d.Ancho || (productos.find(p => p.ProductoServicioId === d.ProductoServicioId)?.Ancho || ""),
        Descripcion: d.Descripcion || (productos.find(p => p.ProductoServicioId === d.ProductoServicioId)?.Descripcion || productos.find(p => p.ProductoServicioId === d.ProductoServicioId)?.Nombre || ""),
        UrlImagen: d.UrlImagen || (productos.find(p => p.ProductoServicioId === d.ProductoServicioId)?.UrlImagen || ""),
      }));
      await createPedidoCliente({
        ClienteId: formCrear.ClienteId.trim(),
        FechaRegistro: formCrear.FechaRegistro,
        Total: Number(formCrear.Total) || 0,
        Estado: formCrear.Estado,
        metodo_pago: formCrear.metodo_pago,
        nombre_recibe: formCrear.metodo_pago === "contra_entrega" ? formCrear.nombre_recibe : null,
        telefono_entrega: formCrear.metodo_pago === "contra_entrega" ? formCrear.telefono_entrega : null,
        direccion_entrega: formCrear.metodo_pago === "contra_entrega" ? formCrear.direccion_entrega : null,
        voucher: formCrear.metodo_pago === "transferencia" ? formCrear.voucher : null,
        detalle: detallesLimpios,
      });
      showAlert("Pedido creado exitosamente", "success");
      goToBackToList();
      fetchPedidos();
    } catch (err) {
      console.error("Error al crear pedido:", err);
      showAlert("Error al crear el pedido", "error");
    }
  };

  // Actualizar estado
  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const pedidoActual = pedidos.find(p => p.PedidoClienteId === pedidoId);
      if (!pedidoActual) return;
      await updatePedidoCliente(pedidoId, {
        ClienteId: pedidoActual.ClienteId,
        FechaRegistro: pedidoActual.FechaRegistro,
        Total: pedidoActual.Total,
        Estado: nuevoEstado,
        metodo_pago: pedidoActual.metodo_pago,
        nombre_recibe: pedidoActual.nombre_recibe,
        telefono_entrega: pedidoActual.telefono_entrega,
        direccion_entrega: pedidoActual.direccion_entrega,
        voucher: pedidoActual.voucher,
      });
      setPedidos(prev =>
        prev.map(p =>
          p.PedidoClienteId === pedidoId ? { ...p, Estado: nuevoEstado } : p
        )
      );
      showAlert("Estado actualizado correctamente", "success");
      goToBackToList();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      showAlert("Error al actualizar el estado", "error");
    }
  };

  // Eliminar pedido
  const handleDelete = async (pedidoId) => {
    if (window.confirm("¿Está seguro de eliminar este pedido?")) {
      try {
        await deletePedidoCliente(pedidoId);
        fetchPedidos();
        showAlert("Pedido eliminado correctamente", "success");
      } catch (err) {
        console.error("Error al eliminar pedido:", err);
        showAlert("Error al eliminar el pedido", "error");
      }
    }
  };

  // Abrir voucher con botón "Cerrar"
  const openVoucherWithClose = (fullUrl) => {
    const voucherWindow = window.open();
    voucherWindow.document.write(`
      <html>
        <head>
          <title>Voucher</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background: #f9fafb;
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .content {
              max-width: 90vw;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            img, embed {
              max-width: 100%;
              max-height: 80vh;
              object-fit: contain;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .close-btn {
              margin-top: 20px;
              padding: 8px 16px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
            }
            .close-btn:hover {
              background: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div>
              ${fullUrl.endsWith('.pdf') 
                ? `<embed src="${fullUrl}" type="application/pdf" width="100%" height="80vh" />`
                : `<img src="${fullUrl}" alt="Voucher" />`
              }
            </div>
            <button class="close-btn" onclick="window.close()">Cerrar</button>
          </div>
        </body>
      </html>
    `);
    voucherWindow.document.close();
  };

  // 👇 FUNCIONES DE PAGINACIÓN
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Alertas */}
      {alert.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
            alert.type === "success" ? "bg-green-600" :
            alert.type === "error" ? "bg-red-600" :
            "bg-blue-600"
          }`}
        >
          {alert.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Pedidos</h1>
        {/* LISTA */}
        {mode === "list" && (
          <>
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={goToCreate}
                className="bg-green-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 whitespace-wrap"
              >
                <Plus size={18} /> Nuevo pedido
              </button>
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar pedido"
                    value={filtroText}
                    onChange={(e) => setFiltroText(e.target.value)}
                    className="w-full border rounded-lg pl-10 pr-4 py-3"
                  />
                  <img
                    src="/multimedia/lupa.png"
                    alt="Buscar"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5"
                  />
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <select
                  value={filtroCampo}
                  onChange={(e) => setFiltroCampo(e.target.value)}
                  className="border rounded-lg px-4 py-3 bg-white text-slate-700 w-full sm:w-auto"
                >
                  <option value="">Filtrar por Campo</option>
                  <option value="PedidoClienteId">Pedido ID</option>
                  <option value="NombreCliente">Cliente</option>
                  <option value="FechaRegistro">Fecha</option>
                  <option value="metodo_pago">Método Pago</option>
                  <option value="Estado">Estado</option>
                </select>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-white text-left">Pedido ID</th>
                    <th className="px-4 py-3 text-white text-left">Cliente</th>
                    <th className="px-4 py-3 text-white text-left">Fecha Registro</th>
                    <th className="px-4 py-3 text-white text-left">Total</th>
                    <th className="px-4 py-3 text-white text-left">Método</th>
                    <th className="px-4 py-3 text-white text-left">Estado</th>
                    <th className="px-4 py-3 text-white text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedData.map((pedido) => (
                    <tr key={pedido.PedidoClienteId} className="hover:bg-slate-50">
                      <td className="py-4 px-6">{shortenId(pedido.PedidoClienteId)}</td>
                      <td className="py-4 px-6">{pedido.NombreCliente || "—"}</td>
                      <td className="py-4 px-6">{formatDate(pedido.FechaRegistro)}</td>
                      <td className="py-4 px-6">$ {Number(pedido.Total || 0).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium">
                          {pedido.metodo_pago === 'contra_entrega' ? 'Contra Entrega' : 'Transferencia'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pedido.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.Estado === 'en_produccion' ? 'bg-blue-100 text-blue-800' :
                          pedido.Estado === 'terminado' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {pedido.Estado === 'pendiente' ? 'Pendiente' :
                           pedido.Estado === 'en_produccion' ? 'En Producción' :
                           pedido.Estado === 'terminado' ? 'Terminado' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-3">
                          <button onClick={() => goToView(pedido)}>
                            <Eye size={16} className="text-emerald-600" />
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

              {/* 👇 PAGINACIÓN */}
              {paginatedData.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* === Resto de vistas sin cambios (crear, ver, select-product) === */}
        {/* CREAR */}
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
              {/* Método de pago */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Método de Pago</label>
                  <select
                    value={formCrear.metodo_pago}
                    onChange={(e) => setFormCrear({ ...formCrear, metodo_pago: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="contra_entrega">Contra Entrega</option>
                  </select>
                </div>
                {/* Comprobante solo si es transferencia */}
                {formCrear.metodo_pago === "transferencia" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Comprobante de pago (imagen o PDF)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setFormCrear(prev => ({ ...prev, voucher: "" }));
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          alert("El archivo debe ser menor a 10MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormCrear(prev => ({ ...prev, voucher: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full h-11 px-3 border rounded"
                    />
                    {formCrear.voucher && (
                      <div className="mt-2">
                        {formCrear.voucher.startsWith("image") ? (
                          <img src={formCrear.voucher} alt="Voucher preview" className="max-w-32 max-h-32 rounded" />
                        ) : (
                          <p className="text-sm text-green-600">Archivo PDF adjuntado</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Campos de entrega (solo contra entrega) */}
              {formCrear.metodo_pago === "contra_entrega" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Nombre quien recibe</label>
                    <input
                      type="text"
                      value={formCrear.nombre_recibe}
                      onChange={(e) => setFormCrear({ ...formCrear, nombre_recibe: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Teléfono de entrega</label>
                    <input
                      type="text"
                      value={formCrear.telefono_entrega}
                      onChange={(e) => setFormCrear({ ...formCrear, telefono_entrega: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Dirección de entrega</label>
                    <textarea
                      value={formCrear.direccion_entrega}
                      onChange={(e) => setFormCrear({ ...formCrear, direccion_entrega: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                      rows="2"
                    />
                  </div>
                </div>
              )}
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
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "open-modal") {
                            goToSelectProduct(index);
                          } else {
                            actualizarDetalleCrear(index, "ProductoServicioId", value);
                            const producto = productos.find(p => p.ProductoServicioId === value);
                            if (producto) {
                              actualizarDetalleCrear(index, "Descripcion", producto.Descripcion || producto.Nombre || "");
                              actualizarDetalleCrear(index, "Alto", producto.Alto || "");
                              actualizarDetalleCrear(index, "Ancho", producto.Ancho || "");
                              actualizarDetalleCrear(index, "UrlImagen", producto.UrlImagen || "");
                            }
                          }
                        }}
                        className="h-10 px-2 border rounded bg-white"
                      >
                        <option value="">Seleccione</option>
                        <option value="open-modal">Seleccionar desde lista...</option>
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

        {/* VER */}
        {mode === "view" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={goToBackToList} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                <ArrowLeft size={18} />
              </button>
              <h3 className="text-lg font-bold">
                Pedido #{shortenId(pedidos.find(p => p.PedidoClienteId === id)?.PedidoClienteId || id)}
              </h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="font-semibold mb-4">Información del Pedido</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Pedido ID</div>
                  <div className="font-bold">{shortenId(pedidos.find(p => p.PedidoClienteId === id)?.PedidoClienteId || "—")}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Cliente</div>
                  <div className="font-bold">{pedidos.find(p => p.PedidoClienteId === id)?.NombreCliente || "—"}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Fecha Registro</div>
                  <div className="font-bold">{formatDate(pedidos.find(p => p.PedidoClienteId === id)?.FechaRegistro || "—")}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="font-bold">$ {Number(pedidos.find(p => p.PedidoClienteId === id)?.Total || 0).toFixed(2)}</div>
                </div>
                {/* Mostrar voucher o datos de entrega */}
                {(() => {
                  const pedido = pedidos.find(p => p.PedidoClienteId === id);
                  if (!pedido) return null;
                  if (pedido.metodo_pago === "contra_entrega") {
                    return (
                      <>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Nombre Recibe</div>
                          <div className="font-bold">{pedido.nombre_recibe || "—"}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Teléfono Entrega</div>
                          <div className="font-bold">{pedido.telefono_entrega || "—"}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Dirección Entrega</div>
                          <div className="font-bold">{pedido.direccion_entrega || "—"}</div>
                        </div>
                      </>
                    );
                  } else if (pedido.voucher) {
                    const fullVoucherUrl = pedido.voucher.startsWith("http")
                      ? pedido.voucher
                      : `${BACKEND_URL}${pedido.voucher}`;
                    return (
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Comprobante de pago</div>
                        <button
                          onClick={() => openVoucherWithClose(fullVoucherUrl)}
                          className="text-blue-600 underline"
                        >
                          Ver archivo adjunto
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-white p-4 rounded-lg">
                        <div className="text-sm text-gray-500">Comprobante de pago</div>
                        <div className="font-bold text-gray-500">— No adjuntado</div>
                      </div>
                    );
                  }
                })()}
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Estado Actual</div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'en_produccion' ? 'bg-blue-100 text-blue-800' :
                    pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'terminado' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'pendiente' ? 'Pendiente' :
                     pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'en_produccion' ? 'En Producción' :
                     pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'terminado' ? 'Terminado' : 'Cancelado'}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="font-semibold mb-4">Resumen de Productos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Productos Únicos</div>
                  <div className="text-2xl font-bold">{pedidos.find(p => p.PedidoClienteId === id)?.detalle?.length || 0}</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Total Unidades</div>
                  <div className="text-2xl font-bold">
                    {pedidos.find(p => p.PedidoClienteId === id)?.detalle?.reduce((sum, d) => sum + (Number(d.Cantidad) || 0), 0) || 0}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-500">Total Productos</div>
                  <div className="text-2xl font-bold">
                    {pedidos.find(p => p.PedidoClienteId === id)?.detalle?.reduce((sum, d) => sum + (Number(d.Cantidad) || 0), 0) || 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl mb-6">
              <h4 className="font-semibold mb-4">Productos Solicitados</h4>
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
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h4 className="font-semibold mb-2">Cambiar Estado del Pedido</h4>
              <p className="text-sm text-gray-600 mb-4">
                Seleccione el nuevo estado del pedido. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <select
                  id="estado-select"
                  className="flex-1 px-4 py-2 border rounded"
                  defaultValue={pedidos.find(p => p.PedidoClienteId === id)?.Estado || "pendiente"}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_produccion">En Producción</option>
                  <option value="terminado">Terminado</option>
                  {/* ❌ Estado "entregado" eliminado */}
                  <option value="cancelado">Cancelado</option>
                </select>
                <button
                  onClick={() => {
                    const nuevoEstado = document.getElementById('estado-select').value;
                    actualizarEstadoPedido(id, nuevoEstado);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Guardar cambios
                </button>
                <button
                  onClick={goToBackToList}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="mt-6">
              <button onClick={goToBackToList} className="w-full h-11 bg-gray-200 text-gray-700 rounded">Cerrar</button>
            </div>
          </div>
        )}

        {/* SELECCIONAR PRODUCTO */}
        {mode === "select-product" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Seleccionar Producto</h3>
                  <button
                    onClick={goToCreate}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Busca y selecciona el producto que deseas agregar.</p>
              </div>
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={productoSearch}
                      onChange={(e) => setProductoSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["todos", "producto", "insumo"].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() => setProductoFilter(tipo)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          productoFilter === tipo
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="overflow-auto flex-1">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">SKU</th>
                      <th className="p-3 text-left">Precio</th>
                      <th className="p-3 text-left">Stock</th>
                      <th className="p-3 text-left">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosConPadding.map((producto) => (
                      <tr key={producto.ProductoServicioId} className={producto.placeholder ? "opacity-0" : "hover:bg-gray-50"}>
                        <td className="p-3">{producto.Nombre || "—"}</td>
                        <td className="p-3">{producto.SKU || "—"}</td>
                        <td className="p-3">$ {Number(producto.Precio || 0).toFixed(2)}</td>
                        <td className="p-3">{producto.Stock || "0"}</td>
                        <td className="p-3">
                          {!producto.placeholder && (
                            <button
                              onClick={() => {
                                if (selectedProductIndex !== null) {
                                  actualizarDetalleCrear(selectedProductIndex, "ProductoServicioId", producto.ProductoServicioId);
                                  actualizarDetalleCrear(selectedProductIndex, "Descripcion", producto.Descripcion || producto.Nombre || "");
                                  actualizarDetalleCrear(selectedProductIndex, "Alto", producto.Alto || "");
                                  actualizarDetalleCrear(selectedProductIndex, "Ancho", producto.Ancho || "");
                                  actualizarDetalleCrear(selectedProductIndex, "UrlImagen", producto.UrlImagen || "");
                                }
                                goToCreate();
                              }}
                              className="bg-blue-500 text-white px-4 py-1.5 rounded hover:bg-blue-600"
                            >
                              Seleccionar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productosFiltrados.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No se encontraron productos.
                  </div>
                )}
              </div>
              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={goToCreate}
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};