import { connectDB } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

// Normalizador para EsPersonalizado y futuros campos especiales
const normalizeProducto = (row) => ({
  ...row,
  EsPersonalizado: !!(row.EsPersonalizado?.[0] ?? row.EsPersonalizado)
});

// Crear producto/servicio

export const createProductoServicio = async (req, res) => {
  const {
    Tipo,
    Nombre,
    Descripcion,
    UrlImagen,
    Precio,
    Descuento,
    Stock,
    EsPersonalizado,
    CategoriaId
  } = req.body;

  try {
    const connection = await connectDB();

    // Verificar nombre existente
    const [existente] = await connection.execute(
      'SELECT * FROM ProductoServicios WHERE Nombre = ?',
      [Nombre]
    );

    if (existente.length > 0) {
      return res.status(409).json({ message: 'Producto/servicio ya existe' });
    }

    const ProductoServicioId = uuidv4();
    const esPersonalizado = EsPersonalizado ? 1 : 0;

    await connection.execute(
      `INSERT INTO ProductoServicios
        (ProductoServicioId, Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, EsPersonalizado, CategoriaId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ProductoServicioId, Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, esPersonalizado, CategoriaId]
    );

    res.status(201).json({
      message: 'Producto/servicio creado exitosamente',
      ProductoServicioId
    });

  } catch (error) {
    console.error('Error al crear producto/servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los productos

export const getAllProductoServicios = async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT * FROM ProductoServicios');

    const parsedRows = rows.map(normalizeProducto);

    res.status(200).json(parsedRows);
  } catch (error) {
    console.error('Error al obtener productos/servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener producto por ID

export const getProductoServicioById = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await connectDB();
    const [productos] = await connection.execute(
      'SELECT * FROM ProductoServicios WHERE ProductoServicioId = ?',
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ message: 'Producto/servicio no encontrado' });
    }

    res.status(200).json(normalizeProducto(productos[0]));

  } catch (error) {
    console.error('Error al obtener producto/servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar producto

export const updateProductoServicio = async (req, res) => {
  const { id } = req.params;
  const {
    Tipo,
    Nombre,
    Descripcion,
    UrlImagen,
    Precio,
    Descuento,
    Stock,
    EsPersonalizado,
    CategoriaId
  } = req.body;

  try {
    const connection = await connectDB();

    const esPersonalizado = EsPersonalizado === true || EsPersonalizado === 'true' ? 1 : 0;

    const [result] = await connection.execute(
      `UPDATE ProductoServicios SET
        Tipo = ?, 
        Nombre = ?, 
        Descripcion = ?, 
        UrlImagen = ?, 
        Precio = ?, 
        Descuento = ?, 
        Stock = ?, 
        EsPersonalizado = ?, 
        CategoriaId = ?
      WHERE ProductoServicioId = ?`,
      [Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, esPersonalizado, CategoriaId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto/servicio no encontrado' });
    }

    res.status(200).json({ message: 'Producto/servicio actualizado correctamente' });

  } catch (error) {
    console.error('Error al actualizar producto/servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar producto

export const deleteProductoServicio = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await connectDB();

    const [result] = await connection.execute(
      'DELETE FROM ProductoServicios WHERE ProductoServicioId = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto/servicio no encontrado' });
    }

    res.status(200).json({ message: 'Producto/servicio eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar producto/servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Validar nombre duplicado

export const validarNombre = async (req, res) => {
  const { nombre } = req.query;

  try {
    const connection = await connectDB();
    const [productos] = await connection.execute(
      'SELECT * FROM ProductoServicios WHERE Nombre = ?',
      [nombre]
    );

    res.status(200).json({ exists: productos.length > 0 });

  } catch (error) {
    console.error('Error al validar nombre:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Búsqueda dinámica

export const buscarProductoServicios = async (req, res) => {
  const { campo, valor } = req.query;

  const columnasPermitidas = {
    tipo: 'Tipo',
    nombre: 'Nombre',
    descripcion: 'Descripcion',
    url: 'UrlImagen',
    precio: 'Precio',
    descuento: 'Descuento',
    stock: 'Stock',
    personalizado: 'EsPersonalizado',
    categoria: 'CategoriaId'
  };

  const columna = columnasPermitidas[campo];

  if (!columna) {
    return res.status(400).json({ message: 'Campo de búsqueda inválido' });
  }

  try {
    const connection = await connectDB();

    const camposExactos = ['Precio', 'Descuento', 'Stock', 'EsPersonalizado', 'CategoriaId'];
    const operador = camposExactos.includes(columna) ? '=' : 'LIKE';

    let valorFinal = valor;

    if (columna === 'EsPersonalizado') {
      valorFinal = valor === 'true' || valor === '1' ? 1 : 0;
    }

    const parametro = operador === '=' ? valorFinal : `%${valor}%`;

    const [productos] = await connection.execute(
      `SELECT * FROM ProductoServicios WHERE ${columna} ${operador} ?`,
      [parametro]
    );

    const parsedRows = productos.map(normalizeProducto);

    res.status(200).json(parsedRows);

  } catch (error) {
    console.error('Error al buscar productos/servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// NUEVO: Descontar stock (para pedidos)

export const descontarStock = async (productoId, cantidad) => {
  const connection = await connectDB();

  const [rows] = await connection.execute(
    'SELECT Stock FROM ProductoServicios WHERE ProductoServicioId = ?',
    [productoId]
  );

  if (rows.length === 0) throw new Error('Producto no existe');

  if (rows[0].Stock < cantidad) {
    throw new Error('Stock insuficiente');
  }

  await connection.execute(
    'UPDATE ProductoServicios SET Stock = Stock - ? WHERE ProductoServicioId = ?',
    [cantidad, productoId]
  );
};
