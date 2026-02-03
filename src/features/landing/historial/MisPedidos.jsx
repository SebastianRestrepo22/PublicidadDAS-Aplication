import React, { useState, useEffect } from 'react';
import { useMisPedidos } from '../hooks/useMisPedidos';
import { Navbar } from '../components/Navbar';
import axios from 'axios';

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

  // Estados válidos según tu backend
  const allStatuses = ['Todos', 'pendiente', 'aprobado', 'entregado', 'cancelado'];

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      aprobado: 'aprobado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-purple-100 text-purple-800';
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrado
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
      <div className="w-full p-4 sm:p-6 bg-gray-50">
        <Navbar />
        <div className="text-center mt-20 text-gray-600">
          Inicia sesión para ver tus pedidos
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-6">
        <Navbar />
        <div className="animate-pulse space-y-4 mt-16">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 bg-gray-50">
      <Navbar />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mt-16">Mis Pedidos</h1>
        <p className="text-sm text-gray-500">Consulta el estado y el historial de tus pedidos</p>
      </div>

      {/* Búsqueda */}
      <div className="mb-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por ID o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-lg">🔍</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allStatuses.map((status) => {
          const count = status === 'Todos'
            ? pedidos.length
            : pedidos.filter(o => o.Estado === status).length;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'Todos' ? 'Todos' : getEstadoLabel(status)} ({count})
            </button>
          );
        })}
      </div>

      {/* Pedidos Activos */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            📦 Pedidos Activos
          </h2>
          <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            {activeOrders.length}
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No tienes pedidos activos.
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.PedidoClienteId}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">
                        #{order.PedidoClienteId}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEstadoColor(order.Estado)}`}>
                        {getEstadoLabel(order.Estado)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>📅 {new Date(order.FechaRegistro).toLocaleDateString()}</div>
                      <div>💰 ${Number(order.Total).toFixed(2)}</div>
                      {order.detalle?.length > 0 && (
                        <div className="text-xs">
                          {order.detalle.slice(0, 2).map((d, i) => (
                            <div key={i}>• {d.Descripcion || d.ProductoServicioId}</div>
                          ))}
                          {order.detalle.length > 2 && (
                            <div>+{order.detalle.length - 2} más</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-400 text-xl">›</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial (solo si el filtro no es "Todos") */}
      {filterStatus !== 'Todos' && filteredOrders.length > activeOrders.length && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial</h2>
          <div className="space-y-3">
            {filteredOrders
              .filter(order => !activeOrders.includes(order))
              .map((order) => (
                <div
                  key={order.PedidoClienteId}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">
                          #{order.PedidoClienteId}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getEstadoColor(order.Estado)}`}>
                          {getEstadoLabel(order.Estado)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>📅 {new Date(order.FechaRegistro).toLocaleDateString()}</div>
                        <div>💰 ${Number(order.Total).toFixed(2)}</div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-xl">›</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPedidos;