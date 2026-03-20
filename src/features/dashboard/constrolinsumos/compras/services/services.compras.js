import axios from "axios";

const API_URL = 'http://localhost:3000';

// ========== COMPRAS ==========

export const getComprasPaginated = async (page = 1, limit = 5, filtroCampo = null, filtroValor = null, sortBy = 'FechaRegistro', sortOrder = 'DESC') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });
    
    if (filtroCampo && filtroValor && filtroValor.trim() !== '') {
      params.append('filtroCampo', filtroCampo);
      params.append('filtroValor', filtroValor.trim());
    }
    
    console.log("📤 getComprasPaginated - URL:", `${'http://localhost:3000'}/api/compras?${params}`);

    const response = await axios.get(`${'http://localhost:3000'}/api/compras?${params}`);
    
    console.log("✅ Respuesta:", {
      dataLength: response.data?.data?.length,
      pagination: response.data?.pagination
    });

    return response.data;
    
  } catch (error) {
    console.error("❌ Error en getComprasPaginated:", error);
    return { 
      data: [], 
      pagination: { 
        totalItems: 0, 
        totalPages: 1, 
        currentPage: page, 
        itemsPerPage: limit 
      } 
    };
  }
};

export const buscarCompras = async (filtroCampo, filtroValor, page = 1, limit = 5) => {
  try {
    // Construir el término de búsqueda según el campo
    let searchParam = {};
    
    if (filtroCampo === 'id') {
      searchParam = { q: filtroValor }; // Busca en ID
    } else if (filtroCampo === 'proveedor') {
      searchParam = { q: filtroValor }; // Busca en ProveedorId
    } else {
      searchParam = { q: filtroValor };
    }
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...searchParam
    });

    console.log("🔍 Buscando compras con params:", params.toString());
    
    const response = await axios.get(`${API_URL}/api/compras/buscar?${params}`);
    
    return response.data;
    
  } catch (error) {
    console.error("❌ Error en buscarCompras:", error);
    return { 
      data: [], 
      pagination: { 
        totalItems: 0, 
        totalPages: 1, 
        currentPage: page, 
        itemsPerPage: limit 
      } 
    };
  }
};

export const getAllCompras = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras/todas`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error en getAllCompras:", error);
    return [];
  }
};

export const getCompraById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error en getCompraById:", error);
    throw error;
  }
};

export const createCompra = async (compraData) => {
  try {
    const response = await axios.post(`${'http://localhost:3000'}/api/compras`, compraData);
    return response.data;
  } catch (error) {
    console.error("❌ Error en createCompra:", error);
    throw error;
  }
};

export const updateCompra = async (id, compraData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000'}/api/compras/${id}`, compraData);
    return response.data;
  } catch (error) {
    console.error("❌ Error en updateCompra:", error);
    throw error;
  }
};

export const deleteCompra = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000'}/api/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error en deleteCompra:", error);
    throw error;
  }
};

// ========== DETALLE COMPRAS ==========

export const getDetallesByCompraId = async (compraId) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/detalle-compras/compra/${compraId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error en getDetallesByCompraId:", error);
    return [];
  }
};

export const createDetalleCompra = async (detalleData) => {
  try {
    const dataToSend = {
      CompraId: detalleData.CompraId,
      ProductoId: detalleData.ProductoId,
      Cantidad: Number(detalleData.Cantidad) || 0,
      PrecioUnitario: Number(detalleData.PrecioUnitario) || 0,
      Descripcion: detalleData.Descripcion || null
    };
    
    if (detalleData.colores && Array.isArray(detalleData.colores) && detalleData.colores.length > 0) {
      const coloresProcesados = detalleData.colores.map(color => ({
        ColorId: String(color.ColorId || color.colorId || ''),
        Stock: Number(color.Stock || color.stock || 0),
        Nombre: String(color.Nombre || color.nombre || 'Color'),
        Hex: String(color.Hex || color.hex || '#CCCCCC')
      }));
      dataToSend.colores = coloresProcesados;
    } else {
      dataToSend.colores = [];
    }
    
    const response = await axios.post(`${'http://localhost:3000'}/api/detalle-compras`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("❌ Error en createDetalleCompra:", error);
    throw error;
  }
};

export const updateDetalleCompra = async (id, detalleData) => {
  try {
    const response = await axios.put(`${'http://localhost:3000'}/api/detalle-compras/${id}`, detalleData);
    return response.data;
  } catch (error) {
    console.error("❌ Error en updateDetalleCompra:", error);
    throw error;
  }
};

export const deleteDetalleCompra = async (id) => {
  try {
    const response = await axios.delete(`${'http://localhost:3000'}/api/detalle-compras/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error en deleteDetalleCompra:", error);
    throw error;
  }
};

// ========== PRODUCTOS ==========

export const getAllProductos = async () => {
  try {
    const params = {
      page: "1",
      limit: "1000"  // Límite alto para obtener todos
    };
    
    const response = await axios.get(`${'http://localhost:3000'}/producto`, { params });
    
    return response.data?.data || [];
  } catch (error) {
    console.error("❌ Error en getAllProductos:", error);
    return [];
  }
};

export const buscarProductosPorCampo = async (campo, valor, page = 1, limit = 5) => {
  try {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (campo && valor && valor.trim() !== "") {
      params.filtroCampo = campo;
      params.filtroValor = valor.trim();
    }

    const response = await axios.get(`${'http://localhost:3000'}/producto`, { params });
    
    return {
      data: response.data?.data || [],
      total: response.data?.pagination?.totalItems || 0,
      pages: response.data?.pagination?.totalPages || 1
    };
  } catch (error) {
    console.error("❌ Error en buscarProductosPorCampo:", error);
    return { data: [], total: 0, pages: 1 };
  }
};

// Función para búsqueda local de productos (para paginación en frontend)
export const buscarProductosLocal = (productos, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === "") {
    return productos;
  }
  
  const term = searchTerm.toLowerCase().trim();
  return productos.filter(producto => 
    producto.Nombre.toLowerCase().includes(term) ||
    (producto.SKU && producto.SKU.toLowerCase().includes(term)) ||
    (producto.Descripcion && producto.Descripcion.toLowerCase().includes(term))
  );
};

// ========== PROVEEDORES ==========

export const getAllProveedoresSimple = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/proveedores/todos`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error al cargar proveedores:", error);
    return [];
  }
};

export const getProveedorById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/api/proveedores/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener proveedor:", error);
    return null;
  }
};

