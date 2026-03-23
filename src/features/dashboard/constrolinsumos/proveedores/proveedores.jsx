import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import Modal from "../proveedores/components/Modals/modal";
import { ConfirmModal } from "../proveedores/components/Modals/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProveedoresPaginated,
  buscarProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  validarCampoUnico
} from "../proveedores/services/services.proveedores";
import { Pagination } from "../../components/paginacion/pagination";

// ========== UTILIDADES ==========
const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

// Custom hook para debounce MÁS RÁPIDO (200ms en vez de 500ms)
const useDebounce = (value, delay = 200) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ========== FUNCIONES DE VALIDACIÓN ==========
const validaciones = {
  nombreProveedor: (nombre) => {
    if (!nombre || !nombre.trim()) return "El nombre es obligatorio";
    if (nombre.trim().length < 2) return "Mínimo 2 caracteres";
    if (nombre.trim().length > 100) return "Máximo 100 caracteres";
    return "";
  },
  nit: (nit) => {
    if (!nit || !nit.trim()) return "";
    const nitLimpio = nit.trim();
    if (!nitLimpio.startsWith('3')) return "Debe comenzar con 3";
    const soloNumeros = nitLimpio.replace(/-/g, '');
    if (soloNumeros.length < 8) return "Mínimo 8 dígitos";
    if (soloNumeros.length > 11) return "Máximo 11 dígitos";
    const nitRegex = /^3[0-9-]{7,}$/;
    if (!nitRegex.test(nitLimpio)) return "Solo números y guiones";
    if (nitLimpio.startsWith('-') || nitLimpio.endsWith('-') || nitLimpio.includes('--')) {
      return "Guiones mal ubicados";
    }
    return "";
  },
  telefono: (telefono) => {
    if (!telefono) return "El teléfono es obligatorio";
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefono)) return "10 dígitos requeridos";
    return "";
  },
  correo: (correo) => {
    if (!correo) return "El correo es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) return "Formato inválido";
    return "";
  },
  direccion: (direccion) => {
    if (!direccion || !direccion.trim()) return "La dirección es obligatoria";
    if (direccion.trim().length < 5) return "Mínimo 5 caracteres";
    return "";
  }
};

