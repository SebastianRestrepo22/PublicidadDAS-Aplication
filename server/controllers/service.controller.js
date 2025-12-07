import { connectDB } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

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

        // Verificar si el nombre ya existe
        const [existente] = await connection.execute(
            'SELECT * FROM ProductoServicios WHERE Nombre = ?',
            [Nombre]
        );
        if (existente.length > 0) {
            return res.status(409).json({ message: 'Producto/servicio ya existe' });
        }

        const ProductoServicioId = uuidv4(); // Genera un ID único

        const esPersonalizado = EsPersonalizado ? 1 : 0;

        await connection.execute(
            `INSERT INTO ProductoServicios
   (ProductoServicioId, Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, EsPersonalizado, CategoriaId)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ProductoServicioId, Tipo, Nombre, Descripcion, UrlImagen, Precio, Descuento, Stock, esPersonalizado, CategoriaId]
        );

        res.status(201).json({ message: 'Producto/servicio creado exitosamente', ProductoServicioId });
    } catch (error) {
        console.error('Error al crear producto/servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todos los productos/servicios
export const getAllProductoServicios = async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT * FROM ProductoServicios');

    const parsedRows = rows.map(row => ({
      ...row,
      EsPersonalizado: !!(row.EsPersonalizado?.[0]) // convierte Buffer a booleano
    }));

    res.status(200).json(parsedRows);
  } catch (error) {
    console.error('Error al obtener productos/servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Obtener producto/servicio por ID
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

        res.status(200).json(productos[0]);
    } catch (error) {
        console.error('Error al obtener producto/servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar producto/servicio
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

  const esPersonalizado = EsPersonalizado === true || EsPersonalizado === 'true' ? 1 : 0;

  try {
    const connection = await connectDB();

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

// Eliminar producto/servicio
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

// Validar si el nombre ya existe
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

// Buscar productos/servicios
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

    // Determinar si el campo requiere comparación exacta
    const camposExactos = ['Precio', 'Descuento', 'Stock', 'EsPersonalizado', 'CategoriaId'];
    const operador = camposExactos.includes(columna) ? '=' : 'LIKE';

    // Convertir valor si es BIT
    let valorFinal = valor;
    if (columna === 'EsPersonalizado') {
      valorFinal = valor === 'true' || valor === '1' ? 1 : 0;
    }

    const parametro = operador === '=' ? valorFinal : `%${valor}%`;

    const [productos] = await connection.execute(
      `SELECT * FROM ProductoServicios WHERE ${columna} ${operador} ?`,
      [parametro]
    );

    // Normalizar campo EsPersonalizado
    const parsedRows = productos.map(row => ({
      ...row,
      EsPersonalizado: !!(row.EsPersonalizado?.[0])
    }));

    res.status(200).json(parsedRows);
  } catch (error) {
    console.error('Error al buscar productos/servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