// ========== COLORES ==========

export const getAllColores = async () => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/colores`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Error al cargar colores:", error);
    return [];
  }
};

export const getColorById = async (id) => {
  try {
    const response = await axios.get(`${'http://localhost:3000'}/colores/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener color:", error);
    return null;
  }
};

// ========== FUNCIONES DE UTILIDAD ==========

export const formatPrice = (value) => {
  const num = Number(value);
  return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
};

export const formatDate = (date) => {
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getShortId = (id) => {
  if (!id) return "---";
  const str = String(id);
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ========== FUNCIONES PARA CÁLCULOS ==========

export const calcularSubtotal = (cantidad, precioUnitario) => {
  const cant = Number(cantidad) || 0;
  const precio = Number(precioUnitario) || 0;
  return cant * precio;
};

export const calcularTotalCompra = (detalles) => {
  if (!Array.isArray(detalles)) return 0;
  return detalles.reduce((sum, item) => {
    return sum + (Number(item.Subtotal) || 0);
  }, 0);
};

// ========== VALIDACIONES ==========

export const validarCompra = (form, detalles, proveedores) => {
  const errores = [];
  
  if (!form.ProveedorId || !proveedores.some(p => p.ProveedorId === form.ProveedorId)) {
    errores.push("Debe seleccionar un proveedor válido.");
  }
  
  if (!form.FechaRegistro) {
    errores.push("La fecha de registro es obligatoria.");
  }
  
  if (!detalles || detalles.length === 0) {
    errores.push("Debe agregar al menos un artículo.");
  }
  
  for (let i = 0; i < detalles.length; i++) {
    const d = detalles[i];
    if (!d.ProductoId) {
      errores.push(`Artículo ${i + 1}: seleccione un producto.`);
    }
    if (!d.Cantidad || Number(d.Cantidad) <= 0) {
      errores.push(`Artículo ${i + 1}: cantidad debe ser mayor a 0.`);
    }
    if (d.PrecioUnitario === undefined || d.PrecioUnitario === null || Number(d.PrecioUnitario) < 0) {
      errores.push(`Artículo ${i + 1}: precio unitario debe ser mayor o igual a 0.`);
    }
  }
  
  return errores;
};

// ========== FUNCIONES PARA EXPORTAR/IMPORTAR ==========

export const exportarCompraAJSON = (compra, detalles) => {
  return {
    compra,
    detalles,
    fechaExportacion: new Date().toISOString()
  };
};

export const generarReporteCompra = (compra, detalles, productos, proveedores) => {
  const proveedor = proveedores.find(p => p.ProveedorId === compra.ProveedorId);
  
  const detallesConProducto = detalles.map(d => {
    const producto = productos.find(p => p.ProductoId === d.ProductoId);
    return {
      ...d,
      productoNombre: producto?.Nombre || 'Producto no encontrado',
      productoSKU: producto?.SKU || 'N/A'
    };
  });

  return {
    compraId: getShortId(compra.CompraId),
    proveedor: proveedor?.NombreProveedor || 'Desconocido',
    fecha: formatDate(compra.FechaRegistro),
    total: formatPrice(compra.Total),
    estado: compra.Estado || 'aprobado',
    detalles: detallesConProducto.map(d => ({
      producto: d.productoNombre,
      sku: d.productoSKU,
      cantidad: d.Cantidad,
      precioUnitario: formatPrice(d.PrecioUnitario),
      subtotal: formatPrice(d.Subtotal),
      colores: d.colores || []
    }))
  };
};