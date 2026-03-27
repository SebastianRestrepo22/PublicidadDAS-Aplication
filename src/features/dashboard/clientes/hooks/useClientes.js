import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getDataClients, postDataClients, updateDataClient, deleteDataClient, buscarClientes } from '../services/services.cliente.js';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useClientes = () => {
  // Estados principales
  const [values, setValues] = useState({
    CedulaId: "",
    TipoDocumentoId: "",
    NombreCompleto: "",
    Telefono: "",
    CorreoElectronico: "",
    Direccion: "",
    Contrasena: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [editData, setEditData] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Paginación
  const [paginatedData, setPaginatedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  // Tipos de documento
  const [tiposDocumento, setTiposDocumento] = useState([]);

  // Estados de validación
  const [correoError, setCorreoError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");
  const [cedulaFormatoError, setCedulaFormatoError] = useState("");
  const [telefonoFormatoError, setTelefonoFormatoError] = useState("");

  // Valores originales para validación en edición
  const [originalCorreo, setOriginalCorreo] = useState("");
  const [originalCedula, setOriginalCedula] = useState("");
  const [originalTelefono, setOriginalTelefono] = useState("");

  // Cargar tipos de documento
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

  // Cargar clientes
  const cargarClientes = useCallback(async () => {
    setCargando(true);
    try {
      let resultado;
      if (filtroCampo && filtroValor) {
        resultado = await buscarClientes(filtroCampo, filtroValor, currentPage, itemsPerPage);
      } else {
        resultado = await getDataClients(currentPage, itemsPerPage);
      }

      const data = resultado && resultado.data && Array.isArray(resultado.data) ? resultado.data : [];
      const pagination = resultado && resultado.pagination ? resultado.pagination : {};

      setPaginatedData(data);
      setTotalItems(pagination.totalItems || 0);
      setTotalPages(pagination.totalPages || 1);

      if (currentPage > (pagination.totalPages || 1) && (pagination.totalPages || 0) > 0) {
        setCurrentPage(pagination.totalPages);
      }
    } catch (error) {
      console.error("❌ Error cargando clientes:", error);
      toast.error("Error al cargar los clientes");
      setPaginatedData([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setCargando(false);
    }
  }, [currentPage, itemsPerPage, filtroCampo, filtroValor]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes, refresh]);

  // Validaciones de formato
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

  // Manejo de cambios en inputs
  const handleChanges = (e) => {
    const { name, value } = e.target;

    if (name === "CedulaId" || name === "Telefono") {
      const numericValue = value.replace(/[^0-9]/g, '');
      const maxLength = 10;
      const limitedValue = numericValue.slice(0, maxLength);
      setValues({ ...values, [name]: limitedValue });
      if (name === "CedulaId") {
        validateCedulaFormat(limitedValue);
      } else if (name === "Telefono") {
        validateTelefonoFormat(limitedValue);
      }
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  // Validaciones con backend (blur)
  const handleCorreoBlur = async () => {
    if (values.CorreoElectronico === originalCorreo) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (values.CorreoElectronico && !emailRegex.test(values.CorreoElectronico)) {
      setCorreoError('Ingrese un correo electrónico válido');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/user/validar-correo?correo=${values.CorreoElectronico}`);
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
      const response = await axios.get(`${API_URL}/user/validar-cedula?cedula=${values.CedulaId}`);
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
      const response = await axios.get(`${API_URL}/user/validar-telefono?telefono=${values.Telefono}`);
      setTelefonoError(response.data.exists ? 'Este teléfono ya está registrado' : '');
    } catch {
      setTelefonoError('No se pudo validar el teléfono');
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setValues({
      CedulaId: "",
      TipoDocumentoId: "",
      NombreCompleto: "",
      Telefono: "",
      CorreoElectronico: "",
      Direccion: "",
      Contrasena: "",
    });
    setEditData(null);
    setCedulaError("");
    setCorreoError("");
    setTelefonoError("");
    setCedulaFormatoError("");
    setTelefonoFormatoError("");
    setSubmitted(false);
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    validateCedulaFormat(values.CedulaId);
    validateTelefonoFormat(values.Telefono);

    const camposObligatorios = [
      "CedulaId", "TipoDocumentoId", "NombreCompleto",
      "Telefono", "CorreoElectronico", "Direccion"
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

    if (correoError || cedulaError || telefonoError || cedulaFormatoError || telefonoFormatoError) {
      toast.warning("Corrige los errores antes de enviar");
      return;
    }

    setCargandoFormulario(true);
    try {
      // Validar existencia en BD
      const [correoRes, cedulaRes, telefonoRes] = await Promise.all([
        axios.get(`${API_URL}/user/validar-correo?correo=${values.CorreoElectronico}`),
        axios.get(`${API_URL}/user/validar-cedula?cedula=${values.CedulaId}`),
        axios.get(`${API_URL}/user/validar-telefono?telefono=${values.Telefono}`)
      ]);

      if (!editData && correoRes.data.exists) {
        toast.warning("Este correo ya está registrado");
        setCargandoFormulario(false);
        return;
      }
      if (!editData && cedulaRes.data.exists) {
        toast.warning("Esta cédula ya está registrada");
        setCargandoFormulario(false);
        return;
      }
      if (!editData && telefonoRes.data.exists) {
        toast.warning("Este teléfono ya está registrado");
        setCargandoFormulario(false);
        return;
      }

      if (editData) {
        if (values.CorreoElectronico !== originalCorreo && correoRes.data.exists) {
          toast.warning("Este correo ya está registrado");
          setCargandoFormulario(false);
          return;
        }
        if (values.Telefono !== originalTelefono && telefonoRes.data.exists) {
          toast.warning("Este teléfono ya está registrado");
          setCargandoFormulario(false);
          return;
        }
      }
    } catch (error) {
      toast.error("Error validando datos");
      setCargandoFormulario(false);
      return;
    }

    try {
      if (editData) {
        const response = await updateDataClient(editData.CedulaId, values);
        if (response.status === 200) {
          toast.success("Cliente actualizado correctamente");
          setRefresh(prev => !prev);
          setOpenEditar(false);
          resetForm();
        }
      } else {
        const response = await postDataClients(values);
        if (response.status === 201) {
          toast.success("Cliente creado correctamente");
          setRefresh(prev => !prev);
          setOpenCreate(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al procesar la solicitud");
    } finally {
      setCargandoFormulario(false);
    }
  };

  // Eliminar cliente
  const handleDelete = async (id) => {
    setCargandoFormulario(true);
    try {
      const response = await deleteDataClient(id);
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        setRefresh(prev => !prev);
        setOpenEliminar(false);
      } else {
        toast.error(response.data?.message || "No se pudo eliminar el cliente");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.warning(error.response.data.message || "No se puede eliminar porque tiene pedidos asociados");
      } else {
        toast.error(error.response?.data?.message || "Error al eliminar el cliente");
      }
      if (error.response?.status !== 409) {
        setOpenEliminar(false);
      }
    } finally {
      setCargandoFormulario(false);
    }
  };

  // Handlers de paginación
  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  const handleLimpiarFiltros = () => {
    setFiltroCampo('');
    setFiltroValor('');
  };

  // Handlers de modales
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

  return {
    // Estados
    values,
    submitted,
    cargando,
    cargandoFormulario,
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
    correoError,
    cedulaError,
    telefonoError,
    cedulaFormatoError,
    telefonoFormatoError,

    // Setters
    setOpenCreate,
    setOpenEditar,
    setOpenVer,
    setOpenEliminar,
    setFiltroCampo,
    setFiltroValor,

    // Handlers
    handleChanges,
    handleCorreoBlur,
    handleCedulaBlur,
    handleTelefonoBlur,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleLimpiarFiltros,
    handleEditClick,
    handleViewClick,
    handleDeleteClick,
    resetForm,
  };
};