// Función para formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat('es-ES', {
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getMinDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para acortar IDs
export const shortenId = (id) => {
  if (!id) return "—";
  const strId = String(id);
  return strId.length > 3 ? strId.slice(-3) : strId.padStart(3, '0');
};

export const formatPrice = (price) => {
  if (price === undefined || price === null) return '$0';
  
  // Convertir a número
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Formatear con separadores de miles
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice);
  
  // O si prefieres un formato más simple:
  // return `$${Math.round(numPrice).toLocaleString('es-CO')}`;
};

/**
 * Parsea un string de precio formateado a número
 * Útil para cuando necesitas el valor numérico
 */
export const parsePrice = (formattedPrice) => {
  if (!formattedPrice) return 0;
  // Eliminar símbolo de moneda y comas, luego convertir a número
  const cleanValue = formattedPrice.replace(/[$,]/g, '');
  return parseFloat(cleanValue) || 0;
};

// Función para obtener nombre de color
export const getColorName = (colorId, colores) => {
  if (!colorId || !colores || !Array.isArray(colores)) return "—";
  const color = colores.find(c => c.ColorId === colorId);
  return color ? color.Nombre : "—";
};

// Función para obtener color por ID
export const getColorById = (colorId, colores) => {
  if (!colorId || !colores || !Array.isArray(colores)) return null;
  return colores.find(c => c.ColorId === colorId);
};

// Función para obtener nombre de producto/servicio
export const getProductoNombre = (productoId, productos, servicios) => {
  if (!productoId) return "—";
  const producto = productos.find(p => p.ProductoId === productoId);
  if (producto) return producto.Nombre || producto.nombre || "Producto";
  const servicio = servicios.find(s => s.ServicioId === productoId);
  if (servicio) return servicio.Nombre || servicio.nombre || "Servicio";
  return "—";
};

// Función para generar IDs temporales
export const generateTempId = () => {
  return 'temp_' + Math.random().toString(36).substr(2, 9);
};

// Ayuda a calcular total
export const calcularTotalDetalles = (detalles) => {
  if (!Array.isArray(detalles)) return 0;
  return detalles.reduce((total, detalle) => {
    const cantidad = Number(detalle.Cantidad) || 0;
    const precio = Number(detalle.Precio) || 0;
    return total + (cantidad * precio);
  }, 0);
};

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

export const esServicio = (productoId, servicios) => {
  return servicios.some(s => s.ServicioId === productoId);
};

export const getProductoImagen = (productoId, productos, servicios) => {
  if (!productoId) return null;
  const producto = productos.find(p => p.ProductoId === productoId);
  if (producto && producto.UrlImagen) return producto.UrlImagen;
  const servicio = servicios.find(s => s.ServicioId === productoId);
  if (servicio && servicio.UrlImagen) return servicio.UrlImagen;
  return null;
};

export const getEstadoPago = (estado) => {
  if (estado === 'aprobado') return 'pagado';
  return estado;
};