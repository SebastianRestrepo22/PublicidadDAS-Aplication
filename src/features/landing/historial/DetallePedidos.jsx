import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, User, Calendar, CreditCard, Truck, AlertCircle,
  Package, Clock, CheckCircle, XCircle 
} from 'lucide-react';

const DetallePedido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pedido, setPedido] = useState(location.state?.pedido || null);
  const [loading, setLoading] = useState(!location.state?.pedido);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no recibimos el pedido por state, mostrar error
    if (!location.state?.pedido) {
      setError('No se encontró información del pedido. Por favor regresa a la lista de pedidos.');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [location.state]);

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      aprobado: 'Aprobado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  };

  const getStatusBadgeColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-amber-100 text-amber-800';
      case 'aprobado': return 'bg-blue-100 text-blue-800';
      case 'entregado': return 'bg-emerald-100 text-emerald-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-48 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
            <button
              onClick={() => navigate('/cliente/MisPedidos')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Volver a Mis Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de retroceso */}
        <button
          onClick={() => navigate('/cliente/MisPedidos')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Mis Pedidos
        </button>

        {/* Pedido Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Pedido #{String(pedido.PedidoClienteId).substring(0, 4)}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(pedido.FechaRegistro).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(pedido.Estado)}`}>
              {getEstadoIcon(pedido.Estado)}
              <span className="ml-1">{getEstadoLabel(pedido.Estado)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Cliente</span>
              </div>
              <p className="font-semibold text-gray-900">{pedido.NombreCliente || 'N/A'}</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Dirección</span>
              </div>
              <p className="font-semibold text-gray-900">
                {pedido.DireccionEntrega || pedido.Direccion || 'No especificada'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Entrega</span>
              </div>
              <p className="font-semibold text-gray-900">
                {pedido.FechaEntrega 
                  ? new Date(pedido.FechaEntrega).toLocaleDateString('es-ES')
                  : 'Pendiente'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Truck className="w-4 h-4" />
                <span className="text-sm">Método</span>
              </div>
              <p className="font-semibold text-gray-900">
                {pedido.MetodoEntrega || 'No especificado'}
              </p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Productos del Pedido
          </h2>
          
          <div className="space-y-4">
            {pedido.detalle && pedido.detalle.length > 0 ? (
              pedido.detalle.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {item.Descripcion || `Producto ${item.ProductoServicioId}`}
                      </h3>
                      {item.CodigoProducto && (
                        <p className="text-sm text-gray-600 mt-1">Código: {item.CodigoProducto}</p>
                      )}
                      {item.Especificaciones && (
                        <p className="text-sm text-gray-600 mt-1">Especificaciones: {item.Especificaciones}</p>
                      )}
                    </div>
                    <div className="text-right md:text-left md:w-48 flex-shrink-0">
                      <p className="font-bold text-gray-900 text-lg">
                        ${Number(item.PrecioUnitario || 0).toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Cantidad: {item.Cantidad || 1}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        Subtotal: ${Number((item.PrecioUnitario || 0) * (item.Cantidad || 1)).toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay productos en este pedido
              </div>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Resumen del Pedido</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">
                ${Number(pedido.SubTotal || 0).toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            
            {pedido.Descuento && pedido.Descuento > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Descuento:</span>
                <span className="font-semibold text-red-600">
                  -${Number(pedido.Descuento).toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-gray-700">
              <span>Impuestos:</span>
              <span className="font-semibold">
                ${Number(pedido.Impuesto || 0).toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            
            <div className="flex justify-between text-gray-700 pt-4 border-t border-gray-200">
              <span className="font-bold text-gray-900 text-lg">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${Number(pedido.Total).toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        {(pedido.Nota || pedido.MetodoPago) && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
            <div className="space-y-4">
              {pedido.Nota && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">Notas:</span>
                  </div>
                  <p className="text-gray-700 mt-1 pl-7">{pedido.Nota}</p>
                </div>
              )}
              
              {pedido.MetodoPago && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Método de Pago:</span>
                  </div>
                  <p className="text-gray-700 mt-1 pl-7">{pedido.MetodoPago}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acciones según estado */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/cliente/MisPedidos')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Volver a Mis Pedidos
          </button>
          
          {pedido.Estado === 'entregado' && (
            <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Dejar Reseña
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;