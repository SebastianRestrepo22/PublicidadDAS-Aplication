import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  FileText,
  Package,
  CreditCard,
  Truck,
  Check,
  ExternalLink,
  Download,
  Printer,
  Filter,
  RefreshCw,
  Tag,
  ShoppingBag,
  Plus
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../../components/paginacion/pagination.jsx";
import { TiempoRestanteAnulacion } from '../venta/components/TiempoRestanteAnulacion.jsx';
import { getVentas, getVentaById, anularVenta } from "../venta/services/service.ventas.js";
import Modal from "../../components/modals/modal.jsx";

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Función para acortar IDs - 3 CARACTERES
const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 3 ? strId.slice(-3) : strId.padStart(3, '0');
};

// Formatear precio
export const formatPrice = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return `${currency}0.00`;

  // Convertir a número si es string
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Verificar si es un número válido
  if (isNaN(num)) return `${currency}0.00`;

  // Formatear con separador de miles y 2 decimales
  return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Badge de estado
const EstadoBadge = ({ estado }) => {
  const config = {
    'pagado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado', icon: Check },
    'anulado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Anulado', icon: X }
  };

  const { bg, text, label, icon: Icon } = config[estado] || config['pagado'];

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
};

// Badge de origen
const OrigenBadge = ({ origen }) => {
  const config = {
    'pedido': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Desde Pedido' },
    'manual': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Venta Manual' }
  };

  const { bg, text, label } = config[origen] || config['manual'];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
};

