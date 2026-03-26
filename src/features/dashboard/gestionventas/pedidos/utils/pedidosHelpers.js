// ========================================
// FUNCIONES DE FECHA
// ========================================

// Función para formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Función para formato de fecha en input
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtener fecha mínima (hoy)
export const getMinDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ========================================
// FUNCIONES DE ID
// ========================================

// Función para acortar IDs
export const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 3 ? strId.slice(-3) : strId.padStart(3, '0');
};

// Función para generar IDs temporales
export const generateTempId = () => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '$ 0';
  
  // Convertir a número entero (redondeado)
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '$ 0';
  
  // Formato visual colombiano estándar estricto: $ X.XXX (sin decimales)
  return '$ ' + Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Parsear precio formateado a número
export const parsePrice = (formattedPrice) => {
  if (!formattedPrice) return 0;
  // Eliminar símbolo de moneda y puntos, luego convertir a número
  const cleanValue = formattedPrice.replace(/[$,]/g, '');
  return parseFloat(cleanValue) || 0;
};

// Calcular total de detalles
export const calcularTotalDetalles = (detalles) => {
  if (!Array.isArray(detalles)) return 0;
  return detalles.reduce((total, detalle) => {
    const cantidad = Number(detalle.Cantidad) || 0;
    const precio = Number(detalle.Precio) || 0;
    return total + (cantidad * precio);
  }, 0);
};

// ========================================
// FUNCIONES DE ESTADOS
// ========================================

// Configuración de estados para pedidos
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  EN_PROCESO: 'en_proceso',
  EN_CAMINO: 'en_camino',
  ENTREGADO: 'entregado',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado'
};

// Configuración de estados para ventas
export const ESTADOS_VENTA = {
  PAGADO: 'pagado',
  PENDIENTE: 'pendiente',
  ANULADO: 'anulado',
  RECHAZADO: 'rechazado'
};

// Mapa de colores para estados
export const estadoColorMap = {
  // Pedidos
  [ESTADOS_PEDIDO.PENDIENTE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ESTADOS_PEDIDO.APROBADO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ESTADOS_PEDIDO.EN_PROCESO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ESTADOS_PEDIDO.EN_CAMINO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ESTADOS_PEDIDO.ENTREGADO]: 'bg-green-100 text-green-800 border-green-200',
  [ESTADOS_PEDIDO.FINALIZADO]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [ESTADOS_PEDIDO.CANCELADO]: 'bg-red-100 text-red-800 border-red-200',
  
  // Ventas
  [ESTADOS_VENTA.PAGADO]: 'bg-green-100 text-green-800 border-green-200',
  [ESTADOS_VENTA.PENDIENTE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ESTADOS_VENTA.ANULADO]: 'bg-red-100 text-red-800 border-red-200',
  [ESTADOS_VENTA.RECHAZADO]: 'bg-gray-100 text-gray-800 border-gray-200'
};

// Mapa de iconos para estados
export const estadoIconMap = {
  [ESTADOS_PEDIDO.PENDIENTE]: '⏳',
  [ESTADOS_PEDIDO.APROBADO]: '✅',
  [ESTADOS_PEDIDO.EN_PROCESO]: '🔄',
  [ESTADOS_PEDIDO.EN_CAMINO]: '🚚',
  [ESTADOS_PEDIDO.ENTREGADO]: '📦',
  [ESTADOS_PEDIDO.FINALIZADO]: '✨',
  [ESTADOS_PEDIDO.CANCELADO]: '❌',
  [ESTADOS_VENTA.PAGADO]: '💰',
  [ESTADOS_VENTA.PENDIENTE]: '⏳',
  [ESTADOS_VENTA.ANULADO]: '🚫',
  [ESTADOS_VENTA.RECHAZADO]: '⚠️'
};

// Mapa de labels para estados
export const estadoLabelMap = {
  [ESTADOS_PEDIDO.PENDIENTE]: 'Pendiente',
  [ESTADOS_PEDIDO.APROBADO]: 'Aprobado',
  [ESTADOS_PEDIDO.EN_PROCESO]: 'En Proceso',
  [ESTADOS_PEDIDO.EN_CAMINO]: 'En Camino',
  [ESTADOS_PEDIDO.ENTREGADO]: 'Entregado',
  [ESTADOS_PEDIDO.FINALIZADO]: 'Finalizado',
  [ESTADOS_PEDIDO.CANCELADO]: 'Cancelado',
  [ESTADOS_VENTA.PAGADO]: 'Pagado',
  [ESTADOS_VENTA.PENDIENTE]: 'Pendiente',
  [ESTADOS_VENTA.ANULADO]: 'Anulado',
  [ESTADOS_VENTA.RECHAZADO]: 'Rechazado'
};

