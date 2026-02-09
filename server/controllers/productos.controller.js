import { v4 as uuidv4 } from 'uuid';
import { 
  buscarProductoDB, 
  createProducto, 
  deleteDataProducto, 
  findDuplicateName, 
  getDataAllProductos, 
  getDataProductoById, 
  nombreProductoExiste, 
  updateDataProducto 
} from '../models/producto.model.js';

// Crear producto - Ahora incluye UsaColores y Stock
export const postProducto = async (req, res) => {
  const {
    Nombre,
    Descripcion,
    Imagen,
    Precio,
    Descuento,
    CategoriaId,
    Estado,
    UsaColores = 0,
    Stock = null
  } = req.body;

  try {
    // Validación básica
    if (!Nombre || !Imagen || !Precio || Descuento === undefined || Descuento === null || !CategoriaId) {
      return res.status(400).json({
        message: 'Los campos son obligatorios'
      })
    }

    // Validar UsaColores
    if (UsaColores !== 0 && UsaColores !== 1) {
      return res.status(400).json({ message: 'UsaColores debe ser 0 o 1' });
    }

    // Si no usa colores, Stock es obligatorio
    if (UsaColores === 0 && (Stock === null || Stock === undefined || Stock < 0)) {
      return res.status(400).json({ 
        message: 'Para productos sin colores, el stock es obligatorio y debe ser mayor o igual a 0' 
      });
    }

    // Si usa colores, Stock debe ser null
    if (UsaColores === 1 && Stock !== null) {
      return res.status(400).json({ 
        message: 'Para productos con colores, el stock debe ser null (se maneja por color)' 
      });
    }

    const existente = await nombreProductoExiste(Nombre);

    if (existente.length > 0) {
      return res.status(409).json({ message: 'Producto ya existe' });
    }

    const ProductoId = uuidv4();

    await createProducto({
      ProductoId,
      Nombre,
      Descripcion,
      Imagen,
      Precio,
      Descuento,
      CategoriaId,
      Estado,
      UsaColores,
      Stock
    });

    res.status(201).json({ 
      message: 'Producto creado exitosamente', 
      ProductoId,
      UsaColores,
      Stock 
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cambiar estado del producto
export const cambiarEstadoProducto = async (req, res) => {
  const { id } = req.params;
  const { Estado } = req.body;

  try {
    if (!Estado || (Estado !== 'Activo' && Estado !== 'Inactivo')) {
      return res.status(400).json({ 
        message: 'Estado no válido. Debe ser "Activo" o "Inactivo"' 
      });
    }

    const result = await updateDataProducto({ 
      ProductoId: id, 
      Estado 
    });

    if (result === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({
      message: `Producto ${Estado === 'Activo' ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los productos - Adaptada para nuevo esquema
export const getAllProducto = async (req, res) => {
  try {
    const rows = await getDataAllProductos();

    const productosMap = {};

    for (const row of rows) {
      if (!productosMap[row.ProductoId]) {
        productosMap[row.ProductoId] = {
          ProductoId: row.ProductoId,
          Nombre: row.Nombre,
          Descripcion: row.Descripcion,
          Imagen: row.Imagen,
          Precio: row.Precio,
          Descuento: row.Descuento,
          CategoriaId: row.CategoriaId,
          UsaColores: row.UsaColores,
          // StockGeneral solo para productos que NO usan colores
          Stock: row.UsaColores === 0 ? row.StockGeneral : null,
          Colores: []
        };
      }

      if (row.ColorId) {
        productosMap[row.ProductoId].Colores.push({
          ColorId: row.ColorId,
          Nombre: row.ColorNombre,
          Hex: row.Hex,
          Stock: row.StockColor || 0
        });
      }
    }

    res.status(200).json(Object.values(productosMap));
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener producto por ID
export const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const productos = await getDataProductoById(id);

    if (productos.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(productos[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar producto - Ahora incluye UsaColores y Stock
export const updateProducto = async (req, res) => {
  const { ProductoId } = req.params;
  const {
    Nombre,
    Descripcion,
    Imagen,
    Precio,
    Descuento,
    CategoriaId,
    UsaColores = 0,
    Stock = null
  } = req.body;

  try {
    if (!Nombre) {
      return res.status(400).json({
        message: 'El nombre es obligatorio'
      });
    }

    // Validar UsaColores
    if (UsaColores !== 0 && UsaColores !== 1) {
      return res.status(400).json({ message: 'UsaColores debe ser 0 o 1' });
    }

    // Si no usa colores, Stock es obligatorio
    if (UsaColores === 0 && (Stock === null || Stock === undefined || Stock < 0)) {
      return res.status(400).json({ 
        message: 'Para productos sin colores, el stock es obligatorio y debe ser mayor o igual a 0' 
      });
    }

    // Si usa colores, Stock debe ser null
    if (UsaColores === 1 && Stock !== null) {
      return res.status(400).json({ 
        message: 'Para productos con colores, el stock debe ser null (se maneja por color)' 
      });
    }

    const duplicates = await findDuplicateName({ ProductoId, Nombre });
    if (duplicates.length > 0) {
      return res.status(409).json({
        message: 'El nombre ya existe.'
      });
    };

    const result = await updateDataProducto({ 
      ProductoId, 
      Nombre, 
      Descripcion, 
      Imagen, 
      Precio, 
      Descuento, 
      CategoriaId,
      UsaColores,
      Stock
    });
    
    if (result === 0) {
      return res.status(409).json({ message: 'Producto no encontrado o sin cambios' });
    }

    res.status(200).json({
      message: 'Producto actualizado correctamente',
      producto: { 
        ProductoId, 
        Nombre,
        UsaColores,
        Stock 
      }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar producto
// Eliminar producto - Modificado para verificar estado y relaciones
export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero verificar si el producto existe
    const [producto] = await buscarProductoDB({
      columna: 'ProductoId',
      operador: '=',
      parametro: id
    });

    if (producto.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el producto tiene colores asociados
    const [coloresAsociados] = await dbPool.query(
      `SELECT COUNT(*) as count FROM ProductoColores WHERE ProductoId = ?`,
      [id]
    );

    if (coloresAsociados[0].count > 0) {
      // Si tiene colores asociados, no se puede eliminar, solo desactivar
      return res.status(400).json({ 
        message: 'Este producto no puede eliminarse porque tiene información asociada. Puedes desactivarlo para que no aparezca en el sistema.'
      });
    }

    // Verificar si el producto está inactivo
    if (producto[0].Estado === 'Inactivo') {
      // Si ya está inactivo, proceder con la eliminación
      await deleteDataProducto(id);
      return res.status(200).json({ message: 'Producto eliminado correctamente' });
    }

    // Si está activo y no tiene colores asociados, desactivarlo primero
    await updateEstadoProducto(id, 'Inactivo');
    
    res.status(200).json({ 
      message: 'Producto desactivado correctamente. Para eliminarlo permanentemente, primero debe estar inactivo.' 
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    
    // Si hay error de clave foránea (producto tiene ventas/pedidos asociados)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'Este producto no puede eliminarse porque tiene información asociada en ventas o pedidos. Puedes desactivarlo para que no aparezca en el sistema.'
      });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cambiar estado del producto (Activo/Inactivo)
export const updateEstadoProducto = async (ProductoId, Estado) => {
  const estadosPermitidos = ['Activo', 'Inactivo'];
  
  if (!estadosPermitidos.includes(Estado)) {
    throw new Error('Estado no válido');
  }

  const [rows] = await dbPool.query(
    `UPDATE Productos SET Estado = ? WHERE ProductoId = ?`,
    [Estado, ProductoId]
  );
  
  return rows.affectedRows;
};

// Validar si el nombre ya existe
export const validarNombre = async (req, res) => {
  const { Nombre } = req.query;
  try {
    const productos = await nombreProductoExiste(Nombre);

    res.status(200).json({ exists: productos.length > 0 });
  } catch (error) {
    console.error('Error al validar nombre:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Buscar productos - Actualizada para incluir nuevos campos
export const buscarProducto = async (req, res) => {
  const { campo, valor } = req.query;

  const columnasPermitidas = {
    nombre: 'Nombre',
    descripcion: 'Descripcion',
    precio: 'Precio',
    descuento: 'Descuento',
    categoria: 'CategoriaId',
    usacolores: 'UsaColores',
    stock: 'Stock'
  };

  const columna = columnasPermitidas[campo?.toLowerCase()];
  if (!columna) {
    return res.status(400).json({ message: 'Campo de búsqueda inválido' });
  }

  if (valor === undefined || valor === '') {
    return res.status(400).json({ message: 'Valor de búsqueda requerido' });
  }

  try {
    const camposExactos = ['Precio', 'Descuento', 'CategoriaId', 'UsaColores', 'Stock'];
    const operador = camposExactos.includes(columna) ? '=' : 'LIKE';

    let valorFinal = valor;

    if (['Precio', 'Descuento', 'UsaColores', 'Stock'].includes(columna)) {
      valorFinal = Number(valor);
      if (Number.isNaN(valorFinal)) {
        return res.status(400).json({ message: `${columna} debe ser un número válido` });
      }
    }

    if (columna === 'CategoriaId') {
      if (!valor || typeof valor !== 'string') {
        return res.status(400).json({ message: 'CategoriaId inválido' });
      }
    }

    const parametro = operador === '=' ? valorFinal : `%${valor}%`;

    const productos = await buscarProductoDB({
      columna,
      operador,
      parametro
    });

    res.status(200).json({ results: productos });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};