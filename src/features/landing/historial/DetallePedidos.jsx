import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, MapPin, User, CreditCard, Package, Clock, CheckCircle, XCircle, Image as ImageIcon
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DetallePedido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pedido, setPedido] = useState(location.state?.pedido || null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(!location.state?.pedido);
  const [error, setError] = useState(null);

  const DEFAULT_PRODUCT_IMAGE = "https://via.placeholder.com/400x300?text=Producto";

  // Cargar productos al montar
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const productosRes = await axios.get(`${'http://localhost:3000'}/producto?estado=Activo`).catch(() => ({ data: [] }));
        setProductos(productosRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setLoading(false);
      }
    };

    if (!location.state?.pedido) {
      setError('No se encontró información del pedido.');
      setLoading(false);
    } else {
      cargarProductos();
    }
  }, [location.state]);

  const getEstadoLabel = (estado) => {
    const labels = { pendiente: 'Pendiente', aprobado: 'Aprobado', entregado: 'Entregado', cancelado: 'Cancelado' };
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

  const getUnitPrice = (item) => item.PrecioUnitario ?? item.Precio ?? item.price ?? item.valor ?? 0;

  // 🔥 Función mejorada para normalizar URLs
  const normalizeImageUrl = (url) => {
    if (!url) return null;
    
    // Si ya es una URL completa, devolverla
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si es una URL de data:image (base64)
    if (url.startsWith('data:image')) {
      return url;
    }
    
    // Limpiar la URL
    let cleanPath = url.replace(/^\/+/, ''); // Quitar slashes al inicio
    
    // Construir URL completa
    return `${'http://localhost:3000'}/${cleanPath}`;
  };

  // 🔥 Función mejorada para obtener la imagen del producto
  const getItemImage = (item) => {
    console.log('🔍 Buscando imagen para item:', item);
    
    // 1. Si el item tiene imagen directa
    if (item.UrlImagen) {
      const url = normalizeImageUrl(item.UrlImagen);
      console.log('📸 Usando UrlImagen del item:', url);
      return url;
    }
    
    // 2. Buscar en productos cargados
    if (productos.length > 0 && item.ProductoId) {
      const producto = productos.find(p => p.ProductoId === item.ProductoId);
      if (producto?.Imagen) {
        const url = normalizeImageUrl(producto.Imagen);
        console.log('📸 Imagen encontrada en catálogo:', url);
        return url;
      }
    }
    
    console.log('❌ No se encontró imagen, usando default');
    return DEFAULT_PRODUCT_IMAGE;
  };

  // Filtrar solo productos (excluir servicios)
  const soloProductos = pedido?.detalle?.filter(item => {
    return item.ProductoId && !item.ServicioId;
  }) || [];

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
            <button onClick={() => navigate('/cliente/MisPedidos')} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
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
        <button onClick={() => navigate('/cliente/MisPedidos')} className="inline-flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Volver</span>
        </button>

        {/* Header del Pedido */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido <span className="text-blue-600">#{String(pedido.PedidoClienteId).substring(0, 4)}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(pedido.FechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadgeColor(pedido.Estado)}`}>
              {getEstadoIcon(pedido.Estado)}
              {getEstadoLabel(pedido.Estado)}
            </span>
          </div>

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
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dirección de entrega</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {pedido.DireccionEntrega || pedido.Direccion || 'No especificada'}
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
                  {pedido.MetodoPago || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Solo Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            Productos ({soloProductos.length})
          </h2>
          
          <div className="space-y-4">
            {soloProductos.length > 0 ? (
              soloProductos.map((item, index) => {
                const unitPrice = getUnitPrice(item);
                const quantity = item.Cantidad || item.cantidad || 1;
                const itemTotal = unitPrice * quantity;
                const imageUrl = getItemImage(item);
                const itemName = item.Descripcion || item.descripcion || item.Nombre || `Producto ${index + 1}`;
                
                console.log('🖼️ Renderizando producto:', { itemName, imageUrl });
                
                return (
                  <div key={item.DetallePedidoId || item.id || index} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-full sm:w-32 h-32 flex-shrink-0">
                      <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={itemName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('⚠️ Error cargando imagen:', imageUrl);
                              e.target.onerror = null;
                              e.target.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">{itemName}</h3>
                          
                          {/* Mostrar color si existe */}
                          {item.ColorId && item.ColorNombre && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.ColorHex || '#ccc' }}></div>
                              <span className="text-xs text-gray-600">{item.ColorNombre}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold text-lg text-gray-900">
                            ${Number(itemTotal).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Precio unitario</p>
                          <p className="font-semibold text-blue-600">
                            ${Number(unitPrice).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cantidad</p>
                          <p className="font-semibold text-gray-900">{quantity}</p>
                        </div>
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
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total a pagar</span>
              <span className="text-2xl font-bold text-blue-600">
                ${Number(pedido.Total).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate('/cliente/MisPedidos')} className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Volver a Mis Pedidos
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;