// Orden de estados para validación de transiciones
export const ordenEstados = {
  [ESTADOS_PEDIDO.PENDIENTE]: 1,
  [ESTADOS_PEDIDO.APROBADO]: 2,
  [ESTADOS_PEDIDO.EN_PROCESO]: 2,
  [ESTADOS_PEDIDO.EN_CAMINO]: 3,
  [ESTADOS_PEDIDO.ENTREGADO]: 4,
  [ESTADOS_PEDIDO.FINALIZADO]: 3,
  [ESTADOS_PEDIDO.CANCELADO]: 999
};

// Estados permitidos según método de pago
export const getEstadosPermitidos = (metodoPago) => {
  const esContraEntrega = metodoPago === 'contra_entrega';
  
  if (esContraEntrega) {
    return [
      ESTADOS_PEDIDO.PENDIENTE,
      ESTADOS_PEDIDO.EN_PROCESO,
      ESTADOS_PEDIDO.EN_CAMINO,
      ESTADOS_PEDIDO.ENTREGADO,
      ESTADOS_PEDIDO.CANCELADO
    ];
  } else {
    // Transferencia y QR
    return [
      ESTADOS_PEDIDO.PENDIENTE,
      ESTADOS_PEDIDO.APROBADO,
      ESTADOS_PEDIDO.CANCELADO
    ];
  }
};

// Verificar si un estado es accesible
export const isEstadoAccesible = (estadoActual, nuevoEstado) => {
  if (nuevoEstado === ESTADOS_PEDIDO.CANCELADO) return true; // Cancelar siempre permitido
  
  const nivelActual = ordenEstados[estadoActual];
  const nivelNuevo = ordenEstados[nuevoEstado];
  
  if (!nivelActual || !nivelNuevo) return true;
  
  // Solo permitir si el nivel es mayor o igual (no retroceder)
  return nivelNuevo >= nivelActual;
};

// Obtener color de estado
export const getEstadoColor = (estado) => {
  return estadoColorMap[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Obtener icono de estado
export const getEstadoIcon = (estado) => {
  return estadoIconMap[estado] || '📋';
};

// Obtener label de estado
export const getEstadoLabel = (estado) => {
  return estadoLabelMap[estado] || estado;
};

// ========================================
// FUNCIONES DE COLORES
// ========================================

// Obtener nombre de color
export const getColorName = (colorId, colores) => {
  if (!colorId || !colores || !Array.isArray(colores)) return "—";
  const color = colores.find(c => c.ColorId === colorId);
  return color ? color.Nombre : "—";
};

// Obtener color por ID
export const getColorById = (colorId, colores) => {
  if (!colorId || !colores || !Array.isArray(colores)) return null;
  return colores.find(c => c.ColorId === colorId);
};

// ========================================
// FUNCIONES DE PRODUCTOS Y SERVICIOS
// ========================================

// Obtener nombre de producto/servicio
export const getProductoNombre = (productoId, productos, servicios) => {
  if (!productoId) return "—";
  const producto = productos.find(p => p.ProductoId === productoId);
  if (producto) return producto.Nombre || producto.nombre || "Producto";
  const servicio = servicios.find(s => s.ServicioId === productoId);
  if (servicio) return servicio.Nombre || servicio.nombre || "Servicio";
  return "—";
};

// Verificar si es servicio
export const esServicio = (productoId, servicios) => {
  return servicios.some(s => s.ServicioId === productoId);
};

// Obtener imagen de producto/servicio
export const getProductoImagen = (productoId, productos, servicios) => {
  if (!productoId) return null;
  const producto = productos.find(p => p.ProductoId === productoId);
  if (producto && producto.UrlImagen) return producto.UrlImagen;
  const servicio = servicios.find(s => s.ServicioId === productoId);
  if (servicio && servicio.UrlImagen) return servicio.UrlImagen;
  return null;
};

// ========================================
// FUNCIONES DE TELÉFONO
// ========================================

// Validación de teléfono - 10 dígitos sin guiones
export const validarTelefono = (telefono) => {
  if (!telefono) return true;
  const regex = /^\d{10}$/;
  return regex.test(telefono);
};

// Formatear teléfono - solo números, sin guiones
export const formatearTelefono = (telefono) => {
  if (!telefono) return "";
  const numeros = telefono.replace(/\D/g, '');
  return numeros.slice(0, 10);
};

// ========================================
// FUNCIONES DE ESTADO DE PAGO
// ========================================

// Obtener estado de pago (para ventas)
export const getEstadoPago = (estado) => {
  if (estado === ESTADOS_PEDIDO.APROBADO) return ESTADOS_VENTA.PAGADO;
  return estado;
};

// ========================================
// FUNCIONES DE MÉTODOS DE PAGO
// ========================================

// Obtener label del método de pago
export const getMetodoPagoLabel = (metodo) => {
  const labels = {
    transferencia: 'Transferencia Bancaria',
    contra_entrega: 'Contra Entrega',
    efectivo: 'Efectivo',
    QR: 'QR'
  };
  return labels[metodo] || metodo?.replace('_', ' ') || '—';
};

