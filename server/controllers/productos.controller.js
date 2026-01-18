import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos
import { buscarProductoDB, createProducto, deleteDataProducto, findDuplicateName, getDataAllProductos, getDataProductoById, nombreProductoExiste, updateDataProducto } from '../models/producto.model.js';

// Crear producto
export const postProducto = async (req, res) => {
  const {
    Nombre,
    Descripcion,
    Imagen,
    Precio,
    Descuento,
    Stock,
    CategoriaId
  } = req.body;

  try {

    if (!Nombre || !Imagen || !Precio || !Descuento || !Stock || !CategoriaId) {
      return res.status(400).json({
        message: 'Los campos son obligatorios'
      })
    }

    const existente = await nombreProductoExiste(Nombre);

    if (existente.length > 0) {
      return res.status(409).json({ message: 'Producto ya existe' });
    }

    const ProductoId = uuidv4(); // Genera un ID único

    await createProducto({
      ProductoId,
      Nombre,
      Descripcion,
      Imagen,
      Precio,
      Descuento,
      Stock,
      CategoriaId
    });

    res.status(201).json({ message: 'Producto creado exitosamente', ProductoId });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los productos
export const getAllProducto = async (req, res) => {
  try {

    const rows = await getDataAllProductos();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener productos/servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
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

// Actualizar producto
export const updateProducto = async (req, res) => {
  const { ProductoId } = req.params;
  const {
    Nombre,
    Descripcion,
    Imagen,
    Precio,
    Descuento,
    Stock,
    CategoriaId
  } = req.body;

  try {
    if (!Nombre) {
      return res.status(400).json({
        message: 'El nombre es obligatorio'
      });
    }

    const duplicates = await findDuplicateName({ ProductoId, Nombre });
    if (duplicates.length > 0) {
      return res.status(409).json({
        message: 'El nombre ya existe.'
      });
    };

    const result = await updateDataProducto({ ProductoId, Nombre, Descripcion, Imagen, Precio, Descuento, Stock, CategoriaId });
    if (result === 0) {
      return res.status(409).json({ message: 'Producto no encontrado o sin cambios' });
    }

    res.status(200).json({
      message: 'Producto actualizado correctamente',
      producto: { ProductoId, Nombre }
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar producto/servicio
export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteDataProducto(id);

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Validar si el nombre ya existe
export const validarNombre = async (req, res) => {
  const { Nombre } = req.query;
  try {
    const productos = await nombreProductoExiste(Nombre)

    res.status(200).json({ exists: productos.length > 0 });
  } catch (error) {
    console.error('Error al validar nombre:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Buscar productos
export const buscarProducto = async (req, res) => {
  const { campo, valor } = req.query;

  const columnasPermitidas = {
    nombre: 'Nombre',
    descripcion: 'Descripcion',
    precio: 'Precio',
    descuento: 'Descuento',
    stock: 'Stock',
    categoria: 'CategoriaId'
  };

  const columna = columnasPermitidas[campo?.toLowerCase()];
  if (!columna) {
    return res.status(400).json({ message: 'Campo de búsqueda inválido' });
  }

  if (valor === undefined || valor === '') {
    return res.status(400).json({ message: 'Valor de búsqueda requerido' });
  }

  try {
    const camposExactos = ['Precio', 'Descuento', 'Stock', 'CategoriaId'];
    const operador = camposExactos.includes(columna) ? '=' : 'LIKE';

    let valorFinal = valor;

    if (['Precio', 'Descuento', 'Stock'].includes(columna)) {
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