// ========== COMPONENTE PRINCIPAL ==========
export const Proveedores = () => {
  // Estados de datos
  const [proveedores, setProveedores] = useState([]);
  const [estadoActivos, setEstadoActivo] = useState({});
  const [selectedProveedor, setSelectedProveedor] = useState(null);

  // Estados de filtros
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Estados de validación
  const [validacionesEstado, setValidacionesEstado] = useState({
    nombreProveedor: { valido: true, mensaje: '', verificando: false },
    nit: { valido: true, mensaje: '', verificando: false },
    correo: { valido: true, mensaje: '', verificando: false },
    telefono: { valido: true, mensaje: '' },
    direccion: { valido: true, mensaje: '' }
  });

  // Estados de modales
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [openConfirmarEstado, setOpenConfirmarEstado] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true); // Nuevo estado para el loading de la tabla

  // Estados de paginación
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados de formularios
  const [formCrear, setFormCrear] = useState({
    nombreProveedor: "",
    nit: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: 1,
  });

  const [formEditar, setFormEditar] = useState({
    nombreProveedor: "",
    nit: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: 1,
  });

  // Refs para controlar llamadas duplicadas
  const ultimaValidacionNombre = useRef('');
  const ultimaValidacionCorreo = useRef('');

  // Valores debounce para validación contra backend (200ms - MÁS RÁPIDO)
  const debouncedNombreCrear = useDebounce(formCrear.nombreProveedor, 200);
  const debouncedCorreoCrear = useDebounce(formCrear.correo, 200);
  const debouncedNombreEditar = useDebounce(formEditar.nombreProveedor, 200);
  const debouncedCorreoEditar = useDebounce(formEditar.correo, 200);

  // ========== VALIDACIÓN EN TIEMPO REAL CONTRA BACKEND ==========
  const validarCampoUnicoBackend = useCallback(async (campo, valor, excludeId = null) => {
    // Evitar llamadas duplicadas para el mismo valor
    const refKey = campo === 'nombreProveedor' ? 'ultimaValidacionNombre' : 'ultimaValidacionCorreo';
    if (valor === (campo === 'nombreProveedor' ? ultimaValidacionNombre.current : ultimaValidacionCorreo.current)) {
      return;
    }

    if (!valor || valor.trim() === '') {
      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: { ...prev[campo], verificando: false, mensaje: '', valido: true }
      }));
      return;
    }

    setValidacionesEstado(prev => ({
      ...prev,
      [campo]: { ...prev[campo], verificando: true }
    }));

    try {
      const resultado = await validarCampoUnico(campo, valor, excludeId);
      
      // Actualizar el ref para evitar llamadas duplicadas
      if (campo === 'nombreProveedor') {
        ultimaValidacionNombre.current = valor;
      } else {
        ultimaValidacionCorreo.current = valor;
      }

      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: {
          valido: !resultado.existe,
          mensaje: resultado.existe ? `Ya existe un proveedor con este ${campo}` : '',
          verificando: false
        }
      }));
    } catch (error) {
      console.error(`Error validando ${campo}:`, error);
      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: { ...prev[campo], verificando: false }
      }));
    }
  }, []);

  // Efectos para validación contra backend (Crear) - Se ejecutan CADA 200ms
  useEffect(() => {
    if (openCreate && debouncedNombreCrear.trim()) {
      validarCampoUnicoBackend('nombreProveedor', debouncedNombreCrear, null);
    }
  }, [debouncedNombreCrear, openCreate, validarCampoUnicoBackend]);

  useEffect(() => {
    if (openCreate && debouncedCorreoCrear.trim()) {
      validarCampoUnicoBackend('correo', debouncedCorreoCrear, null);
    }
  }, [debouncedCorreoCrear, openCreate, validarCampoUnicoBackend]);

  // Efectos para validación contra backend (Editar)
  useEffect(() => {
    if (openEditar && debouncedNombreEditar.trim() && selectedProveedor) {
      validarCampoUnicoBackend('nombreProveedor', debouncedNombreEditar, selectedProveedor.ProveedorId);
    }
  }, [debouncedNombreEditar, openEditar, selectedProveedor, validarCampoUnicoBackend]);

  useEffect(() => {
    if (openEditar && debouncedCorreoEditar.trim() && selectedProveedor) {
      validarCampoUnicoBackend('correo', debouncedCorreoEditar, selectedProveedor.ProveedorId);
    }
  }, [debouncedCorreoEditar, openEditar, selectedProveedor, validarCampoUnicoBackend]);

  // ========== FUNCIONES DE DATOS ==========
  const fetchProveedores = async () => {
    setCargandoDatos(true); // Activar loading antes de cargar
    try {
      let resultado;
      if (campoFiltro && busqueda.trim()) {
        resultado = await buscarProveedores(campoFiltro, busqueda, currentPage, itemsPerPage);
      } else {
        resultado = await getProveedoresPaginated(currentPage, itemsPerPage);
      }

      const { data, pagination } = resultado;
      setPaginatedData(data);
      setProveedores(data);
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);

      const estados = {};
      data.forEach((p) => {
        estados[p.ProveedorId] = Number(p.Estado);
      });
      setEstadoActivo(estados);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      toast.error("Error al obtener proveedores");
      setPaginatedData([]);
      setProveedores([]);
    } finally {
      setCargandoDatos(false); // Desactivar loading después de cargar
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [campoFiltro, busqueda]);

  useEffect(() => {
    fetchProveedores();
  }, [currentPage, itemsPerPage, campoFiltro, busqueda]);

  // ========== HANDLERS DE FORMULARIO ==========
  const resetCreateForm = () => {
    setFormCrear({
      nombreProveedor: "",
      nit: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: 1
    });
    setValidacionesEstado({
      nombreProveedor: { valido: true, mensaje: '', verificando: false },
      nit: { valido: true, mensaje: '', verificando: false },
      correo: { valido: true, mensaje: '', verificando: false },
      telefono: { valido: true, mensaje: '' },
      direccion: { valido: true, mensaje: '' }
    });
    ultimaValidacionNombre.current = '';
    ultimaValidacionCorreo.current = '';
  };

  // Validación local INMEDIATA mientras escribes
  const validarCampoLocal = (campo, valor) => {
    const error = validaciones[campo] ? validaciones[campo](valor) : '';
    setValidacionesEstado(prev => ({
      ...prev,
      [campo]: { 
        ...prev[campo], 
        mensaje: error, 
        valido: !error
        // NO tocamos verificando aquí para mantener el estado del backend
      }
    }));
  };

  const handleCreate = async () => {
    // Validar todos los campos
    Object.keys(validaciones).forEach(campo => {
      validarCampoLocal(campo, formCrear[campo]);
    });

    // Verificar si hay errores
    const hayErrores = Object.values(validacionesEstado).some(v => !v.valido && !v.verificando);
    
    if (hayErrores || !validacionesEstado.nombreProveedor.valido || !validacionesEstado.correo.valido) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);
    try {
      const proveedorData = {
        nombreProveedor: formCrear.nombreProveedor.trim(),
        nit: formCrear.nit ? formCrear.nit.trim() : null,
        telefono: formCrear.telefono,
        correo: formCrear.correo.trim(),
        direccion: formCrear.direccion.trim(),
        estado: formCrear.estado
      };

      await createProveedor(proveedorData);
      toast.success("✓ Proveedor creado exitosamente");
      setOpenCreate(false);
      resetCreateForm();
      await fetchProveedores();
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      if (err.response && err.response.status === 409) {
        const { error, campo } = err.response.data;
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: { valido: false, mensaje: error, verificando: false }
        }));
        toast.error(error);
      } else {
        toast.error(err.response?.data?.error || err.message || "Error al crear proveedor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProveedor) {
      toast.error("No se seleccionó ningún proveedor para editar");
      return;
    }

    // Validar todos los campos
    Object.keys(validaciones).forEach(campo => {
      validarCampoLocal(campo, formEditar[campo]);
    });

    const hayErrores = Object.values(validacionesEstado).some(v => !v.valido && !v.verificando);
    
    if (hayErrores || !validacionesEstado.nombreProveedor.valido || !validacionesEstado.correo.valido) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);
    try {
      const proveedorData = {
        nombreProveedor: formEditar.nombreProveedor.trim(),
        nit: formEditar.nit ? formEditar.nit.trim() : null,
        telefono: formEditar.telefono,
        correo: formEditar.correo.trim(),
        direccion: formEditar.direccion.trim(),
        estado: formEditar.estado
      };

      await updateProveedor(selectedProveedor.ProveedorId, proveedorData);
      toast.success("✓ Proveedor actualizado correctamente");
      await fetchProveedores();
      setOpenEditar(false);
      setSelectedProveedor(null);
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      if (error.response && error.response.status === 409) {
        const { error: errorMsg, campo } = error.response.data;
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: { valido: false, mensaje: errorMsg, verificando: false }
        }));
        toast.error(errorMsg);
      } else {
        toast.error(error.response?.data?.error || error.message || "Error al actualizar el proveedor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProveedor) {
      toast.error("No se seleccionó ningún proveedor para eliminar");
      return;
    }

    setIsLoading(true);
    try {
      await deleteProveedor(selectedProveedor.ProveedorId);
      toast.success("✓ Proveedor eliminado correctamente");
      await fetchProveedores();
      setOpenEliminar(false);
      setSelectedProveedor(null);
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      toast.error(err.response?.data?.error || err.message || "Error al eliminar el proveedor");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditarModal = (item) => {
    setSelectedProveedor(item);
    setFormEditar({
      nombreProveedor: item.NombreProveedor || "",
      nit: item.Nit || "",
      telefono: item.Telefono || "",
      correo: item.Correo || "",
      direccion: item.Direccion || "",
      estado: Number(item.Estado) === 1 ? 1 : 0,
    });
    setValidacionesEstado({
      nombreProveedor: { valido: true, mensaje: '', verificando: false },
      nit: { valido: true, mensaje: '', verificando: false },
      correo: { valido: true, mensaje: '', verificando: false },
      telefono: { valido: true, mensaje: '' },
      direccion: { valido: true, mensaje: '' }
    });
    ultimaValidacionNombre.current = '';
    ultimaValidacionCorreo.current = '';
    setOpenEditar(true);
  };

  // Manejo de cambio de estado con confirmación
  const handleToggleEstadoClick = (idProveedor, estadoActual) => {
    const provActual = proveedores.find(p => p.ProveedorId === idProveedor);
    if (!provActual) {
      toast.error("Proveedor no encontrado");
      return;
    }

    setEstadoPendiente({
      id: idProveedor,
      nuevoEstado: estadoActual === 1 ? 0 : 1,
      nombre: provActual.NombreProveedor
    });
    setOpenConfirmarEstado(true);
  };

  const handleConfirmarCambioEstado = async () => {
    if (!estadoPendiente) return;

    setIsLoading(true);
    try {
      const provActual = proveedores.find(p => p.ProveedorId === estadoPendiente.id);
      
      await updateProveedor(estadoPendiente.id, {
        nombreProveedor: provActual.NombreProveedor,
        nit: provActual.Nit,
        telefono: provActual.Telefono,
        correo: provActual.Correo,
        direccion: provActual.Direccion,
        estado: estadoPendiente.nuevoEstado
      });

      setEstadoActivo((prev) => ({ ...prev, [estadoPendiente.id]: estadoPendiente.nuevoEstado }));
      setProveedores((prev) =>
        prev.map((p) =>
          p.ProveedorId === estadoPendiente.id ? { ...p, Estado: estadoPendiente.nuevoEstado } : p
        )
      );
      setPaginatedData((prev) =>
        prev.map((p) =>
          p.ProveedorId === estadoPendiente.id ? { ...p, Estado: estadoPendiente.nuevoEstado } : p
        )
      );

      toast.success(`✓ Proveedor ${estadoPendiente.nuevoEstado === 1 ? 'activado' : 'inactivado'} correctamente`);
      setOpenConfirmarEstado(false);
      setEstadoPendiente(null);
    } catch (error) {
      toast.error("Error al actualizar estado: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  // Paginación
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">
            Gestión de proveedores
          </h1>

          {/* Barra de herramientas */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <button
                onClick={() => {
                  resetCreateForm();
                  setOpenCreate(true);
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus size={18} /> Nuevo proveedor
              </button>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar proveedores..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-slate-300 rounded-lg pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={campoFiltro}
                  onChange={(e) => setCampoFiltro(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-sm sm:text-base"
                >
                  <option value="">Filtrar por campo</option>
                  <option value="ProveedorId">ID</option>
                  <option value="nombre">Nombre</option>
                  <option value="nit">NIT</option>
                  <option value="telefono">Teléfono</option>
                  <option value="correo">Correo</option>
                  <option value="direccion">Dirección</option>
                  <option value="estado">Estado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">ID</th>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-left">Nombre</th>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">NIT</th>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Teléfono</th>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Correo</th>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Estado</th>
                  <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cargandoDatos ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-slate-600 text-base font-medium">Cargando proveedores...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((p) => (
                    <tr key={p.ProveedorId} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle font-mono">
                        {getShortId(p.ProveedorId)}
                      </td>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 align-middle">
                        {p.NombreProveedor}
                      </td>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                        {p.Nit || '-'}
                      </td>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                        {p.Telefono}
                      </td>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                        {p.Correo}
                      </td>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                        <label className="inline-flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={estadoActivos[p.ProveedorId] === 1}
                              onChange={(e) => handleToggleEstadoClick(p.ProveedorId, estadoActivos[p.ProveedorId])}
                            />
                            <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-5"></div>
                          </div>
                          <span className="ml-2 text-xs text-slate-700">
                            {estadoActivos[p.ProveedorId] === 1 ? "Activo" : "Inactivo"}
                          </span>
                        </label>
                      </td>
                      <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-center align-middle">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => openEditarModal(p)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Editar"
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProveedor(p);
                              setOpenVer(true);
                            }}
                            className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                            title="Ver"
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProveedor(p);
                              setOpenEliminar(true);
                            }}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Eliminar"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 sm:py-6 text-center text-gray-500 text-sm sm:text-base">
                      No se encontraron proveedores
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {!cargandoDatos && totalItems > 0 && (
            <div className="px-6 py-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>

        {/* MODALES */}
        
        {/* Modal Crear */}
        <Modal open={openCreate} onClose={() => {
          setOpenCreate(false);
          resetCreateForm();
        }}>
          <div className="w-[95vw] max-w-[600px] p-6 mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Nuevo proveedor
            </h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Nombre del proveedor <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Ingrese nombre proveedor"
                      value={formCrear.nombreProveedor}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.nombreProveedor.mensaje || !validacionesEstado.nombreProveedor.valido
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormCrear({ ...formCrear, nombreProveedor: valor });
                        validarCampoLocal('nombreProveedor', valor);
                      }}
                    />
                    {validacionesEstado.nombreProveedor.verificando && (
                      <span className="text-blue-500 text-xs mt-1 flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verificando...
                      </span>
                    )}
                    {!validacionesEstado.nombreProveedor.verificando && validacionesEstado.nombreProveedor.mensaje && (
                      <span className={`text-xs mt-1 flex items-center gap-1 ${
                        validacionesEstado.nombreProveedor.valido ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {!validacionesEstado.nombreProveedor.valido && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {validacionesEstado.nombreProveedor.mensaje}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">NIT (Opcional)</label>
                    <input
                      placeholder="Contener 8 digitos"
                      value={formCrear.nit}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.nit.mensaje ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormCrear({ ...formCrear, nit: valor });
                        validarCampoLocal('nit', valor);
                      }}
                      maxLength={15}
                    />
                    {validacionesEstado.nit.mensaje && (
                      <span className="text-red-500 text-xs mt-1">{validacionesEstado.nit.mensaje}</span>
                    )}
                    <span className="text-gray-400 text-xs mt-1">
                      Mínimo 8 dígitos, máximo 11 dígitos (puede incluir guiones)
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Ej: 3001234567"
                      value={formCrear.telefono}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.telefono.mensaje ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, "");
                        setFormCrear({ ...formCrear, telefono: valor });
                        validarCampoLocal('telefono', valor);
                      }}
                      maxLength={10}
                    />
                    {validacionesEstado.telefono.mensaje && (
                      <span className="text-red-500 text-xs mt-1">{validacionesEstado.telefono.mensaje}</span>
                    )}
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="proveedor@ejemplo.com"
                      value={formCrear.correo}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.correo.mensaje || !validacionesEstado.correo.valido
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormCrear({ ...formCrear, correo: valor });
                        validarCampoLocal('correo', valor);
                      }}
                    />
                    {validacionesEstado.correo.verificando && (
                      <span className="text-blue-500 text-xs mt-1 flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verificando...
                      </span>
                    )}
                    {!validacionesEstado.correo.verificando && validacionesEstado.correo.mensaje && (
                      <span className={`text-xs mt-1 flex items-center gap-1 ${
                        validacionesEstado.correo.valido ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {!validacionesEstado.correo.valido && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {validacionesEstado.correo.mensaje}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Ingrese dirección completa"
                      value={formCrear.direccion}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.direccion.mensaje ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormCrear({ ...formCrear, direccion: valor });
                        validarCampoLocal('direccion', valor);
                      }}
                    />
                    {validacionesEstado.direccion.mensaje && (
                      <span className="text-red-500 text-xs mt-1">{validacionesEstado.direccion.mensaje}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creando...' : 'Crear proveedor'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenCreate(false);
                      resetCreateForm();
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal Editar */}
        <Modal open={openEditar} onClose={() => {
          setOpenEditar(false);
          setSelectedProveedor(null);
        }}>
          <div className="w-[95vw] max-w-[600px] p-6 mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Editar proveedor
            </h3>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Nombre del proveedor <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Nombre del proveedor"
                      value={formEditar.nombreProveedor}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.nombreProveedor.mensaje || !validacionesEstado.nombreProveedor.valido
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormEditar({ ...formEditar, nombreProveedor: valor });
                        validarCampoLocal('nombreProveedor', valor);
                      }}
                    />
                    {validacionesEstado.nombreProveedor.verificando && (
                      <span className="text-blue-500 text-xs mt-1">Verificando...</span>
                    )}
                    {!validacionesEstado.nombreProveedor.verificando && validacionesEstado.nombreProveedor.mensaje && (
                      <span className={`text-xs mt-1 ${validacionesEstado.nombreProveedor.valido ? 'text-green-600' : 'text-red-500'}`}>
                        {validacionesEstado.nombreProveedor.mensaje}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">NIT (Opcional)</label>
                    <input
                      placeholder="Ej: 312345678-9"
                      value={formEditar.nit}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.nit.mensaje ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormEditar({ ...formEditar, nit: valor });
                        validarCampoLocal('nit', valor);
                      }}
                      maxLength={15}
                    />
                    {validacionesEstado.nit.mensaje && (
                      <span className="text-red-500 text-xs mt-1">{validacionesEstado.nit.mensaje}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Ej: 3001234567"
                      value={formEditar.telefono}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.telefono.mensaje ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, "");
                        setFormEditar({ ...formEditar, telefono: valor });
                        validarCampoLocal('telefono', valor);
                      }}
                      maxLength={10}
                    />
                    {validacionesEstado.telefono.mensaje && (
                      <span className="text-red-500 text-xs mt-1">{validacionesEstado.telefono.mensaje}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="proveedor@ejemplo.com"
                      value={formEditar.correo}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.correo.mensaje || !validacionesEstado.correo.valido
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormEditar({ ...formEditar, correo: valor });
                        validarCampoLocal('correo', valor);
                      }}
                    />
                    {validacionesEstado.correo.verificando && (
                      <span className="text-blue-500 text-xs mt-1">Verificando...</span>
                    )}
                    {!validacionesEstado.correo.verificando && validacionesEstado.correo.mensaje && (
                      <span className={`text-xs mt-1 ${validacionesEstado.correo.valido ? 'text-green-600' : 'text-red-500'}`}>
                        {validacionesEstado.correo.mensaje}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Ingrese dirección completa"
                      value={formEditar.direccion}
                      className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
                        validacionesEstado.direccion.mensaje ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                      }`}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setFormEditar({ ...formEditar, direccion: valor });
                        validarCampoLocal('direccion', valor);
                      }}
                    />
                    {validacionesEstado.direccion.mensaje && (
                      <span className="text-red-500 text-xs mt-1">{validacionesEstado.direccion.mensaje}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenEditar(false);
                      setSelectedProveedor(null);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal Ver */}
        <Modal open={openVer} onClose={() => {
          setOpenVer(false);
          setSelectedProveedor(null);
        }}>
          <div className="w-[95vw] max-w-[600px] p-4 mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
              Detalles del proveedor
            </h3>
            {selectedProveedor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">ID</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700 font-mono">
                      {getShortId(selectedProveedor.ProveedorId)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">NIT</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
                      {selectedProveedor.Nit || '-'}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
                      {selectedProveedor.Telefono}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">Nombre</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
                      {selectedProveedor.NombreProveedor}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">Correo</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700 truncate">
                      {selectedProveedor.Correo}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-600">Dirección</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
                      {selectedProveedor.Direccion}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="mb-1 text-sm font-medium text-gray-600">Estado</label>
                  <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      Number(selectedProveedor.Estado) === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Number(selectedProveedor.Estado) === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="border-t pt-4 mt-4">
              <button
                onClick={() => {
                  setOpenVer(false);
                  setSelectedProveedor(null);
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Eliminar */}
        <ConfirmModal
          open={openEliminar}
          onClose={() => {
            setOpenEliminar(false);
            setSelectedProveedor(null);
          }}
          onConfirm={handleDelete}
          title="¿Eliminar proveedor?"
          message={`El proveedor "${selectedProveedor?.NombreProveedor}" será eliminado permanentemente.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
          isLoading={isLoading}
        />

        {/* Modal Confirmar Cambio de Estado */}
        <ConfirmModal
          open={openConfirmarEstado}
          onClose={() => {
            setOpenConfirmarEstado(false);
            setEstadoPendiente(null);
          }}
          onConfirm={handleConfirmarCambioEstado}
          title={`${estadoPendiente?.nuevoEstado === 1 ? 'Activar' : 'Inactivar'} proveedor?`}
          message={`El proveedor "${estadoPendiente?.nombre}" será ${estadoPendiente?.nuevoEstado === 1 ? 'activado' : 'inactivado'}.`}
          confirmText={estadoPendiente?.nuevoEstado === 1 ? 'Activar' : 'Inactivar'}
          cancelText="Cancelar"
          type={estadoPendiente?.nuevoEstado === 1 ? 'info' : 'warning'}
          isLoading={isLoading}
        />

      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Proveedores;