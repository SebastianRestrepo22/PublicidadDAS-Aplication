import {
    getAllCompras as getAllComprasModel,
    getCompraById as getCompraByIdModel,
    createCompra as createCompraModel,
    deleteCompra as deleteCompraModel,
    updateCompra as updateCompraModel,
    updateCompraEstado as updateCompraEstadoModel,
    getDetallesByCompraId,
    // 🔥 Nuevas funciones importadas
    getComprasPaginated as getComprasPaginatedModel,
    buscarComprasPaginated
} from '../models/compras.model.js';

import {
    getDetalleByCompraIdModel,
    actualizarStockMultiple,
    getDetallesConProducto
} from '../models/detalleCompras.model.js';

// ========== FUNCIÓN EXISTENTE (la mantenemos para compatibilidad) ==========
export const getAllCompras = async (req, res) => {
  try {
    const compras = await getAllComprasModel();
    res.json(compras);
  } catch (err) {
    console.error("Error al obtener las compras:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ========== NUEVA FUNCIÓN: Obtener compras con paginación ==========
export const getComprasPaginated = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const filtroCampo = req.query.filtroCampo || null;
    const filtroValor = req.query.filtroValor || null;
    const sortBy = req.query.sortBy || 'FechaRegistro';
    const sortOrder = req.query.sortOrder || 'DESC';

    const result = await getComprasPaginatedModel({ 
      page, 
      limit, 
      filtroCampo, 
      filtroValor,
      sortBy,
      sortOrder
    });

    // Si no hay datos en la página actual y es página > 1, mostrar página 1
    if (result.data.length === 0 && page > 1) {
      const fallback = await getComprasPaginatedModel({ 
        page: 1, 
        limit, 
        filtroCampo, 
        filtroValor,
        sortBy,
        sortOrder
      });
      
      return res.status(200).json({
        data: fallback.data,
        pagination: {
          totalItems: fallback.totalItems,
          totalPages: Math.ceil(fallback.totalItems / limit),
          currentPage: 1,
          itemsPerPage: limit,
          hasNextPage: fallback.totalItems > limit,
          hasPrevPage: false
        }
      });
    }

    const totalPages = Math.ceil(result.totalItems / limit);

    res.status(200).json({
      data: result.data,
      pagination: {
        totalItems: result.totalItems,
        totalPages: totalPages,
        currentPage: result.currentPage,
        itemsPerPage: result.itemsPerPage,
        hasNextPage: result.currentPage < totalPages,
        hasPrevPage: result.currentPage > 1
      }
    });
  } catch (err) {
    console.error("Error al obtener compras con paginación:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ========== NUEVA FUNCIÓN: Buscar compras con paginación ==========
export const buscarCompras = async (req, res) => {
  const { campo, valor, page = 1, limit = 10 } = req.query;

  // Mapeo de campos amigables a nombres de columnas
  const columnasPermitidas = {
    id: 'CompraId',
    proveedor: 'ProveedorId',
    fecha: 'FechaRegistro',
    estado: 'Estado',
    total: 'Total'
  };

  const columna = columnasPermitidas[campo];

  if (!columna) {
    return res.status(400).json({ 
      message: 'Campo de búsqueda inválido. Use: id, proveedor, fecha, estado o total' 
    });
  }

  if (!valor || valor.trim() === '') {
    return res.status(400).json({ 
      message: 'El valor de búsqueda no puede estar vacío' 
    });
  }

  try {
    const result = await buscarComprasPaginated({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      columna, 
      valor: valor.trim() 
    });

    const totalPages = Math.ceil(result.totalItems / parseInt(limit));

    res.status(200).json({
      data: result.data,
      pagination: {
        totalItems: result.totalItems,
        totalPages: totalPages,
        currentPage: result.currentPage,
        itemsPerPage: result.itemsPerPage,
        hasNextPage: result.currentPage < totalPages,
        hasPrevPage: result.currentPage > 1
      }
    });
  } catch (err) {
    console.error('Error al buscar compras con paginación:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ========== FUNCIONES CRUD EXISTENTES (sin cambios) ==========

export const getCompraById = async (req, res) => {
  const id = req.params.id;

  try {
    const compra = await getCompraByIdModel(id);
    if (!compra) return res.status(404).json({ message: "Compra no encontrada" });

    // Obtener detalles de la compra con información del producto
    const detalles = await getDetallesConProducto(id);
    compra.detalle = detalles;

    res.json(compra);
  } catch (err) {
    console.error("Error al obtener compra por ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const createCompra = async (req, res) => {
  const { ProveedorId, Total, FechaRegistro, Estado } = req.body;

  if (!ProveedorId || Total === undefined || !FechaRegistro || !Estado) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const estadosValidos = ['pendiente', 'orden_enviada', 'recibido', 'anulada'];
  if (!estadosValidos.includes(Estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const result = await createCompraModel({
      ProveedorId,
      Total,
      FechaRegistro,
      Estado
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Error al crear la compra:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deleteCompra = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await deleteCompraModel(id);

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.json({ message: "Compra eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar compra:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const updateCompra = async (req, res) => {
  const id = req.params.id;

  if (!id || id.length !== 36){
    return res.status(400).json({ error: "ID invalido"});
  }

  const { ProveedorId, Total, FechaRegistro, Estado, MotivoCancelacion } = req.body;

  try {
    const result = await updateCompraModel(id, {
      ProveedorId,
      Total,
      FechaRegistro,
      Estado,
      MotivoCancelacion
    });

    if (result.affectedRows === 0 ) {
       return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.json({ message: "Compra actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar compra:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCompraEstado = async (req, res) => {
  const id = req.params.id;
  const { estado, productos, motivoCancelacion, esAnulacionAutomatica } = req.body;

  if (!id || id.length !== 36) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const estadosValidos = ['pendiente', 'recibido', 'anulada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const compra = await getCompraByIdModel(id);
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    // Si es anulación automática, verificar tiempo
    if (esAnulacionAutomatica && estado === 'anulada') {
      const puedeAnular = await puedeAnularseAutomaticamente(id);
      if (!puedeAnular) {
        return res.status(400).json({ 
          error: "La compra no puede anularse automáticamente (menos de 1 hora)" 
        });
      }
    }

    // Si el estado es "recibido", actualizar stock de productos
    if (estado === 'recibido') {
      let itemsAActualizar = productos;
      
      if (!itemsAActualizar || itemsAActualizar.length === 0) {
        const detalles = await getDetalleByCompraIdModel(id);
        itemsAActualizar = detalles.map(d => ({
          ProductoId: d.ProductoId,
          ColorId: d.ColorId,
          Cantidad: d.Cantidad,
          colores: d.colores
        }));
      }

      if (itemsAActualizar.length === 0) {
        return res.status(400).json({ error: "No hay productos para actualizar el stock" });
      }

      const resultadoStock = await actualizarStockMultiple(itemsAActualizar);
      await updateCompraEstadoModel(id, estado, motivoCancelacion);

      res.json({ 
        message: "Compra recibida y stock actualizado correctamente",
        stockActualizado: resultadoStock
      });
    } 
    // Si es anulación, restaurar stock (restar)
    else if (estado === 'anulada') {
      if (!motivoCancelacion) {
        return res.status(400).json({ error: "Debe proporcionar un motivo de cancelación" });
      }
      
      // Si la compra estaba recibida, restaurar stock
      if (compra.Estado === 'recibido') {
        const detalles = await getDetalleByCompraIdModel(id);
        const productosARestaurar = detalles.map(d => ({
          ProductoId: d.ProductoId,
          Cantidad: -d.Cantidad, // Negativo para restar
          colores: d.colores ? d.colores.map(c => ({
            ...c,
            Stock: -c.Stock
          })) : []
        }));
        
        await actualizarStockMultiple(productosARestaurar);
      }
      
      await updateCompraEstadoModel(id, estado, motivoCancelacion);
      res.json({ message: "Compra anulada correctamente" });
    }
    // Para otros estados, solo actualizar el estado
    else {
      await updateCompraEstadoModel(id, estado, motivoCancelacion);
      res.json({ message: `Estado actualizado a ${estado} correctamente` });
    }

  } catch (err) {
    console.error("Error al actualizar estado de compra:", err);
    res.status(500).json({ error: err.message });
  }
};