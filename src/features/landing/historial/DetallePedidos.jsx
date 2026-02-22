import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, User, CreditCard, Package, Clock, CheckCircle, XCircle 
} from 'lucide-react';

const DetallePedido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pedido, setPedido] = useState(location.state?.pedido || null);
  const [loading, setLoading] = useState(!location.state?.pedido);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      case 'pendiente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'aprobado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entregado': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Función auxiliar para obtener el precio unitario con múltiples fallbacks
  const getUnitPrice = (item) => {
    return item.PrecioUnitario ?? item.Precio ?? item.price ?? item.valor ?? 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="h-32 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
            <button
              onClick={() => navigate('/cliente/MisPedidos')}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Volver a Mis Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de retroceso */}
        <button
          onClick={() => navigate('/cliente/MisPedidos')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Volver</span>
        </button>

        {/* Header del Pedido */}
        <div className="bg-gray-200 rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido <span className="text-blue-600">#{String(pedido.PedidoClienteId).substring(0, 4)}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(pedido.FechaRegistro).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadgeColor(pedido.Estado)}`}>
              {getEstadoIcon(pedido.Estado)}
              {getEstadoLabel(pedido.Estado)}
            </span>
          </div>

          {/* Info principal en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</p>
                <p className="font-semibold text-gray-900 mt-0.5">{pedido.NombreCliente || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dirección de entrega</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {pedido.DireccionEntrega || pedido.Direccion || pedido.direccion || 'No especificada'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Método de pago</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {pedido.MetodoPago || pedido.metodoPago || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            Productos ({pedido.detalle?.length || 0})
          </h2>
          
          <div className="space-y-3">
            {pedido.detalle && pedido.detalle.length > 0 ? (
              pedido.detalle.map((item, index) => {
                const unitPrice = getUnitPrice(item);
                const quantity = item.Cantidad || item.cantidad || 1;
                const itemTotal = unitPrice * quantity;
                
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.Descripcion || item.descripcion || `Producto ${item.ProductoServicioId || item.id || index + 1}`}
                      </h3>
                      {item.CodigoProducto && (
                        <p className="text-sm text-gray-500 mt-1">Código: {item.CodigoProducto}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 sm:text-right">
                      <div>
                        <p className="text-xs text-gray-500">Precio</p>
                        <p className="font-bold text-blue-600">
                          ${Number(unitPrice).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cant.</p>
                        <p className="font-medium text-gray-900">{quantity}</p>
                      </div>
                      <div className="min-w-[80px]">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-bold text-gray-900">
                          ${Number(itemTotal).toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No hay productos en este pedido</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Resumen</h2>
          <div className="space-y-3">
            {pedido.Descuento > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Descuento</span>
                <span className="font-medium text-red-600">
                  -${Number(pedido.Descuento).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            {pedido.Impuesto > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Impuestos</span>
                <span className="font-medium">
                  ${Number(pedido.Impuesto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total a pagar</span>
              <span className="text-2xl font-bold text-blue-600">
                ${Number(pedido.Total).toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/cliente/MisPedidos')}
            className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Volver a Mis Pedidos
          </button>
          
          {pedido.Estado === 'entregado' && (
            <button className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-sm">
              Dejar Reseña
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;