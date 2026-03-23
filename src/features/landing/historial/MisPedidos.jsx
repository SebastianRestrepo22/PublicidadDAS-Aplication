import React, { useState, useEffect } from 'react';
import { useMisPedidos } from '../hooks/useMisPedidos';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import {
  Search, Package, Clock, CheckCircle, XCircle, ChevronRight, Truck, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';

const MisPedidos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [clienteId, setClienteId] = useState(null);
  const { user, loading: authLoading } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.CedulaId) {
      const loadUser = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${API_URL}/user/${user.CedulaId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setClienteId(String(response.data.CedulaId));
        } catch (err) {
          console.error("Error al cargar usuario:", err);
        }
      };
      loadUser();
    }
  }, [user]);

  const { pedidos, loading, refetch } = useMisPedidos(clienteId);

  // Función para determinar si es contra entrega
  const esContraEntrega = (pedido) => {
    const metodo = pedido.MetodoPago?.toLowerCase() || '';
    return metodo === 'contra_entrega';
  };

  // Obtener el estado a mostrar (usa EstadoParaMostrar si existe)
  const getEstadoActual = (pedido) => {
    return pedido.EstadoParaMostrar || pedido.Estado;
  };

  // Obtener todos los estados únicos de los pedidos
  const getUniqueStatuses = () => {
    const estados = new Set(['Todos']);
    pedidos.forEach(pedido => {
      const estado = getEstadoActual(pedido);
      estados.add(estado);
    });
    return Array.from(estados);
  };

  // Función para obtener la etiqueta del estado
  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      aprobado: 'Aprobado',
      en_proceso: 'En Proceso',
      en_camino: 'En Camino',
      entregado: 'Entregado',
      finalizado: 'Finalizado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pagado': return 'bg-green-50 text-green-700 border-green-200';
      case 'aprobado': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'en_proceso': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'en_camino': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'entregado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'finalizado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Función para obtener el ícono del estado
  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'pagado': return <CheckCircle className="w-4 h-4" />;
      case 'aprobado': return <Package className="w-4 h-4" />;
      case 'en_proceso': return <Package className="w-4 h-4" />;
      case 'en_camino': return <Truck className="w-4 h-4" />;
      case 'entregado': return <CheckCircle className="w-4 h-4" />;
      case 'finalizado': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Función para obtener el ícono del tipo de pedido
  const getTipoIcon = (pedido) => {
    if (esContraEntrega(pedido)) {
      return <Truck className="w-5 h-5 text-purple-600" />;
    }
    return <DollarSign className="w-5 h-5 text-green-600" />;
  };

  const handleOrderClick = (order) => {
    navigate('/cliente/DetallePedido', {
      state: { pedido: order, clienteId }
    });
  };

  const handleCancelarPedido = async (pedidoId, e) => {
    e?.stopPropagation();

    if (!window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/pedidos-clientes/${pedidoId}`,
        { Estado: "cancelado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success("Pedido cancelado exitosamente");
        if (refetch) {
          refetch();
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      toast.error(error.response?.data?.error || "Error al cancelar el pedido");
    }
  };

  // Verificar si se puede cancelar un pedido (solo contra entrega y pendiente)
  const puedeCancelar = (pedido) => {
    const estado = getEstadoActual(pedido);
    // Solo contra entrega Y estado pendiente
    return esContraEntrega(pedido) && estado === 'pendiente';
  };

  const allStatuses = getUniqueStatuses();
  const filteredOrders = pedidos.filter((order) => {
    const estadoActual = getEstadoActual(order);

    const matchesSearch = !searchTerm ||
      (order.PedidoClienteId && order.PedidoClienteId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.detalle && order.detalle.some(d =>
        (d.Descripcion && d.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.ProductoServicioId && d.ProductoServicioId.toString().includes(searchTerm))
      ));

    const matchesStatus = filterStatus === 'Todos' || estadoActual === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = filteredOrders.filter(o => {
    const estado = getEstadoActual(o);
    return estado !== 'entregado' && estado !== 'finalizado' && estado !== 'cancelado' && estado !== 'pagado';
  });

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-20">Cargando sesión...</div>
      </>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso restringido</h3>
            <p className="text-gray-600">Inicia sesión para ver tus pedidos</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3 mt-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl border border-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 pt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
          <p className="text-gray-600">Gestiona y realiza seguimiento de tus pedidos</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número de pedido o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {allStatuses.map((status) => {
            const count = status === 'Todos'
              ? pedidos.length
              : pedidos.filter(o => getEstadoActual(o) === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${filterStatus === status
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
                  }`}
              >
                {status === 'Todos' ? 'Todos los pedidos' : getEstadoLabel(status)}
                <span className={`ml-2 ${filterStatus === status ? 'text-blue-100' : 'text-gray-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Orders Section */}
        {activeOrders.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Pedidos Activos</h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {activeOrders.length} {activeOrders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>

            <div className="space-y-4">
              {activeOrders.map((order) => {
                const estadoActual = getEstadoActual(order);

                return (
                  <div
                    key={order.PedidoClienteId}
                    onClick={() => handleOrderClick(order)}
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${esContraEntrega(order) ? 'bg-purple-100' : 'bg-green-100'
                            }`}>
                            {getTipoIcon(order)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {esContraEntrega(order) ? 'Pedido' : 'Venta'} #{String(order.PedidoClienteId).substring(0, 4)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.FechaRegistro).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getEstadoColor(estadoActual)}`}>
                              {getEstadoIcon(estadoActual)}
                              {getEstadoLabel(estadoActual)}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>

                          {/* Botón de Cancelar - SOLO para contra entrega Y pendiente */}
                          {puedeCancelar(order) && (
                            <button
                              onClick={(e) => handleCancelarPedido(order.PedidoClienteId, e)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-xs font-medium whitespace-nowrap"
                            >
                              <XCircle className="w-3 h-3" />
                              Cancelar Pedido
                            </button>
                          )}
                        </div>
                      </div>

                      {order.detalle?.length > 0 && (
                        <div className="space-y-2 mb-4 pl-15">
                          {order.detalle.slice(0, 2).map((d, i) => (
                            <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{d.Descripcion || d.ProductoNombre || `Producto ${d.ProductoId}`}</span>
                            </div>
                          ))}
                          {order.detalle.length > 2 && (
                            <div className="text-sm text-gray-500 pl-4">
                              +{order.detalle.length - 2} producto{order.detalle.length - 2 !== 1 ? 's' : ''} más
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-xl font-bold text-gray-900">
                          ${Number(order.Total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Historial Section */}
        {filteredOrders.length > activeOrders.length && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Historial</h2>
            <div className="space-y-4">
              {filteredOrders
                .filter(order => !activeOrders.includes(order))
                .map((order) => {
                  const estadoActual = getEstadoActual(order);

                  return (
                    <div
                      key={order.PedidoClienteId}
                      onClick={() => handleOrderClick(order)}
                      className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden opacity-75 hover:opacity-100 cursor-pointer"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${esContraEntrega(order) ? 'bg-purple-50' : 'bg-green-50'
                              }`}>
                              {getTipoIcon(order)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {esContraEntrega(order) ? 'Pedido' : 'Venta'} #{String(order.PedidoClienteId).substring(0, 4)}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(order.FechaRegistro).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getEstadoColor(estadoActual)}`}>
                              {getEstadoIcon(estadoActual)}
                              {getEstadoLabel(estadoActual)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-500">Total</span>
                          <span className="text-lg font-semibold text-gray-900">
                            ${Number(order.Total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron pedidos</h3>
            <p className="text-gray-600">No tienes pedidos que coincidan con tu búsqueda</p>
          </div>
        )}
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
  );
};

export default MisPedidos;   