// Componente de detalles expandibles 
const DetallesProductosAcordeon = ({ detalles }) => {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  if (!detalles || detalles.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hay productos en esta venta</p>;
  }

  const totalProductos = detalles.length;
  const totalCantidad = detalles.reduce((sum, d) => sum + (d.Cantidad || 0), 0);
  const totalSubtotal = detalles.reduce((sum, d) => sum + ((d.Subtotal ? parseFloat(d.Subtotal) : 0) || 0), 0);

  return (
    <div className="space-y-3">
      {/* Header resumen - más compacto */}
      <div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
        onClick={() => setMostrarDetalles(!mostrarDetalles)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-wrap">
            <h4 className="font-semibold text-blue-800 flex items-center gap-1 text-sm">
              <Package size={14} />
              Detalle ({totalProductos} items)
            </h4>
            <div className="flex gap-3 text-xs">
              <span className="bg-white px-2 py-1 rounded shadow-sm">
                <span className="text-gray-600">Unidades:</span>
                <span className="font-bold ml-1">{totalCantidad}</span>
              </span>
              <span className="bg-white px-2 py-1 rounded shadow-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold ml-1 text-blue-600">{formatPrice(totalSubtotal)}</span>
              </span>
            </div>
          </div>
          <button className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50">
            {mostrarDetalles ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-blue-600" />}
          </button>
        </div>
      </div>

      {mostrarDetalles && (
        <div className="border rounded-lg overflow-hidden shadow-sm text-sm">
          {/* Encabezado más compacto */}
          <div className="bg-gray-100 p-2 border-b grid grid-cols-12 text-xs font-medium text-gray-700">
            <div className="col-span-5">Producto/Servicio</div>
            <div className="col-span-1 text-center">Tipo</div>
            <div className="col-span-1 text-center">Cant.</div>
            <div className="col-span-2 text-right">P.Unit</div>
            <div className="col-span-2 text-right">Subtotal</div>
            <div className="col-span-1 text-center"></div>
          </div>

          {/* Filas más compactas */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {detalles.map((item, index) => (
              <div key={item.DetalleVentaId || index} className="p-2 hover:bg-gray-50 grid grid-cols-12 text-xs items-center">
                {/* Producto/Servicio con variantes inline */}
                <div className="col-span-5">
                  <div className="font-medium flex items-center gap-1">
                    {item.NombreSnapshot}
                    {/* Color como badge pequeño */}
                    {item.ColorId && (
                      <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.ColorHex || '#ccc' }}></span>
                        <span>{item.ColorNombre || 'Color'}</span>
                      </span>
                    )}
                    {/* Tamaño como badge */}
                    {item.ServicioTamanoId && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                        {item.NombreTamano || 'Tamaño'}
                      </span>
                    )}
                  </div>
                  {/* Descripción en línea si es corta */}
                  {item.DescripcionPersonalizada && item.DescripcionPersonalizada.length < 30 && (
                    <div className="text-[10px] text-gray-500 italic truncate max-w-[200px]">
                      📝 {item.DescripcionPersonalizada}
                    </div>
                  )}
                  {/* Descripción en tooltip si es larga */}
                  {item.DescripcionPersonalizada && item.DescripcionPersonalizada.length >= 30 && (
                    <div className="text-[10px] text-gray-500 italic truncate max-w-[200px]" title={item.DescripcionPersonalizada}>
                      📝 {item.DescripcionPersonalizada.substring(0, 25)}...
                    </div>
                  )}
                </div>
                
                {/* Tipo */}
                <div className="col-span-1 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    item.TipoItem === 'producto' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {item.TipoItem === 'producto' ? 'P' : 'S'}
                  </span>
                </div>
                
                {/* Cantidad */}
                <div className="col-span-1 text-center font-medium">{item.Cantidad || 0}</div>
                
                {/* Precio Unitario */}
                <div className="col-span-2 text-right font-medium">{formatPrice(item.PrecioUnitario)}</div>
                
                {/* Subtotal */}
                <div className="col-span-2 text-right font-semibold text-blue-600">{formatPrice(item.Subtotal)}</div>
                
                {/* Icono de imagen si existe */}
                <div className="col-span-1 text-center">
                  {item.UrlImagenPersonalizada && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagenAmpliada(item.UrlImagenPersonalizada);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Ver imagen"
                    >
                      <Eye size={12} className="text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer compacto */}
          <div className="bg-gray-50 p-2 border-t text-xs">
            <div className="flex justify-end gap-4">
              <span className="text-gray-600">Total items:</span>
              <span className="font-medium">{totalProductos}</span>
              <span className="text-gray-600 ml-2">Total unidades:</span>
              <span className="font-medium">{totalCantidad}</span>
              <span className="text-gray-600 ml-2 font-medium">Total:</span>
              <span className="font-bold text-blue-600">{formatPrice(totalSubtotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver imagen ampliada (igual que antes) */}
      {imagenAmpliada && (
        <Modal open={true} onClose={() => setImagenAmpliada(null)}>
          <div className="p-4 max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setImagenAmpliada(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={imagenAmpliada}
              alt="Imagen ampliada"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

// Modal de anulación con advertencia
const ModalAnular = ({ open, onClose, onConfirm, venta }) => {
  if (!venta) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Anular esta venta?</h3>
        <p className="text-gray-600 mb-4">
          Estás a punto de anular la venta <span className="font-semibold">#{shortenId(venta.VentaId)}</span>
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-left">
          <p className="font-medium text-yellow-800 mb-1">⚠️ Esta acción no se puede deshacer</p>
          <p className="text-yellow-700">
            La venta quedará como <strong>anulada</strong> en el historial.
            Esta operación es irreversible y solo debe realizarse en caso de error.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
            onClick={() => onConfirm(venta.VentaId)}
          >
            <X size={18} />
            Sí, anular venta
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Modal de ver detalles - MEJORADO
const ModalVerVenta = ({ open, onClose, venta }) => {
  if (!venta) return null;

  // Extraer información del vendedor
  const vendedorNombre = venta.UsuarioVendedor?.NombreCompleto ||
    venta.vendedor?.NombreCompleto ||
    venta.UsuarioVendedorNombre ||
    'No especificado';

  const vendedorId = venta.UsuarioVendedor?.CedulaId ||
    venta.vendedor?.CedulaId ||
    venta.UsuarioVendedorId ||
    '-';

  // Extraer información del pedido asociado
  const pedidoId = venta.PedidoCliente?.PedidoClienteId ||
    venta.pedido?.PedidoClienteId ||
    venta.PedidoClienteId;

  const fechaPedido = venta.PedidoCliente?.FechaRegistro ||
    venta.pedido?.FechaRegistro ||
    venta.FechaPedido;

  const estadoPedido = venta.PedidoCliente?.Estado ||
    venta.pedido?.Estado ||
    venta.EstadoPedido;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[800px] max-h-[90vh] overflow-y-auto p-6 mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">
            Detalles de Venta #{shortenId(venta.VentaId)}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-xl">
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText size={16} /> Información General
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">ID Venta</p>
                <p className="font-mono text-sm font-medium">{venta.VentaId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Origen</p>
                <OrigenBadge origen={venta.Origen} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Fecha</p>
                <p className="text-sm">{formatDate(venta.FechaVenta)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Estado</p>
                <EstadoBadge estado={venta.Estado} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl">
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <User size={16} /> Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <p className="text-xs text-slate-500">Nombre</p>
                <p className="font-medium">{venta.ClienteNombre || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Teléfono</p>
                <p>{venta.ClienteTelefono || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Correo</p>
                <p className="truncate">{venta.ClienteCorreo || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl">
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <User size={16} /> Vendedor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Nombre</p>
                <p className="font-medium">{vendedorNombre}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Vendedor</p>
                <p className="font-mono text-sm">{vendedorId}</p>
              </div>
            </div>
          </div>

          {pedidoId && (
            <div className="bg-slate-50 p-5 rounded-xl">
              <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <ShoppingBag size={16} /> Pedido Asociado
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <p className="text-xs text-slate-500">ID Pedido</p>
                  <p className="font-mono text-sm font-medium">{pedidoId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Fecha Pedido</p>
                  <p>{fechaPedido ? formatDate(fechaPedido) : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estado Pedido</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${estadoPedido === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    estadoPedido === 'aprobado' ? 'bg-blue-100 text-blue-800' :
                      estadoPedido === 'entregado' ? 'bg-green-100 text-green-800' :
                        estadoPedido === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {estadoPedido || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-5 rounded-xl">
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <DollarSign size={16} /> Totales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500">Subtotal</p>
                <p className="text-lg font-semibold">{formatPrice(venta.Subtotal)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-slate-500">IVA (19%)</p>
                <p className="text-lg font-semibold">{formatPrice(venta.IVA)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600">Total</p>
                <p className="text-xl font-bold text-blue-600">{formatPrice(venta.Total)}</p>
              </div>
            </div>
          </div>

          {venta.detalle && venta.detalle.length > 0 && (
            <div className="bg-slate-50 p-5 rounded-xl">
              <DetallesProductosAcordeon detalles={venta.detalle} />
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Componente principal
export const Ventas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoVenta, setCargandoVenta] = useState(false);

  const [openVer, setOpenVer] = useState(false);
  const [openAnular, setOpenAnular] = useState(false);

  const [campoFiltro, setCampoFiltro] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const data = await getVentas();

      if (Array.isArray(data)) {
        setVentas(data);
        aplicarFiltrosYOrdenar(data);
      } else {
        setVentas([]);
        setAllData([]);
        setPaginatedData([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al cargar las ventas");
      setVentas([]);
      setAllData([]);
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltrosYOrdenar = (data) => {
    const ordenadas = [...data].sort((a, b) => {
      return new Date(b.FechaVenta) - new Date(a.FechaVenta);
    });

    let filtradas = ordenadas;
    if (campoFiltro && filtroValor.trim()) {
      const valorBusqueda = filtroValor.toLowerCase().trim();
      filtradas = ordenadas.filter(venta => {
        switch (campoFiltro) {
          case 'VentaId':
            return venta.VentaId?.toLowerCase().includes(valorBusqueda);
          case 'PedidoClienteId':
            return venta.PedidoClienteId?.toLowerCase().includes(valorBusqueda);
          case 'ClienteNombre':
            return venta.ClienteNombre?.toLowerCase().includes(valorBusqueda);
          case 'Estado':
            return venta.Estado?.toLowerCase().includes(valorBusqueda);
          case 'Origen':
            return venta.Origen?.toLowerCase().includes(valorBusqueda);
          default:
            return true;
        }
      });
    }

    setAllData(filtradas);
    setTotalItems(filtradas.length);

    const totalPagesCalc = Math.ceil(filtradas.length / itemsPerPage);
    setTotalPages(totalPagesCalc > 0 ? totalPagesCalc : 1);

    if (currentPage > totalPagesCalc && totalPagesCalc > 0) {
      setCurrentPage(totalPagesCalc);
    }

    const paginated = paginateData(filtradas);
    setPaginatedData(paginated);
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  useEffect(() => {
    if (ventas.length > 0) {
      aplicarFiltrosYOrdenar(ventas);
    }
  }, [campoFiltro, filtroValor]);

  useEffect(() => {
    if (allData.length > 0) {
      const paginated = paginateData(allData);
      setPaginatedData(paginated);
    }
  }, [currentPage, itemsPerPage, allData]);

  const handleVerClick = async (venta) => {
    setCargandoVenta(true);
    try {
      if (venta.detalle && venta.detalle.length > 0) {
        setVentaSeleccionada(venta);
      } else {
        const ventaCompleta = await getVentaById(venta.VentaId);
        setVentaSeleccionada(ventaCompleta);
      }
      setOpenVer(true);
    } catch (error) {
      console.error("Error al cargar venta:", error);
      toast.error("Error al cargar los detalles de la venta");
    } finally {
      setCargandoVenta(false);
    }
  };

  const handleAnularClick = (venta) => {
    setVentaSeleccionada(venta);
    setOpenAnular(true);
  };

  const handleConfirmarAnular = async (ventaId) => {
    try {
      const response = await anularVenta(ventaId);

      if (response.success) {
        toast.success("Venta anulada correctamente");
        setOpenAnular(false);
        setOpenVer(false);
        await cargarVentas();
      } else {
        toast.error(response.message || "Error al anular la venta");
      }
    } catch (error) {
      console.error("Error al anular venta:", error);
      toast.error(error.response?.data?.error || "Error al anular la venta");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleLimpiarFiltros = () => {
    setCampoFiltro('');
    setFiltroValor('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de Ventas</h1>

          {/* FILTROS Y BOTÓN DE CREAR - IGUAL QUE EN PEDIDOS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* BOTÓN DE CREAR VENTA */}
              <button
                onClick={() => navigate("/dashboard/ventas/crear")}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm"
              >
                <Plus size={18} /> Nueva venta
              </button>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                {campoFiltro === "Estado" ? (
                  <select
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pagado">Pagado</option>
                    <option value="anulado">Anulado</option>
                  </select>
                ) : campoFiltro === "Origen" ? (
                  <select
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Todos los orígenes</option>
                    <option value="pedido">Desde Pedido</option>
                    <option value="manual">Venta Manual</option>
                  </select>
                ) : (
                  <input
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    type="text"
                    placeholder={campoFiltro ? `Buscar por ${campoFiltro}` : "Seleccione un campo para buscar"}
                    disabled={!campoFiltro}
                    className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              <select
                value={campoFiltro}
                onChange={(e) => {
                  setCampoFiltro(e.target.value);
                  setFiltroValor('');
                }}
                className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
              >
                <option value="">Filtrar por Campo</option>
                <option value="VentaId">ID Venta</option>
                <option value="PedidoClienteId">ID Pedido</option>
                <option value="ClienteNombre">Cliente</option>
                <option value="Estado">Estado</option>
                <option value="Origen">Origen</option>
              </select>

              {(campoFiltro || filtroValor) && (
                <button
                  onClick={handleLimpiarFiltros}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 whitespace-nowrap"
                >
                  <X size={16} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <ModalVerVenta
            open={openVer}
            onClose={() => setOpenVer(false)}
            venta={ventaSeleccionada}
          />

          <ModalAnular
            open={openAnular}
            onClose={() => setOpenAnular(false)}
            onConfirm={handleConfirmarAnular}
            venta={ventaSeleccionada}
          />

          {/* TABLA DE VENTAS - IGUAL QUE EN PEDIDOS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Origen</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargando ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                      <p className="mt-2">Cargando ventas...</p>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((venta) => (
                    <tr key={venta.VentaId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-700 font-mono font-bold">
                        {shortenId(venta.VentaId)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div>{venta.ClienteNombre || 'Walk-in'}</div>
                        {venta.ClienteTelefono && (
                          <div className="text-xs text-slate-500">{venta.ClienteTelefono}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{formatDate(venta.FechaVenta)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">
                        {formatPrice(venta.Total)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium">{venta.detalle?.length || 0} items</div>
                        {venta.detalle && (
                          <div className="text-xs text-slate-500">
                            {venta.detalle.filter(d => d.TipoItem === 'producto').length} prod /
                            {venta.detalle.filter(d => d.TipoItem === 'servicio').length} serv
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <OrigenBadge origen={venta.Origen} />
                      </td>
                      <td className="px-6 py-4">
                        <EstadoBadge estado={venta.Estado} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerClick(venta)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>

                          {/* SOLO mostrar botón de anular si es venta MANUAL y está PAGADA */}
                          {venta.Estado === 'pagado' && venta.Origen === 'manual' && (
                            <TiempoRestanteAnulacion
                              fechaVenta={venta.FechaVenta}
                              onAnular={() => handleAnularClick(venta)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                      <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-lg font-medium">No hay ventas registradas</p>
                      <p className="text-sm mt-1">
                        {campoFiltro || filtroValor
                          ? "Intenta con otros filtros"
                          : "Las ventas se generan automáticamente desde los pedidos aprobados"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {paginatedData.length > 0 && (
              <div className="px-6 py-4 border-t">
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

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Las ventas son registros históricos y <strong>no se pueden eliminar</strong>.</li>
                  <li>Solo se pueden <strong>anular</strong> en caso de error.</li>
                  <li>Una vez anulada, la venta queda marcada como "Anulado" y no se puede modificar.</li>
                  <li>Las ventas desde pedido se generan automáticamente cuando un pedido es aprobado.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
};