import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos
import { buscarServicioDB, createService, deleteDataService, findDuplicateName, getDataAllServcios, getDataServiceById, nombreServiceExiste, updateDataServicio } from '../models/services.model.js';

// Crear producto
export const postService = async (req, res) => {
    const {
        Nombre,
        Descripcion,
        Imagen,
        Precio,
        Descuento,
        CategoriaId,
        Tamano
    } = req.body;

    try {

        if (!Nombre || !Imagen || !Precio || !Descuento || !CategoriaId || !Tamano) {
            return res.status(400).json({
                message: 'Los campos son obligatorios'
            })
        }

        const existente = await nombreServiceExiste(Nombre);

        if (existente.length > 0) {
            return res.status(409).json({ message: 'Servicio ya existe' });
        }

        const ServicioId = uuidv4(); // Genera un ID único

        await createService({
            ServicioId,
            Nombre,
            Descripcion,
            Imagen,
            Precio,
            Descuento,
            CategoriaId,
            Tamano
        });

        res.status(201).json({ message: 'Servicio creado exitosamente', ServicioId });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todos los productos
export const getAllService = async (req, res) => {
    try {

        const rows = await getDataAllServcios();

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


// Obtener producto por ID
export const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {

        const productos = await getDataServiceById(id);

        if (productos.length === 0) {
            return res.status(404).json({ message: 'Serivicio no encontrado' });
        }

        res.status(200).json(productos[0]);
    } catch (error) {
        console.error('Error al obtener el servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar producto
export const updateService = async (req, res) => {
    const { ServicioId } = req.params;
    const {
        Nombre,
        Descripcion,
        Imagen,
        Precio,
        Descuento,
        CategoriaId,
        Tamano
    } = req.body;

    try {
        if (!Nombre) {
            return res.status(400).json({
                message: 'El nombre es obligatorio'
            });
        }

        const duplicates = await findDuplicateName({ ServicioId, Nombre });
        if (duplicates.length > 0) {
            return res.status(409).json({
                message: 'El nombre ya existe.'
            });
        };

        const result = await updateDataServicio({ ServicioId, Nombre, Descripcion, Imagen, Precio, Descuento, CategoriaId, Tamano });
        if (result === 0) {
            return res.status(409).json({ message: 'Servicio no encontrado o sin cambios' });
        }

        res.status(200).json({
            message: 'Servicio actualizado correctamente',
            producto: { ServicioId, Nombre }
        });
    } catch (error) {
        console.error('Error al actualizar el servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar servicio
export const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteDataService(id);

        res.status(200).json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Validar si el nombre ya existe
export const validarNombre = async (req, res) => {
    const { Nombre } = req.query;
    try {
        const servicios = await nombreServiceExiste(Nombre)

        res.status(200).json({ exists: servicios.length > 0 });
    } catch (error) {
        console.error('Error al validar nombre:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const buscarService = async (req, res) => {
  const { campo, valor } = req.query;

  const columnasPermitidas = {
    nombre: 'Nombre',
    descripcion: 'Descripcion',
    precio: 'Precio',
    descuento: 'Descuento',
    categoria: 'CategoriaId',
    tamano: 'Tamano'
  };

  const columna = columnasPermitidas[campo?.toLowerCase()];
  if (!columna) {
    return res.status(400).json({ message: 'Campo de búsqueda inválido' });
  }

  if (valor === undefined || valor === '') {
    return res.status(400).json({ message: 'Valor de búsqueda requerido' });
  }

  try {
    // Campos que requieren comparación exacta
    const camposExactos = ['Precio', 'Descuento', 'CategoriaId', 'Tamano'];
    const operador = camposExactos.includes(columna) ? '=' : 'LIKE';

    let valorFinal = valor;

    if (['Precio', 'Descuento'].includes(columna)) {
      valorFinal = Number(valor);
      if (Number.isNaN(valorFinal)) {
        return res.status(400).json({ message: `${columna} debe ser numérico` });
      }
    }

    if (columna === 'Tamano') {
      const tamanosValidos = ['Pequeña', 'Mediana', 'Grande'];
      if (!tamanosValidos.includes(valor)) {
        return res.status(400).json({ message: 'Tamaño inválido' });
      }
    }

    const parametro = operador === '=' ? valorFinal : `%${valor}%`;

    const servicios = await buscarServicioDB({ columna, operador, parametro });

    res.status(200).json({ results: servicios });
  } catch (error) {
    console.error('Error al buscar servicios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};