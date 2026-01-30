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
  getAllServicios,
  getAllColores,
} from "./services/services.pedidosClientes";
import { Pagination } from "../../components/paginacion/pagination";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

// ⚙️ CONFIGURACIÓN
const BACKEND_URL = "http://localhost:3000";

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

  // Cargar colores
  useEffect(() => {
    const fetchColores = async () => {
      try {
        const data = await getAllColores();
        setColores(data);
      } catch (err) {
        console.error("Error cargando colores:", err);
        toast.error("Error cargando colores");
      }
    };
    fetchColores();
  }, []);

  const getColorName = (colorId) => {
    if (!colorId) return "—";
    const color = colores.find(c => c.ColorId === colorId);
    return color ? color.Nombre : "—";
  };

  const [pedidos, setPedidos] = useState([]);
  const [filtroCampo, setFiltroCampo] = useState("");
  const [filtroText, setFiltroText] = useState("");
  const [productoSearch, setProductoSearch] = useState("");
  const [productoFilter, setProductoFilter] = useState("todos");
  const [servicios, setServicios] = useState([]);
  const [colores, setColores] = useState([]);

  // 👇 Estados para PAGINACIÓN PRINCIPAL
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formCrear, setFormCrear] = useState({
    ClienteId: "",
    FechaRegistro: "",
    Total: 0,
    Estado: "pendiente",
    MetodoPago: "transferencia",
    NombreRecibe: "",
    TelefonoEntrega: "",
    DireccionEntrega: "",
    Voucher: "",
  });

  const [detallesCrear, setDetallesCrear] = useState([
    {
      _tempId: crypto.randomUUID(),
      ProductoId: "",
      ServicioId: "",
      Cantidad: 1,
      Tamaño: "Mediana",
      Descripcion: "",
      UrlImagen: "",
      Precio: 0,
      ColorId: ""
    },
  ]);

  const [productos, setProductos] = useState([]);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);

  // === Formatear fecha en español ===
  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn("⚠️ Fecha inválida:", dateString);
      return "—";
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await getAllProductos();
        setProductos(data);
      } catch (err) {
        console.error("Error cargando productos/servicios:", err);
        toast.error("Error cargando productos");
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const data = await getAllServicios();
        setServicios(data);
      } catch (err) {
        console.error("Error cargando servicios:", err);
        toast.error("Error al cargar servicios");
      }
    };
    fetchServicios();
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
      toast.error("Error al cargar pedidos");
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
          toast.error("Error cargando pedido");
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
      results.push({ ProductoId: `placeholder-${results.length}`, Nombre: "", SKU: "", Precio: 0, Stock: 0, placeholder: true });
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
      ProductoId: "",
      ServicioId: "",
      Cantidad: 1,
      Tamaño: "Mediana",
      Descripcion: "",
      UrlImagen: "",
      Precio: 0,
      ColorId: ""
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
      const detallesLimpios = detallesCrear.map(d => {
        const ProductoId = d.ProductoId?.trim() ? String(d.ProductoId).trim() : null;
        const ServicioId = d.ServicioId?.trim() ? String(d.ServicioId).trim() : null;

        // ✅ Tamaño solo para servicios
        let Tamaño = null;
        if (ServicioId) {
          Tamaño = d.Tamaño || "Mediana";
        }

        let colorIdFinal = null;

        // Si viene del carrito, podría estar en customization.color.ColorId
        if (d.customization?.color?.ColorId) {
          colorIdFinal = d.customization.color.ColorId;
        }
        // O directamente en ColorId
        else if (d.ColorId) {
          // Si es un string como 'Amarillo', necesitas buscar el UUID real
          if (typeof d.ColorId === 'string' && !d.ColorId.includes('-')) {
            // Buscar en la lista de colores
            const colorObj = colores.find(c => c.Nombre === d.ColorId);
            colorIdFinal = colorObj ? colorObj.ColorId : null;
          } else {
            colorIdFinal = d.ColorId;
          }
        }

        return {
          ProductoId,
          ServicioId,
          Cantidad: Number(d.Cantidad) || 1,
          Tamaño,
          Descripcion: d.Descripcion || "",
          UrlImagen: d.UrlImagen || "",
          Precio: Number(d.Precio) || 0,
          ColorId: colorIdFinal,
        };
      });

      await createPedidoCliente({
        ClienteId: formCrear.ClienteId.trim(),
        FechaRegistro: formCrear.FechaRegistro,
        Total: Number(formCrear.Total) || 0,
        Estado: formCrear.Estado,
        MetodoPago: formCrear.MetodoPago,
        NombreRecibe: formCrear.MetodoPago === "contra_entrega" ? formCrear.NombreRecibe : null,
        TelefonoEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.TelefonoEntrega : null,
        DireccionEntrega: formCrear.MetodoPago === "contra_entrega" ? formCrear.DireccionEntrega : null,
        Voucher: formCrear.MetodoPago === "transferencia" ? formCrear.Voucher : null,
        detalle: detallesLimpios,
      });

      toast.success("Pedido creado exitosamente");
      goToBackToList();
      fetchPedidos();
    } catch (err) {
      console.error("Error al crear pedido:", err);
      toast.error("Error al crear el pedido");
    }
  };

  // Actualizar estado
  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const pedidoActual = pedidos.find(p => p.PedidoClienteId === pedidoId);
      if (!pedidoActual) {
        console.error("Pedido no encontrado:", pedidoId);
        toast.error("Pedido no encontrado");
        return;
      }

      // Actualizar en la base de datos
      await updatePedidoCliente(pedidoId, {
        ClienteId: pedidoActual.ClienteId,
        FechaRegistro: pedidoActual.FechaRegistro,
        Total: pedidoActual.Total,
        Estado: nuevoEstado,
        MetodoPago: pedidoActual.MetodoPago,
        NombreRecibe: pedidoActual.NombreRecibe,
        TelefonoEntrega: pedidoActual.TelefonoEntrega,
        DireccionEntrega: pedidoActual.DireccionEntrega,
        Voucher: pedidoActual.Voucher,
      });

      // Actualizar estado local INMEDIATAMENTE
      setPedidos(prev => {
        const nuevosPedidos = prev.map(p =>
          p.PedidoClienteId === pedidoId ? { ...p, Estado: nuevoEstado } : p
        );
        return nuevosPedidos;
      });

      // Mostrar mensaje según el estado
      if (nuevoEstado === 'aprobado') {
        toast.success("Pedido aprobado exitosamente");
      } else if (nuevoEstado === 'entregado') {
        toast.success("Pedido entregado exitosamente");
      } else if (nuevoEstado === 'cancelado') {
        toast.success("Pedido cancelado exitosamente");
      } else {
        toast.success("Estado actualizado correctamente");
      }

      // Esperar un momento para que React actualice el estado antes de navegar
      setTimeout(() => {
        goToBackToList();
      }, 300);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      toast.error("Error al actualizar el estado");
    }
  };

  // Eliminar pedido
  const handleDelete = async (pedidoId) => {
    if (window.confirm("¿Está seguro de eliminar este pedido?")) {
      try {
        await deletePedidoCliente(pedidoId);
        fetchPedidos();
        toast.success("Pedido eliminado correctamente");
      } catch (err) {
        console.log("Error al eliminar pedido:", err);
        toast.error("Error al eliminar el pedido");
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
                  <option value="MetodoPago">Método Pago</option>
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
                          {pedido.MetodoPago === 'contra_entrega' ? 'Contra Entrega' : 'Transferencia'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${pedido.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.Estado === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                            pedido.Estado === 'entregado' ? 'bg-green-100 text-green-800' :
                              'bg-green-100 text-green-800'
                          }`}>
                          {pedido.Estado === 'pendiente' ? 'Pendiente' :
                            pedido.Estado === 'aprobado' ? 'Aprobado' :
                              pedido.Estado === 'entregado' ? 'Entregado' : 'Cancelado'}
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
                    value={formCrear.MetodoPago}
                    onChange={(e) => setFormCrear({ ...formCrear, MetodoPago: e.target.value })}
                    className="w-full h-11 px-3 border rounded"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="contra_entrega">Contra Entrega</option>
                  </select>
                </div>

                {/* Comprobante solo si es transferencia */}
                {formCrear.MetodoPago === "transferencia" && (
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Comprobante de pago (imagen o PDF)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setFormCrear(prev => ({ ...prev, Voucher: "" }));
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("El archivo debe ser menor a 10MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormCrear(prev => ({ ...prev, Voucher: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full h-11 px-3 border rounded"
                    />
                    {formCrear.Voucher && (
                      <div className="mt-2">
                        {formCrear.Voucher.startsWith("image") ? (
                          <img src={formCrear.Voucher} alt="Voucher preview" className="max-w-32 max-h-32 rounded" />
                        ) : (
                          <p className="text-sm text-green-600">Archivo PDF adjuntado</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Campos de entrega (solo contra entrega) */}
              {formCrear.MetodoPago === "contra_entrega" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Nombre quien recibe</label>
                    <input
                      type="text"
                      value={formCrear.NombreRecibe}
                      onChange={(e) => setFormCrear({ ...formCrear, NombreRecibe: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Teléfono de entrega</label>
                    <input
                      type="text"
                      value={formCrear.TelefonoEntrega}
                      onChange={(e) => setFormCrear({ ...formCrear, TelefonoEntrega: e.target.value })}
                      className="w-full h-11 px-3 border rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Dirección de entrega</label>
                    <textarea
                      value={formCrear.DireccionEntrega}
                      onChange={(e) => setFormCrear({ ...formCrear, DireccionEntrega: e.target.value })}
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
                  <div key={d._tempId} className="grid grid-cols-1 md:grid-cols-8 gap-3 border p-3 rounded">
                    <div className="flex flex-col gap-2">
                      <label>Producto / Servicio</label>
                      <select
                        value={d.ProductoId || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "open-modal") {
                            goToSelectProduct(index);
                          } else {
                            actualizarDetalleCrear(index, "ProductoId", value);
                            const producto = productos.find(p => p.ProductoId === value);
                            if (producto) {
                              actualizarDetalleCrear(index, "Descripcion", producto.Descripcion || producto.Nombre || "");
                              actualizarDetalleCrear(index, "Tamaño", producto.Tamaño || "Mediana");
                              actualizarDetalleCrear(index, "UrlImagen", producto.UrlImagen || "");
                              actualizarDetalleCrear(index, "Precio", producto.Precio || 0);
                            }
                          }
                        }}
                        className="h-10 px-2 border rounded bg-white"
                      >
                        <option value="">Seleccione</option>
                        <option value="open-modal">Seleccionar desde lista...</option>
                        {productos.map((p) => (
                          <option key={p.ProductoId} value={p.ProductoId}>
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
                      <label>Tamaño</label>
                      <select
                        value={d.Tamaño || "Mediana"}
                        onChange={(e) => actualizarDetalleCrear(index, "Tamaño", e.target.value)}
                        className="h-10 px-2 border rounded"
                      >
                        <option value="Pequeña">Pequeña</option>
                        <option value="Mediana">Mediana</option>
                        <option value="Grande">Grande</option>
                      </select>
                    </div>

                    {/* 👇 CAMBIO: Input de texto → Select con colores */}
                    <div className="flex flex-col gap-2">
                      <label>Color</label>
                      <select
                        value={d.ColorId || ""}
                        onChange={(e) => actualizarDetalleCrear(index, "ColorId", e.target.value)}
                        className="h-10 px-2 border rounded bg-white"
                      >
                        <option value="">Seleccione un color</option>
                        {colores.map((color) => (
                          <option key={color.ColorId} value={color.ColorId}>
                            {color.Nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label>Precio Unitario</label>
                      <input
                        type="number"
                        value={d.Precio ?? ""}
                        onChange={(e) => actualizarDetalleCrear(index, "Precio", Number(e.target.value))}
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

                    <div className="md:col-span-8 flex justify-end">
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
                  if (pedido.MetodoPago === "contra_entrega") {
                    return (
                      <>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Nombre Recibe</div>
                          <div className="font-bold">{pedido.NombreRecibe || "—"}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Teléfono Entrega</div>
                          <div className="font-bold">{pedido.TelefonoEntrega || "—"}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg">
                          <div className="text-sm text-gray-500">Dirección Entrega</div>
                          <div className="font-bold">{pedido.DireccionEntrega || "—"}</div>
                        </div>
                      </>
                    );
                  } else if (pedido.Voucher) {
                    const fullVoucherUrl = pedido.Voucher.startsWith("http")
                      ? pedido.Voucher
                      : `${BACKEND_URL}${pedido.Voucher}`;
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
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                      pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'entregado' ? 'bg-green-100 text-green-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'pendiente' ? 'Pendiente' :
                      pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'aprobado' ? 'Aprobado' :
                        pedidos.find(p => p.PedidoClienteId === id)?.Estado === 'entregado' ? 'Entregado' : 'Cancelado'}
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
                      <th className="py-2 px-4">Producto</th>
                      <th className="py-2 px-4">Cantidad</th>
                      <th className="py-2 px-4">Tamaño</th>
                      <th className="py-2 px-4">Color</th>
                      <th className="py-2 px-4">Precio Unit.</th>
                      <th className="py-2 px-4">Subtotal</th>
                      <th className="py-2 px-4">Descripción</th>
                      <th className="py-2 px-4">Imagen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const pedido = pedidos.find(p => p.PedidoClienteId === id);
                      return pedido?.detalle?.map((d, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 px-4">{d.ProductoId || d.ServicioId || "—"}</td>
                          <td className="py-2 px-4">{d.Cantidad}</td>
                          <td className="py-2 px-4">{d.Tamaño || "—"}</td>
                          <td className="py-2 px-4">{getColorName(d.ColorId)}</td>
                          <td className="py-2 px-4">$ {Number(d.Precio || 0).toFixed(2)}</td>
                          <td className="py-2 px-4">$ {(d.Cantidad * d.Precio).toFixed(2)}</td>
                          <td className="py-2 px-4">{d.Descripcion || "—"}</td>
                          <td className="py-2 px-4">
                            {d.UrlImagen ? <img src={d.UrlImagen} className="w-14 h-14 object-cover rounded" /> : "—"}
                          </td>
                        </tr>
                      )) || (
                          <tr><td colSpan="8" className="py-4 text-center">Cargando detalles...</td></tr>
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
                  <option value="aprobado">Aprobado</option>
                  <option value="entregado">Entregado</option>
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
                        className={`px-4 py-2 rounded-lg font-medium ${productoFilter === tipo
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
                      <tr key={producto.ProductoId} className={producto.placeholder ? "opacity-0" : "hover:bg-gray-50"}>
                        <td className="p-3">{producto.Nombre || "—"}</td>
                        <td className="p-3">{producto.SKU || "—"}</td>
                        <td className="p-3">$ {Number(producto.Precio || 0).toFixed(2)}</td>
                        <td className="p-3">{producto.Stock || "0"}</td>
                        <td className="p-3">
                          {!producto.placeholder && (
                            <button
                              onClick={() => {
                                if (selectedProductIndex !== null) {
                                  actualizarDetalleCrear(selectedProductIndex, "ProductoId", producto.ProductoId);
                                  actualizarDetalleCrear(selectedProductIndex, "Descripcion", producto.Descripcion || producto.Nombre || "");
                                  actualizarDetalleCrear(selectedProductIndex, "Tamaño", producto.Tamaño || "Mediana");
                                  actualizarDetalleCrear(selectedProductIndex, "UrlImagen", producto.UrlImagen || "");
                                  actualizarDetalleCrear(selectedProductIndex, "Precio", producto.Precio || 0);
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

      {/* ToastContainer al final del componente */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};