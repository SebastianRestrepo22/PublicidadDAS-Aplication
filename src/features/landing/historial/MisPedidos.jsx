import React, { useState, useEffect } from 'react';
import { useMisPedidos } from '../hooks/useMisPedidos';
import { Navbar } from '../components/Navbar';
import axios from 'axios';
import { Search, Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const MisPedidos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [clienteId, setClienteId] = useState(null);

  useEffect(() => {
    const usuarioLocal = JSON.parse(localStorage.getItem("usuario"));
    console.log('Usuario local:', usuarioLocal);
    
    if (usuarioLocal?.CedulaId) {
      console.log('CedulaId:', usuarioLocal.CedulaId);
      const loadUser = async () => {
        try {
          const token = localStorage.getItem("token");
          console.log('Token:', token);
          
          const response = await axios.get(
            `http://localhost:3000/user/${usuarioLocal.CedulaId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('Respuesta usuario:', response.data);
          setClienteId(String(response.data.CedulaId));
        } catch (err) {
          console.error("Error al cargar usuario:", err);
          console.error("Error details:", err.response?.data);
        }
      };
      loadUser();
    }
  }, []);

  const { pedidos, loading } = useMisPedidos(clienteId);

  const allStatuses = ['Todos', 'pendiente', 'aprobado', 'entregado', 'cancelado'];

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'aprobado': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'entregado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'aprobado': return <Package className="w-4 h-4" />;
      case 'entregado': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = pedidos.filter((order) => {
    const matchesSearch = !searchTerm ||
      (order.PedidoClienteId && order.PedidoClienteId.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.detalle && order.detalle.some(d =>
        (d.Descripcion && d.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.ProductoServicioId && d.ProductoServicioId.toString().includes(searchTerm))
      ));

    const matchesStatus = filterStatus === 'Todos' || order.Estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = filteredOrders.filter(o =>
    o.Estado !== 'entregado' && o.Estado !== 'cancelado'
  );

  if (!clienteId) {
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
              : pedidos.filter(o => o.Estado === status).length;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  filterStatus === status
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
              {activeOrders.map((order) => (
                <div
                  key={order.PedidoClienteId}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{order.PedidoClienteId}
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
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getEstadoColor(order.Estado)}`}>
                          {getEstadoIcon(order.Estado)}
                          {getEstadoLabel(order.Estado)}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>

                    {order.detalle?.length > 0 && (
                      <div className="space-y-2 mb-4 pl-15">
                        {order.detalle.slice(0, 2).map((d, i) => (
                          <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{d.Descripcion || `Producto ${d.ProductoServicioId}`}</span>
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
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {filterStatus !== 'Todos' && filteredOrders.length > activeOrders.length && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">Historial</h2>
            <div className="space-y-4">
              {filteredOrders
                .filter(order => !activeOrders.includes(order))
                .map((order) => (
                  <div
                    key={order.PedidoClienteId}
                    className="bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden opacity-75 hover:opacity-100"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Pedido #{order.PedidoClienteId}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(order.FechaRegistro).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getEstadoColor(order.Estado)}`}>
                          {getEstadoIcon(order.Estado)}
                          {getEstadoLabel(order.Estado)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${Number(order.Total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron pedidos</h3>
            <p className="text-gray-600">No tienes pedidos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;