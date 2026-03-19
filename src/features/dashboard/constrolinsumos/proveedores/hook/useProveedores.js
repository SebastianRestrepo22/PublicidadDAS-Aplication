import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  getProveedoresPaginated, 
  buscarProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  getAllProveedores 
} from '../services/services.proveedores';

const API_BASE = 'http://localhost:3000/api';

export const useProveedores = () => {
  const [allData, setAllData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [estadoActivos, setEstadoActivos] = useState({});
  
  const [formData, setFormData] = useState({ 
    nombreProveedor: "", 
    nit: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: 1
  });
  
  const [editData, setEditData] = useState(null);
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  
  // Estados para errores del formulario
  const [submitted, setSubmitted] = useState(false);
  const [nombreError, setNombreError] = useState('');
  const [nitError, setNitError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [direccionError, setDireccionError] = useState('');
  
  // Estados para validación de unicidad
  const [nombreDuplicado, setNombreDuplicado] = useState(false);
  const [nitDuplicado, setNitDuplicado] = useState(false);
  const [telefonoDuplicado, setTelefonoDuplicado] = useState(false);
  const [correoDuplicado, setCorreoDuplicado] = useState(false);
  
  const [verificandoNombre, setVerificandoNombre] = useState(false);
  const [verificandoNit, setVerificandoNit] = useState(false);
  const [verificandoTelefono, setVerificandoTelefono] = useState(false);
  const [verificandoCorreo, setVerificandoCorreo] = useState(false);
  
  const [originalNombre, setOriginalNombre] = useState('');
  const [originalNit, setOriginalNit] = useState('');
  const [originalTelefono, setOriginalTelefono] = useState('');
  const [originalCorreo, setOriginalCorreo] = useState('');

  // Estados para controlar modales
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [openConfirmarEstado, setOpenConfirmarEstado] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState(null);
  const [loading, setLoading] = useState(false);

  // Timeouts para debounce
  const [timeouts, setTimeouts] = useState({
    nombre: null,
    nit: null,
    telefono: null,
    correo: null
  });

  // ========== VALIDACIONES DE FORMATO ==========
  const validarFormatoNombre = (nombre) => {
    if (!nombre || !nombre.trim()) {
      return { valido: false, mensaje: "El nombre es obligatorio" };
    }
    if (nombre.trim().length < 2) {
      return { valido: false, mensaje: "El nombre debe tener al menos 2 caracteres" };
    }
    if (nombre.trim().length > 100) {
      return { valido: false, mensaje: "El nombre no puede exceder 100 caracteres" };
    }
    // Solo letras y espacios
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre.trim())) {
      return { valido: false, mensaje: "El nombre solo puede contener letras y espacios" };
    }
    return { valido: true, mensaje: "" };
  };

  const validarFormatoNit = (nit) => {
    if (!nit || !nit.trim()) {
      return { valido: true, mensaje: "" };
    }
    
    const nitLimpio = nit.trim();
    if (!nitLimpio.startsWith('3')) {
      return { valido: false, mensaje: "El NIT debe comenzar con el número 3" };
    }

    const soloNumeros = nitLimpio.replace(/-/g, '');
    if (soloNumeros.length < 8) {
      return { valido: false, mensaje: "El NIT debe tener al menos 8 dígitos" };
    }
    if (soloNumeros.length > 11) {
      return { valido: false, mensaje: "El NIT no puede tener más de 11 dígitos" };
    }
    if (!/^[0-9-]+$/.test(nitLimpio)) {
      return { valido: false, mensaje: "El NIT solo puede contener números y guiones" };
    }
    if (nitLimpio.startsWith('-') || nitLimpio.endsWith('-') || nitLimpio.includes('--')) {
      return { valido: false, mensaje: "Formato de NIT inválido" };
    }
    return { valido: true, mensaje: "" };
  };

  const validarFormatoTelefono = (telefono) => {
    if (!telefono) {
      return { valido: false, mensaje: "El teléfono es obligatorio" };
    }
    if (!/^[0-9]{10}$/.test(telefono)) {
      return { valido: false, mensaje: "El teléfono debe tener exactamente 10 dígitos" };
    }
    return { valido: true, mensaje: "" };
  };

  const validarFormatoCorreo = (correo) => {
    if (!correo) {
      return { valido: false, mensaje: "El correo electrónico es obligatorio" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return { valido: false, mensaje: "Formato de correo inválido" };
    }
    return { valido: true, mensaje: "" };
  };

  const validarFormatoDireccion = (direccion) => {
    if (!direccion || !direccion.trim()) {
      return { valido: false, mensaje: "La dirección es obligatoria" };
    }
    if (direccion.trim().length < 5) {
      return { valido: false, mensaje: "La dirección debe tener al menos 5 caracteres" };
    }
    return { valido: true, mensaje: "" };
  };

  // ========== VALIDACIONES DE UNICIDAD CON BACKEND ==========
  const verificarNombreDuplicado = async (nombre, proveedorIdActual = null) => {
    // Limpiar timeout anterior
    if (timeouts.nombre) clearTimeout(timeouts.nombre);
    
    // Validar formato primero
    const formatoValido = validarFormatoNombre(nombre);
    if (!formatoValido.valido) {
      setNombreError(formatoValido.mensaje);
      setNombreDuplicado(false);
      setVerificandoNombre(false);
      return;
    }

    setVerificandoNombre(true);
    setNombreError("");

    // Crear nuevo timeout
    const newTimeout = setTimeout(async () => {
      try {
        const nombreLimpio = nombre.trim();
        const params = new URLSearchParams({
          campo: 'nombre',
          valor: nombreLimpio
        });
        
        if (proveedorIdActual) {
          params.append('excludeId', proveedorIdActual);
        }

        const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/validar-campo?${params}`);
        
        if (response.data.existe) {
          setNombreDuplicado(true);
          setNombreError("⚠️ Ya existe un proveedor con este nombre");
        } else {
          setNombreDuplicado(false);
          setNombreError("");
        }
      } catch (error) {
        console.error("Error verificando nombre:", error);
        setNombreDuplicado(false);
      } finally {
        setVerificandoNombre(false);
      }
    }, 500);

    setTimeouts(prev => ({ ...prev, nombre: newTimeout }));
  };

  const verificarNitDuplicado = async (nit, proveedorIdActual = null) => {
    if (timeouts.nit) clearTimeout(timeouts.nit);
    
    if (!nit || !nit.trim()) {
      setNitError("");
      setNitDuplicado(false);
      setVerificandoNit(false);
      return;
    }

    const formatoValido = validarFormatoNit(nit);
    if (!formatoValido.valido) {
      setNitError(formatoValido.mensaje);
      setNitDuplicado(false);
      setVerificandoNit(false);
      return;
    }

    setVerificandoNit(true);
    setNitError("");

    const newTimeout = setTimeout(async () => {
      try {
        const nitLimpio = nit.trim();
        const params = new URLSearchParams({
          campo: 'nit',
          valor: nitLimpio
        });
        
        if (proveedorIdActual) {
          params.append('excludeId', proveedorIdActual);
        }

        const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/validar-campo?${params}`);
        
        if (response.data.existe) {
          setNitDuplicado(true);
          setNitError("⚠️ Ya existe un proveedor con este NIT");
        } else {
          setNitDuplicado(false);
          setNitError("");
        }
      } catch (error) {
        console.error("Error verificando NIT:", error);
        setNitDuplicado(false);
      } finally {
        setVerificandoNit(false);
      }
    }, 500);

    setTimeouts(prev => ({ ...prev, nit: newTimeout }));
  };

  const verificarTelefonoDuplicado = async (telefono, proveedorIdActual = null) => {
    if (timeouts.telefono) clearTimeout(timeouts.telefono);
    
    const formatoValido = validarFormatoTelefono(telefono);
    if (!formatoValido.valido) {
      setTelefonoError(formatoValido.mensaje);
      setTelefonoDuplicado(false);
      setVerificandoTelefono(false);
      return;
    }

    setVerificandoTelefono(true);
    setTelefonoError("");

    const newTimeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          campo: 'telefono',
          valor: telefono
        });
        
        if (proveedorIdActual) {
          params.append('excludeId', proveedorIdActual);
        }

        const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/validar-campo?${params}`);
        
        if (response.data.existe) {
          setTelefonoDuplicado(true);
          setTelefonoError("⚠️ Ya existe un proveedor con este teléfono");
        } else {
          setTelefonoDuplicado(false);
          setTelefonoError("");
        }
      } catch (error) {
        console.error("Error verificando teléfono:", error);
        setTelefonoDuplicado(false);
      } finally {
        setVerificandoTelefono(false);
      }
    }, 500);

    setTimeouts(prev => ({ ...prev, telefono: newTimeout }));
  };

  const verificarCorreoDuplicado = async (correo, proveedorIdActual = null) => {
    if (timeouts.correo) clearTimeout(timeouts.correo);
    
    const formatoValido = validarFormatoCorreo(correo);
    if (!formatoValido.valido) {
      setCorreoError(formatoValido.mensaje);
      setCorreoDuplicado(false);
      setVerificandoCorreo(false);
      return;
    }

    setVerificandoCorreo(true);
    setCorreoError("");

    const newTimeout = setTimeout(async () => {
      try {
        const correoLimpio = correo.trim().toLowerCase();
        const params = new URLSearchParams({
          campo: 'correo',
          valor: correoLimpio
        });
        
        if (proveedorIdActual) {
          params.append('excludeId', proveedorIdActual);
        }

        const response = await axios.get(`${'http://localhost:3000/api'}/proveedores/validar-campo?${params}`);
        
        if (response.data.existe) {
          setCorreoDuplicado(true);
          setCorreoError("⚠️ Ya existe un proveedor con este correo");
        } else {
          setCorreoDuplicado(false);
          setCorreoError("");
        }
      } catch (error) {
        console.error("Error verificando correo:", error);
        setCorreoDuplicado(false);
      } finally {
        setVerificandoCorreo(false);
      }
    }, 500);

    setTimeouts(prev => ({ ...prev, correo: newTimeout }));
  };

  // ========== VALIDACIÓN DEL FORMULARIO COMPLETO ==========
  const validarFormulario = (esEdicion = false) => {
    let isValid = true;
    const nuevosErrores = {};

    // Validar nombre
    const nombreValid = validarFormatoNombre(formData.nombreProveedor);
    if (!nombreValid.valido) {
      setNombreError(nombreValid.mensaje);
      isValid = false;
    } else if (nombreDuplicado) {
      setNombreError(esEdicion ? "⚠️ Ya existe otro proveedor con este nombre" : "⚠️ Ya existe un proveedor con este nombre");
      isValid = false;
    } else {
      setNombreError("");
    }

    // Validar NIT
    if (formData.nit && formData.nit.trim()) {
      const nitValid = validarFormatoNit(formData.nit);
      if (!nitValid.valido) {
        setNitError(nitValid.mensaje);
        isValid = false;
      } else if (nitDuplicado) {
        setNitError("⚠️ Ya existe un proveedor con este NIT");
        isValid = false;
      } else {
        setNitError("");
      }
    } else {
      setNitError("");
    }

    // Validar teléfono
    const telefonoValid = validarFormatoTelefono(formData.telefono);
    if (!telefonoValid.valido) {
      setTelefonoError(telefonoValid.mensaje);
      isValid = false;
    } else if (telefonoDuplicado) {
      setTelefonoError("⚠️ Ya existe un proveedor con este teléfono");
      isValid = false;
    } else {
      setTelefonoError("");
    }

    // Validar correo
    const correoValid = validarFormatoCorreo(formData.correo);
    if (!correoValid.valido) {
      setCorreoError(correoValid.mensaje);
      isValid = false;
    } else if (correoDuplicado) {
      setCorreoError("⚠️ Ya existe un proveedor con este correo");
      isValid = false;
    } else {
      setCorreoError("");
    }

    // Validar dirección
    const direccionValid = validarFormatoDireccion(formData.direccion);
    if (!direccionValid.valido) {
      setDireccionError(direccionValid.mensaje);
      isValid = false;
    } else {
      setDireccionError("");
    }

    return isValid;
  };

  // ========== CARGAR DATOS ==========
  const cargarTodosLosProveedores = async () => {
    try {
      const data = await getAllProveedores();
      setAllData(data);
      return data;
    } catch (error) {
      console.error("Error cargando todos los proveedores:", error);
      return [];
    }
  };

  const cargarProveedores = async () => {
    try {
      let resultado;
      if (filtroCampo && filtroValor) {
        resultado = await buscarProveedores(filtroCampo, filtroValor, currentPage, itemsPerPage);
      } else {
        resultado = await getProveedoresPaginated(currentPage, itemsPerPage);
      }

      const { data, pagination } = resultado;
      setAllData(data);
      setPaginatedData(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);

      // Actualizar estados de los checkboxes
      const estados = {};
      data.forEach((p) => {
        estados[p.ProveedorId] = Number(p.Estado);
      });
      setEstadoActivos(estados);

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
    cargarProveedores();
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor]);

  // ========== HANDLERS CRUD ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setLoading(true);

    const esEdicion = !!editData?.ProveedorId;
    
    // Validar todas las verificaciones en progreso
    if (verificandoNombre || verificandoNit || verificandoTelefono || verificandoCorreo) {
      toast.warning("Por favor espera a que terminen las validaciones");
      setLoading(false);
      return false;
    }

    if (!validarFormulario(esEdicion)) {
      setLoading(false);
      return false;
    }

    try {
      let response;
      if (esEdicion) {
        response = await updateProveedor(editData.ProveedorId, {
          nombreProveedor: formData.nombreProveedor.trim(),
          nit: formData.nit?.trim() || null,
          telefono: formData.telefono,
          correo: formData.correo.trim(),
          direccion: formData.direccion.trim(),
          estado: formData.estado
        });
      } else {
        response = await createProveedor({
          nombreProveedor: formData.nombreProveedor.trim(),
          nit: formData.nit?.trim() || null,
          telefono: formData.telefono,
          correo: formData.correo.trim(),
          direccion: formData.direccion.trim(),
          estado: 1
        });
      }

      if (response?.status === 200 || response?.status === 201) {
        await cargarProveedores();
        toast.success(esEdicion ? "✅ Proveedor actualizado correctamente" : "✅ Proveedor creado exitosamente");
        return true;
      } else {
        toast.error("Error al guardar el proveedor");
        return false;
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      
      const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
      
      if (serverMessage) {
        if (serverMessage.toLowerCase().includes("nombre")) {
          setNombreError(serverMessage);
        } else if (serverMessage.toLowerCase().includes("nit")) {
          setNitError(serverMessage);
        } else if (serverMessage.toLowerCase().includes("tel")) {
          setTelefonoError(serverMessage);
        } else if (serverMessage.toLowerCase().includes("correo") || serverMessage.toLowerCase().includes("email")) {
          setCorreoError(serverMessage);
        } else {
          toast.warning(serverMessage);
        }
      } else {
        toast.error("Error de conexión con el servidor");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await deleteProveedor(id);
      if (response.status === 200) {
        toast.success("✅ Proveedor eliminado correctamente");
        await cargarProveedores();
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Error al eliminar el proveedor";
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async () => {
    if (!editData || estadoPendiente === null) return;
    
    setLoading(true);
    try {
      const response = await updateProveedor(editData.ProveedorId, {
        nombreProveedor: editData.NombreProveedor,
        nit: editData.Nit,
        telefono: editData.Telefono,
        correo: editData.Correo,
        direccion: editData.Direccion,
        estado: estadoPendiente ? 1 : 0
      });

      if (response.status === 200) {
        toast.success(`✅ Proveedor ${estadoPendiente ? 'activado' : 'inactivado'} correctamente`);
        await cargarProveedores();
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Error al cambiar estado: " + (error.message || error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES PARA LIMPIAR ESTADOS ==========
  const resetFormErrors = () => {
    setSubmitted(false);
    setNombreError('');
    setNitError('');
    setTelefonoError('');
    setCorreoError('');
    setDireccionError('');
    setNombreDuplicado(false);
    setNitDuplicado(false);
    setTelefonoDuplicado(false);
    setCorreoDuplicado(false);
  };

  const resetForm = () => {
    setFormData({ 
      nombreProveedor: "", 
      nit: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: 1
    });
    setEditData(null);
    resetFormErrors();
    
    // Limpiar timeouts
    Object.values(timeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
  };

  // ========== HANDLERS DE MODALES ==========
  const openCreateModal = () => {
    resetForm();
    setOpenCreate(true);
  };

  const openEditarModal = (proveedor) => {
    resetFormErrors();
    setEditData(proveedor);
    setFormData({
      nombreProveedor: proveedor.NombreProveedor || "",
      nit: proveedor.Nit || "",
      telefono: proveedor.Telefono || "",
      correo: proveedor.Correo || "",
      direccion: proveedor.Direccion || "",
      estado: Number(proveedor.Estado)
    });
    setOriginalNombre(proveedor.NombreProveedor);
    setOriginalNit(proveedor.Nit);
    setOriginalTelefono(proveedor.Telefono);
    setOriginalCorreo(proveedor.Correo);
    
    setOpenEditar(true);
  };

  const openVerModal = (proveedor) => {
    setEditData(proveedor);
    setOpenVer(true);
  };

  const openEliminarModal = (proveedor) => {
    setEditData(proveedor);
    setOpenEliminar(true);
  };

  const openConfirmarEstadoModal = (proveedor, nuevoEstado) => {
    setEditData(proveedor);
    setEstadoPendiente(nuevoEstado);
    setOpenConfirmarEstado(true);
  };

  const closeModals = () => {
    setOpenCreate(false);
    setOpenEditar(false);
    setOpenVer(false);
    setOpenEliminar(false);
    setOpenConfirmarEstado(false);
    setEstadoPendiente(null);
    resetForm();
  };

  return {
    // Datos
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
    estadoActivos,
    
    // Estados de UI
    loading,
    openCreate,
    openEditar,
    openVer,
    openEliminar,
    openConfirmarEstado,
    estadoPendiente,
    
    // Estados de error y validación
    submitted,
    nombreError,
    nitError,
    telefonoError,
    correoError,
    direccionError,
    nombreDuplicado,
    nitDuplicado,
    telefonoDuplicado,
    correoDuplicado,
    verificandoNombre,
    verificandoNit,
    verificandoTelefono,
    verificandoCorreo,
    originalNombre,
    originalNit,
    originalTelefono,
    originalCorreo,
    
    // Setters
    setCurrentPage,
    setItemsPerPage,
    setFormData,
    setEditData,
    setFiltroCampo,
    setFiltroValor,
    setSubmitted,
    setNombreError,
    setNitError,
    setTelefonoError,
    setCorreoError,
    setDireccionError,
    
    // Funciones principales
    cargarProveedores,
    cargarTodosLosProveedores,
    handleSubmit,
    handleDelete,
    handleToggleEstado,
    
    // Funciones de validación
    verificarNombreDuplicado,
    verificarNitDuplicado,
    verificarTelefonoDuplicado,
    verificarCorreoDuplicado,
    
    // Funciones de utilidad
    resetFormErrors,
    resetForm,
    
    // Handlers de modales
    openCreateModal,
    openEditarModal,
    openVerModal,
    openEliminarModal,
    openConfirmarEstadoModal,
    closeModals
  };
};