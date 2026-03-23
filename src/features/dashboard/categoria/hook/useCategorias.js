import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getCategoriasPaginated,
  buscarCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getAllCategorias // 👈 Importamos la función
} from '../services/services.categoria';

export const useCategorias = () => {
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({ nombreCategoria: "", descripcion: "" });
  const [editData, setEditData] = useState(null);
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  // Estados para errores del formulario
  const [submitted, setSubmitted] = useState(false);
  const [nombreError, setNombreError] = useState('');
  const [descripcionError, setDescripcionError] = useState('');
  const [nombreDuplicado, setNombreDuplicado] = useState(false);
  const [verificandoNombre, setVerificandoNombre] = useState(false);
  const [originalNombre, setOriginalNombre] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Nueva función para cargar TODAS las categorías
  const cargarTodasLasCategorias = async () => {
    try {
      const data = await getAllCategorias();
      setAllData(data); // Actualizar allData con todas las categorías
      return data;
    } catch (error) {
      console.error("Error cargando todas las categorías:", error);
      return [];
    }
  };

  // Cargar categorías (paginadas)
  const cargarCategorias = async () => {
    try {
      let resultado;
      if (filtroCampo && filtroValor) {
        resultado = await buscarCategorias(filtroCampo, filtroValor, currentPage, itemsPerPage);
      } else {
        resultado = await getCategoriasPaginated(currentPage, itemsPerPage);
      }

      const { data, pagination } = resultado;
      setAllData(data);
      setPaginatedData(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);

      if (currentPage > pagination.totalPages && pagination.totalPages > 0) {
        setCurrentPage(pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
      setAllData([]);
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroCampo, filtroValor]);

  useEffect(() => {
    cargarCategorias();
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor]);

  // Verificar nombre duplicado
  const verificarNombreDuplicado = async (nombre, categoriaIdActual = null) => {
    if (!nombre || nombre.trim().length < 2) {
      setNombreDuplicado(false);
      return false;
    }

    setVerificandoNombre(true);
    try {
      const nombreLimpio = nombre.trim().toLowerCase();

      // 🔥 Opción A: Verificar en allData (rápido, pero puede estar desactualizado)
      const existeEnCache = allData.some(c =>
        c.Nombre.toLowerCase() === nombreLimpio &&
        (categoriaIdActual ? c.CategoriaId !== categoriaIdActual : true)
      );

      if (existeEnCache) {
        setNombreDuplicado(true);
        return true;
      }

      // 🔥 Opción B: Verificar en el backend (más confiable)
      // Solo si no se encontró en cache y hay conexión
      try {
        const params = new URLSearchParams({
          campo: 'nombre',
          valor: nombreLimpio
        });
        const response = await axios.get(`${API_URL}/api/categorias/buscar?${params}`);

        const existeEnBackend = response.data?.data?.some(c =>
          c.Nombre.toLowerCase() === nombreLimpio &&
          (categoriaIdActual ? c.CategoriaId !== categoriaIdActual : true)
        );

        setNombreDuplicado(!!existeEnBackend);
        return !!existeEnBackend;
      } catch (err) {
        // Si falla la llamada al backend, confiar en cache
        console.warn("No se pudo verificar en backend, usando cache");
        setNombreDuplicado(existeEnCache);
        return existeEnCache;
      }

    } catch (error) {
      console.error("Error verificando nombre:", error);
      return false;
    } finally {
      setVerificandoNombre(false);
    }
  };

  const validarFormulario = (esEditar = false) => {
    let isValid = true;
    const errores = {};

    if (!formData.nombreCategoria || !formData.nombreCategoria.trim()) {
      setNombreError("El nombre de la categoría es obligatorio");
      isValid = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombreCategoria.trim())) {
      setNombreError("El nombre solo puede contener letras y espacios");
      isValid = false;
    } else if (nombreDuplicado) {
      setNombreError(esEditar ? "Ya existe otra categoría con este nombre" : "Ya existe una categoría con este nombre");
      isValid = false;
    } else {
      setNombreError("");
    }

    if (!formData.descripcion || !formData.descripcion.trim()) {
      setDescripcionError("La descripción es obligatoria");
      isValid = false;
    } else {
      setDescripcionError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const esEdicion = !!editData?.CategoriaId;
    if (!validarFormulario(esEdicion)) return false;

    try {
      let response;
      if (esEdicion) {
        response = await updateCategoria(editData.CategoriaId, {
          nombreCategoria: formData.nombreCategoria.trim(),
          descripcion: formData.descripcion.trim()
        });
      } else {
        response = await createCategoria({
          nombreCategoria: formData.nombreCategoria.trim(),
          descripcion: formData.descripcion.trim()
        });
      }

      if (response?.status === 200 || response?.status === 201) {
        await cargarCategorias();
        toast.success(esEdicion ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
        return true;
      } else {
        toast.error("Error al guardar la categoría");
        return false;
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);

      const serverMessage = error?.response?.data?.error || error?.response?.data?.message;

      if (serverMessage) {
        if (serverMessage.toLowerCase().includes("nombre") || serverMessage.toLowerCase().includes("existe")) {
          setNombreError(serverMessage);
        } else {
          toast.warning(serverMessage);
        }
      } else {
        toast.error("Error de conexión con el servidor");
      }
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteCategoria(id);
      if (response.status === 200) {
        toast.success("Categoría eliminada correctamente");
        await cargarCategorias();
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error al eliminar la categoría";
      toast.error(errorMsg);
      return false;
    }
  };

  const resetFormErrors = () => {
    setSubmitted(false);
    setNombreError('');
    setDescripcionError('');
    setNombreDuplicado(false);
    setOriginalNombre('');
  };

  const resetForm = () => {
    setFormData({ nombreCategoria: "", descripcion: "" });
    setEditData(null);
    resetFormErrors();
  };

  return {
    // Estados
    allData,
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    formData,
    editData,
    filtroCampo,
    filtroValor,

    // Estados de error
    submitted,
    nombreError,
    descripcionError,
    nombreDuplicado,
    verificandoNombre,
    originalNombre,

    // Setters
    setCurrentPage,
    setItemsPerPage,
    setFormData,
    setEditData,
    setFiltroCampo,
    setFiltroValor,
    setSubmitted,
    setNombreError,
    setDescripcionError,
    setOriginalNombre,

    // Funciones
    cargarCategorias,
    cargarTodasLasCategorias,
    handleSubmit,
    handleDelete,
    verificarNombreDuplicado,
    resetFormErrors,
    resetForm
  };
};