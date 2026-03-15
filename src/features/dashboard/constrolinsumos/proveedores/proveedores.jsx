import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "../../components/modals/modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProveedoresPaginated,
  buscarProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "./services/services.proveedores";
import { Pagination } from "../../components/paginacion/pagination";

// Función auxiliar para obtener las primeras 3 letras o dígitos
const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [estadoActivos, setEstadoActivo] = useState({});
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [campoFiltro, setCampoFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Estados para errores
  const [errorNombre, setErrorNombre] = useState("");
  const [errorNit, setErrorNit] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorDireccion, setErrorDireccion] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  // Estados para PAGINACIÓN
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  // Función para obtener proveedores con paginación
  const fetchProveedores = async () => {
    try {
      let resultado;

      // Si hay filtros activos, usa búsqueda paginada
      if (campoFiltro && busqueda.trim()) {
        resultado = await buscarProveedores(campoFiltro, busqueda, currentPage, itemsPerPage);
      } else {
        // Si no hay filtros, usa paginación normal
        resultado = await getProveedoresPaginated(currentPage, itemsPerPage);
      }

      const { data, pagination } = resultado;
      setPaginatedData(data);
      setProveedores(data); // Para mantener compatibilidad con otras funciones
      setTotalItems(pagination.totalItems);
      setTotalPages(pagination.totalPages);

      // Inicializar estados de los checkboxes
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
    }
  };

  // Efecto para resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [campoFiltro, busqueda]);

  // Efecto principal para cargar datos
  useEffect(() => {
    fetchProveedores();
  }, [currentPage, itemsPerPage, campoFiltro, busqueda]);

  // Resetear formulario de creación
  const resetCreateForm = () => {
    setFormCrear({
      nombreProveedor: "",
      nit: "",
      telefono: "",
      correo: "",
      direccion: "",
      estado: 1
    });
    setErrorNombre("");
    setErrorNit("");
    setErrorTelefono("");
    setErrorCorreo("");
    setErrorDireccion("");
  };

  // Validar nombre
  const validarNombre = (nombre) => {
    if (!nombre || !nombre.trim()) {
      return "El nombre es obligatorio";
    }
    if (nombre.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    if (nombre.trim().length > 100) {
      return "El nombre no puede exceder 100 caracteres";
    }
    return "";
  };

  // Validar NIT con formato específico
  const validarNit = (nit) => {
    if (!nit || !nit.trim()) {
      return ""; // NIT es opcional
    }

    // Eliminar espacios y convertir a string
    const nitLimpio = nit.trim();

    // Validar que empiece con 3
    if (!nitLimpio.startsWith('3')) {
      return "El NIT debe comenzar con el número 3";
    }

    // Validar longitud mínima (8 dígitos sin guiones)
    const soloNumeros = nitLimpio.replace(/-/g, '');
    if (soloNumeros.length < 8) {
      return "El NIT debe tener al menos 8 dígitos";
    }

    if (soloNumeros.length > 11) {
      return "El NIT no puede tener más de 11 dígitos";
    }

    // Validar formato: puede tener guiones opcionales pero solo números
    const nitRegex = /^3[0-9-]{7,}$/;
    if (!nitRegex.test(nitLimpio)) {
      return "El NIT solo puede contener números y guiones";
    }

    // Validar que no haya guiones consecutivos o al inicio/final
    if (nitLimpio.startsWith('-') || nitLimpio.endsWith('-') || nitLimpio.includes('--')) {
      return "Formato de NIT inválido (guiones mal ubicados)";
    }

    return "";
  };

  // Validar teléfono
  const validarTelefono = (telefono) => {
    if (!telefono) {
      return "El teléfono es obligatorio";
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefono)) {
      return "10 dígitos";
    }
    return "";
  };

  // Validar correo
  const validarCorreo = (correo) => {
    if (!correo) {
      return "El correo electrónico es obligatorio";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return "Formato de correo inválido";
    }
    return "";
  };

  // Validar dirección
  const validarDireccion = (direccion) => {
    if (!direccion || !direccion.trim()) {
      return "La dirección es obligatoria";
    }
    if (direccion.trim().length < 5) {
      return "La dirección debe tener al menos 5 caracteres";
    }
    return "";
  };

  // Crear proveedor
  const handleCreate = async () => {
    // Validaciones
    const nombreError = validarNombre(formCrear.nombreProveedor);
    const nitError = validarNit(formCrear.nit);
    const telefonoError = validarTelefono(formCrear.telefono);
    const correoError = validarCorreo(formCrear.correo);
    const direccionError = validarDireccion(formCrear.direccion);

    setErrorNombre(nombreError);
    setErrorNit(nitError);
    setErrorTelefono(telefonoError);
    setErrorCorreo(correoError);
    setErrorDireccion(direccionError);

    if (nombreError || nitError || telefonoError || correoError || direccionError) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

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
      toast.success(" Proveedor creado exitosamente");
      setOpenCreate(false);
      resetCreateForm();
      await fetchProveedores(); // Recargar con paginación
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      if (err.response && err.response.status === 400) {
        const backendErrors = err.response.data.details || [];
        toast.error(backendErrors[0] || "Error al crear proveedor");
      } else {
        toast.error(err.response?.data?.error || err.message || "Error al crear proveedor");
      }
    }
  };

  // Editar proveedor
  const handleUpdate = async () => {
    if (!selectedProveedor) {
      toast.error("No se seleccionó ningún proveedor para editar");
      return;
    }

    const nombreError = validarNombre(formEditar.nombreProveedor);
    const nitError = validarNit(formEditar.nit);
    const telefonoError = validarTelefono(formEditar.telefono);
    const correoError = validarCorreo(formEditar.correo);
    const direccionError = validarDireccion(formEditar.direccion);

    setErrorNombre(nombreError);
    setErrorNit(nitError);
    setErrorTelefono(telefonoError);
    setErrorCorreo(correoError);
    setErrorDireccion(direccionError);

    if (nombreError || nitError || telefonoError || correoError || direccionError) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

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
      toast.success(" Proveedor actualizado correctamente");
      await fetchProveedores(); // Recargar con paginación
      setOpenEditar(false);
      setSelectedProveedor(null);
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      toast.error(error.response?.data?.error || error.message || "Error al actualizar el proveedor");
    }
  };

  // Eliminar proveedor
  const handleDelete = async () => {
    if (!selectedProveedor) {
      toast.error("No se seleccionó ningún proveedor para eliminar");
      return;
    }

    try {
      await deleteProveedor(selectedProveedor.ProveedorId);
      toast.success(" Proveedor eliminado correctamente");
      await fetchProveedores(); // Recargar con paginación
      setOpenEliminar(false);
      setSelectedProveedor(null);
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      toast.error(err.response?.data?.error || err.message || "Error al eliminar el proveedor");
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
    setOpenEditar(true);
  };

  // Cambiar estado
  const toggleEstado = async (idProveedor, estadoNuevoBoolean) => {
    const nuevoEstadoNum = estadoNuevoBoolean ? 1 : 0;
    const provActual = proveedores.find(p => p.ProveedorId === idProveedor);
    if (!provActual) {
      toast.error("Proveedor no encontrado");
      return;
    }

    try {
      await updateProveedor(idProveedor, {
        nombreProveedor: provActual.NombreProveedor,
        nit: provActual.Nit,
        telefono: provActual.Telefono,
        correo: provActual.Correo,
        direccion: provActual.Direccion,
        estado: nuevoEstadoNum
      });

      // Actualizar estado local
      setEstadoActivo((prev) => ({ ...prev, [idProveedor]: nuevoEstadoNum }));
      setProveedores((prev) =>
        prev.map((p) =>
          p.ProveedorId === idProveedor ? { ...p, Estado: nuevoEstadoNum } : p
        )
      );

      // También actualizar en paginatedData
      setPaginatedData((prev) =>
        prev.map((p) =>
          p.ProveedorId === idProveedor ? { ...p, Estado: nuevoEstadoNum } : p
        )
      );

      toast.success(" Estado actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar estado: " + (error.message || error));
    }
  };

  // Funciones de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-6">
            Gestión de proveedores
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <button
                onClick={() => {
                  resetCreateForm();
                  setOpenCreate(true);
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm sm:text-base"
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

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      ID
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-left">
                      Nombre
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      NIT
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      Teléfono
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      Correo
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      Estado
                    </th>
                    <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length > 0 ? (
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
                                onChange={(e) => toggleEstado(p.ProveedorId, e.target.checked)}
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

            {/* PAGINACIÓN */}
            {totalItems > 0 && (
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
          {/* Crear - Con mejor distribución */}
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
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorNombre ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormCrear({ ...formCrear, nombreProveedor: valor });
                          setErrorNombre(validarNombre(valor));
                        }}
                        onBlur={(e) => {
                          setErrorNombre(validarNombre(e.target.value));
                        }}
                      />
                      {errorNombre && (
                        <span className="text-red-500 text-xs mt-1">{errorNombre}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">NIT (Opcional)</label>
                      <input
                        placeholder="Contener 8 digitos"
                        value={formCrear.nit}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorNit ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormCrear({ ...formCrear, nit: valor });
                          setErrorNit(validarNit(valor));
                        }}
                        onBlur={(e) => {
                          setErrorNit(validarNit(e.target.value));
                        }}
                        maxLength={15}
                      />
                      {errorNit && (
                        <span className="text-red-500 text-xs mt-1">{errorNit}</span>
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
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorTelefono ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/\D/g, "");
                          setFormCrear({ ...formCrear, telefono: valor });
                          setErrorTelefono(validarTelefono(valor));
                        }}
                        onBlur={(e) => {
                          setErrorTelefono(validarTelefono(e.target.value));
                        }}
                        maxLength={10}
                      />
                      {errorTelefono && (
                        <span className="text-red-500 text-xs mt-1">{errorTelefono}</span>
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
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorCorreo ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormCrear({ ...formCrear, correo: valor });
                          setErrorCorreo(validarCorreo(valor));
                        }}
                        onBlur={(e) => {
                          setErrorCorreo(validarCorreo(e.target.value));
                        }}
                      />
                      {errorCorreo && (
                        <span className="text-red-500 text-xs mt-1">{errorCorreo}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="Ingrese dirección completa"
                        value={formCrear.direccion}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorDireccion ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormCrear({ ...formCrear, direccion: valor });
                          setErrorDireccion(validarDireccion(valor));
                        }}
                        onBlur={(e) => {
                          setErrorDireccion(validarDireccion(e.target.value));
                        }}
                      />
                      {errorDireccion && (
                        <span className="text-red-500 text-xs mt-1">{errorDireccion}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                      Crear proveedor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCreate(false);
                        resetCreateForm();
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Modal>

          {/* Editar - Con mejor distribución */}
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
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Nombre del proveedor <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="Nombre del proveedor"
                        value={formEditar.nombreProveedor}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorNombre ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormEditar({ ...formEditar, nombreProveedor: valor });
                          setErrorNombre(validarNombre(valor));
                        }}
                        onBlur={(e) => {
                          setErrorNombre(validarNombre(e.target.value));
                        }}
                      />
                      {errorNombre && (
                        <span className="text-red-500 text-xs mt-1">{errorNombre}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">NIT (Opcional)</label>
                      <input
                        placeholder="Ej: 312345678-9 (debe empezar con 3)"
                        value={formEditar.nit}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorNit ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormEditar({ ...formEditar, nit: valor });
                          setErrorNit(validarNit(valor));
                        }}
                        onBlur={(e) => {
                          setErrorNit(validarNit(e.target.value));
                        }}
                        maxLength={15}
                      />
                      {errorNit && (
                        <span className="text-red-500 text-xs mt-1">{errorNit}</span>
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
                        value={formEditar.telefono}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorTelefono ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value.replace(/\D/g, "");
                          setFormEditar({ ...formEditar, telefono: valor });
                          setErrorTelefono(validarTelefono(valor));
                        }}
                        onBlur={(e) => {
                          setErrorTelefono(validarTelefono(e.target.value));
                        }}
                        maxLength={10}
                      />
                      {errorTelefono && (
                        <span className="text-red-500 text-xs mt-1">{errorTelefono}</span>
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
                        value={formEditar.correo}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorCorreo ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormEditar({ ...formEditar, correo: valor });
                          setErrorCorreo(validarCorreo(valor));
                        }}
                        onBlur={(e) => {
                          setErrorCorreo(validarCorreo(e.target.value));
                        }}
                      />
                      {errorCorreo && (
                        <span className="text-red-500 text-xs mt-1">{errorCorreo}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-700">
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        placeholder="Ingrese dirección completa"
                        value={formEditar.direccion}
                        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errorDireccion ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"
                          }`}
                        onChange={(e) => {
                          const valor = e.target.value;
                          setFormEditar({ ...formEditar, direccion: valor });
                          setErrorDireccion(validarDireccion(valor));
                        }}
                        onBlur={(e) => {
                          setErrorDireccion(validarDireccion(e.target.value));
                        }}
                      />
                      {errorDireccion && (
                        <span className="text-red-500 text-xs mt-1">{errorDireccion}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Guardar cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpenEditar(false);
                        setSelectedProveedor(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Modal>

          {/* Ver - Distribución en 4 filas de 2 columnas */}
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
                  {/* Columna izquierda */}
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
                      <label className="mb-1 text-sm font-medium text-gray-600">Teléfono</label>
                      <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
                        {selectedProveedor.Telefono}
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-600">Nombre del proveedor</label>
                      <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center text-gray-700">
                        {selectedProveedor.NombreProveedor}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-1 text-sm font-medium text-gray-600">Correo electrónico</label>
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

                  {/* Estado ocupa ambas columnas */}
                  <div className="flex flex-col md:col-span-2">
                    <label className="mb-1 text-sm font-medium text-gray-600">Estado</label>
                    <div className="w-full h-11 px-4 border border-gray-300 rounded-lg bg-gray-100 flex items-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${Number(selectedProveedor.Estado) === 1
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

          {/* Eliminar - Estilo adaptado de la imagen */}
          <Modal open={openEliminar} onClose={() => {
            setOpenEliminar(false);
            setSelectedProveedor(null);
          }}>
            <div className="w-full max-w-md p-6 mx-auto text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                ¿Eliminar proveedor?
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                El proveedor <span className="font-semibold">{selectedProveedor?.NombreProveedor}</span> será eliminado permanentemente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setOpenEliminar(false);
                    setSelectedProveedor(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        </div>
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