import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { GetDataUser, postDataUsers, updateDatauser, deleteDataUser, buscarUsuarios } from "../services/services.user";
import axios from "axios";
import { GetDataRoles } from "../../roles/services/services.role.js";

const API_URL = import.meta.env.VITE_API_URL;

export const useUsuarios = () => {
  // --- Estados principales ---
  const [values, setValues] = useState({
    CedulaId: "",
    TipoDocumentoId: "",
    NombreCompleto: "",
    Telefono: "",
    CorreoElectronico: "",
    Direccion: "",
    Contrasena: "",
    RoleId: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [cargandoDatosIniciales, setCargandoDatosIniciales] = useState(true);
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editData, setEditData] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [roles, setRoles] = useState([]);

  // --- Estados de validación ---
  const [correoError, setCorreoError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [cedulaFormatoError, setCedulaFormatoError] = useState("");
  const [telefonoFormatoError, setTelefonoFormatoError] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [originalCorreo, setOriginalCorreo] = useState("");
  const [originalCedula, setOriginalCedula] = useState("");
  const [originalTelefono, setOriginalTelefono] = useState("");

  // --- Funciones auxiliares de validación (se mantienen igual) ---
  const validateNombre = (nombre) => {
    if (!nombre) {
      setNombreError("");
      return true;
    }
    const nombreRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/;
    if (!nombreRegex.test(nombre)) {
      setNombreError("El nombre solo puede contener letras y espacios");
      return false;
    }
    setNombreError("");
    return true;
  };

  const validateCedulaFormat = (cedula) => {
    if (!cedula) {
      setCedulaFormatoError("");
      return;
    }
    if (cedula.length < 6 || cedula.length > 10) {
      setCedulaFormatoError("La cédula debe tener entre 6 y 10 dígitos");
      return;
    }
    if (cedula.startsWith('0')) {
      setCedulaFormatoError("La cédula no puede comenzar con 0");
      return;
    }
    setCedulaFormatoError("");
  };

  const validateTelefonoFormat = (telefono) => {
    if (!telefono) {
      setTelefonoFormatoError("");
      return;
    }
    if (telefono.length !== 10) {
      setTelefonoFormatoError("El teléfono debe tener 10 dígitos");
      return;
    }
    const codigosAreaValidos = ['3', '60', '4', '5', '6', '7', '8'];
    const codigoValido = codigosAreaValidos.some(codigo => telefono.startsWith(codigo));
    if (!codigoValido) {
      setTelefonoFormatoError("El teléfono debe comenzar con un código válido (3, 60, 4, 5, 6, 7, 8)");
      return;
    }
    setTelefonoFormatoError("");
  };

  // --- Manejadores de cambios en inputs ---
  const handleChanges = (e) => {
    const { name, value } = e.target;
    if (name === "CedulaId" || name === "Telefono") {
      const numericValue = value.replace(/[^0-9]/g, '');
      let maxLength = name === "CedulaId" ? 10 : 10;
      const limitedValue = numericValue.slice(0, maxLength);
      setValues({ ...values, [name]: limitedValue });
      if (name === "CedulaId") validateCedulaFormat(limitedValue);
      else validateTelefonoFormat(limitedValue);
    } else if (name === "NombreCompleto") {
      const nombreValue = value.replace(/[^A-Za-zÁáÉéÍíÓóÚúÑñ\s]/g, '');
      setValues({ ...values, [name]: nombreValue });
      validateNombre(nombreValue);
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  // --- Validaciones con el backend (blur) ---
  const handleCorreoBlur = async () => {
    if (values.CorreoElectronico === originalCorreo) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (values.CorreoElectronico && !emailRegex.test(values.CorreoElectronico)) {
      setCorreoError('Ingrese un correo electrónico válido');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/user/validar-correo`, {
        params: { correo: values.CorreoElectronico }
      });
      setCorreoError(response.data.exists ? 'Este correo ya está registrado' : '');
    } catch {
      setCorreoError('No se pudo validar el correo');
    }
  };

  const handleCedulaBlur = async () => {
    if (values.CedulaId === originalCedula) return;
    validateCedulaFormat(values.CedulaId);
    if (cedulaFormatoError) return;
    try {
      const response = await axios.get(`${API_URL}/user/validar-cedula`, {
        params: { cedula: values.CedulaId }
      });
      setCedulaError(response.data.exists ? 'Esta cédula ya está registrada' : '');
    } catch {
      setCedulaError('No se pudo validar la cédula');
    }
  };

  const handleTelefonoBlur = async () => {
    if (values.Telefono === originalTelefono) return;
    validateTelefonoFormat(values.Telefono);
    if (telefonoFormatoError) return;
    try {
      const response = await axios.get(`${API_URL}/user/validar-telefono`, {
        params: { telefono: values.Telefono }
      });
      setTelefonoError(response.data.exists ? 'Este teléfono ya está registrado' : '');
    } catch {
      setTelefonoError('No se pudo validar el teléfono');
    }
  };

  // --- Carga de datos iniciales (tipos, roles, usuarios) ---
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await axios.get(`${API_URL}/tipos-documento`);
        setTiposDocumento(response.data);
      } catch (error) {
        console.error("Error obteniendo tipos de documento:", error);
      }
    };
    fetchTiposDocumento();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await GetDataRoles();
        const activos = response.data.filter(
          (rol) => rol.Estado === "Activo" && rol.Nombre?.trim().toLowerCase() !== "cliente"
        );
        setRoles(activos);
      } catch (error) {
        console.error("Error al cargar roles:", error);
      } finally {
        setCargandoDatosIniciales(false);
      }
    };
    fetchRoles();
  }, []);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      let resultado;
      if (filtroCampo && filtroValor) {
        resultado = await buscarUsuarios(filtroCampo, filtroValor, currentPage, itemsPerPage);
      } else {
        resultado = await GetDataUser(currentPage, itemsPerPage);
      }
      const data = resultado?.data && Array.isArray(resultado.data) ? resultado.data : [];
      const pagination = resultado?.pagination || {};
      setPaginatedData([...data]);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);
      if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) {
        setCurrentPage(pagination.totalPages);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("Error al cargar los usuarios");
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setCargando(false);
    }
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios, refresh]);

  // --- Reset del formulario ---
  const resetForm = () => {
    setValues({
      CedulaId: "", TipoDocumentoId: "", NombreCompleto: "", Telefono: "",
      CorreoElectronico: "", Direccion: "", Contrasena: "", RoleId: ""
    });
    setEditData(null);
    setCedulaError("");
    setCorreoError("");
    setTelefonoError("");
    setCedulaFormatoError("");
    setTelefonoFormatoError("");
    setNombreError("");
    setSubmitted(false);
  };

  // --- Envío del formulario (crear/editar) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    validateCedulaFormat(values.CedulaId);
    validateTelefonoFormat(values.Telefono);
    validateNombre(values.NombreCompleto);

    const camposObligatorios = [
      "CedulaId", "TipoDocumentoId", "NombreCompleto",
      "Telefono", "CorreoElectronico", "Direccion", "RoleId"
    ];
    const camposVacios = camposObligatorios.filter(campo => !values[campo] || !values[campo].toString().trim());
    if (camposVacios.length > 0) {
      toast.warning(`Los siguientes campos son obligatorios: ${camposVacios.join(", ")}`);
      return;
    }
    if (values.CedulaId.length < 6 || values.CedulaId.length > 10) {
      toast.warning("La cédula debe tener entre 6 y 10 dígitos");
      return;
    }
    if (values.Telefono.length !== 10) {
      toast.warning("El teléfono debe tener exactamente 10 dígitos");
      return;
    }
    if (nombreError) {
      toast.warning("El nombre contiene caracteres no válidos");
      return;
    }
    if (correoError || cedulaError || telefonoError || cedulaFormatoError || telefonoFormatoError) {
      toast.warning("Corrige los errores antes de enviar");
      return;
    }

    setCargandoFormulario(true);
    try {
      if (editData) {
        // Edición
        try {
          const response = await updateDatauser(editData.CedulaId, values);
          if (response.status === 200) {
            toast.success("Usuario actualizado correctamente");
            setOpenEditar(false);
            setRefresh(prev => !prev);
            resetForm();
          } else {
            toast.error(response.data?.message || "Error al actualizar usuario");
          }
        } catch (error) {
          console.error("Error en actualización:", error);
          const errorMsg = error.response?.data?.message || "Error al actualizar el usuario";
          toast.error(errorMsg);
        }
      } else {
        // Creación
        const response = await postDataUsers(values);
        if (response?.status === 201) {
          toast.success("Usuario creado correctamente");
          await cargarUsuarios();
          setRefresh(prev => !prev);
          setOpenCreate(false);
          resetForm();
        } else {
          toast.error(response?.data?.message || "Error al crear el usuario");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al procesar la solicitud");
    } finally {
      setCargandoFormulario(false);
    }
  };

  // --- Eliminar usuario ---
  const handleDelete = async (id) => {
    setCargandoFormulario(true);
    try {
      const response = await deleteDataUser(id);
      if (response?.status === 200 || response?.status === 201) {
        toast.success(response.data?.message || "Usuario eliminado correctamente");
        await cargarUsuarios();
        setRefresh(prev => !prev);
        setOpenEliminar(false);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.warning(error.response.data?.message || "Este usuario no puede ser eliminado");
      } else if (error.response?.status === 409) {
        toast.warning(error.response.data?.message || "No se puede eliminar porque tiene pedidos asociados");
      } else {
        toast.error(error.response?.data?.message || "Error al eliminar el usuario");
      }
      if (error.response?.status === 200 || error.response?.status === 201) {
        setOpenEliminar(false);
      }
    } finally {
      setCargandoFormulario(false);
    }
  };

  // --- Handlers de paginación y modales ---
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEditClick = (u) => {
    setEditData(u);
    setValues({ ...u });
    setOriginalCorreo(u.CorreoElectronico);
    setOriginalCedula(u.CedulaId);
    setOriginalTelefono(u.Telefono);
    setCedulaError('');
    setCorreoError('');
    setTelefonoError('');
    setCedulaFormatoError('');
    setTelefonoFormatoError('');
    setNombreError('');
    setOpenEditar(true);
  };

  const handleViewClick = (u) => {
    setEditData(u);
    setValues({ ...u });
    setOpenVer(true);
  };

  const handleDeleteClick = (u) => {
    setEditData(u);
    setOpenEliminar(true);
  };

  // --- Valores que se expondrán al componente principal ---
  return {
    // estados
    values,
    submitted,
    cargando,
    cargandoFormulario,
    cargandoDatosIniciales,
    paginatedData,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    editData,
    openCreate,
    openEditar,
    openVer,
    openEliminar,
    filtroCampo,
    filtroValor,
    tiposDocumento,
    roles,
    // errores
    correoError,
    cedulaError,
    telefonoError,
    cedulaFormatoError,
    telefonoFormatoError,
    nombreError,
    // handlers
    setOpenCreate,
    setOpenEditar,
    setOpenVer,
    setOpenEliminar,
    setFiltroCampo,
    setFiltroValor,
    handleChanges,
    handleCorreoBlur,
    handleCedulaBlur,
    handleTelefonoBlur,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleEditClick,
    handleViewClick,
    handleDeleteClick,
    resetForm
  };
};