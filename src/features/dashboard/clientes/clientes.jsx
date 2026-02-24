import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import Modal from "../components/modals/modal.jsx";
import { getDataClients, postDataClients, updateDataClient, deleteDataClient } from './services/services.cliente.js';
import axios from "axios";

//importamos toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pagination } from "../components/paginacion/pagination.jsx";

export const Clientes = () => {
  const [user, setUser] = useState([]);
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

  //Paginación
  const [allData, setAllData] = useState([]); // TODOS LOS DATOS
  const [paginatedData, setPaginatedData] = useState([]); // DATOS PAGINADOS (USAR ESTE PARA RENDER)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // POR DEFECTO 5 REGISTROS
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [editData, setEditData] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  // FUNCIÓN PARA PAGINAR 
  const paginateData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  //Traer los tipos de documentos
  const [tiposDocumento, setTiposDocumento] = useState([]);
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await axios.get("http://localhost:3000/tipos-documento");
        setTiposDocumento(response.data); // response.data debe ser un array de { TipoDocumentoId, Nombre }
      } catch (error) {
        console.error("Error obteniendo tipos de documento:", error);
      }
    };
    fetchTiposDocumento();
  }, []);

  //Buscar clientes
  const [filtroCampo, setFiltroCampo] = useState('');
  const [filtroValor, setFiltroValor] = useState('');

  useEffect(() => {
    if (filtroCampo && filtroValor) {
      buscarUsuarios(filtroCampo, filtroValor).then(setUser);
    }
  }, [filtroCampo, filtroValor]);

  useEffect(() => {
    const buscar = async () => {
      if (filtroCampo && filtroValor) {
        const resultados = await buscarUsuarios(filtroCampo, filtroValor);
        setUser(resultados);
      }
    };
    buscar();
  }, [filtroCampo, filtroValor]);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        let resultados;
        if (filtroCampo && filtroValor) {
          resultados = await buscarUsuarios(filtroCampo, filtroValor);
        } else {
          const todos = await getDataClients();
          resultados = todos?.data || [];
        }
        // 1. Guardar todos los datos
        setAllData(Array.isArray(resultados) ? resultados : []);
        setTotalItems(Array.isArray(resultados) ? resultados.length : 0);

        // 2. Calcular total de páginas
        const totalPages = Math.ceil(resultados.length / itemsPerPage);
        setTotalPages(totalPages > 0 ? totalPages : 1);

        // 3. Ajustar página actual si es necesario
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }

        // 4. Paginar los datos
        const paginatedData = paginateData(Array.isArray(resultados) ? resultados : []);
        setPaginatedData(paginatedData);
      } catch (error) {
        console.error(error);
        setUser([]);
      }
    };
    cargarUsuarios();
  }, [filtroCampo, filtroValor]);

  // EFECTO PARA RECALCULAR PAGINACIÓN 
  useEffect(() => {
    if (allData.length > 0) {
      const totalPages = Math.ceil(allData.length / itemsPerPage);
      setTotalPages(totalPages > 0 ? totalPages : 1);

      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }

      const paginatedData = paginateData(allData);
      setPaginatedData(paginatedData);
    }
  }, [itemsPerPage, currentPage, allData]);

  const [correoError, setCorreoError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");

  // Nuevos estados para validaciones de formato
  const [cedulaFormatoError, setCedulaFormatoError] = useState("");
  const [telefonoFormatoError, setTelefonoFormatoError] = useState("");

  // Obtener clientes al cargar
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getDataClients();
      if (data?.data) setUser(data.data);
    };
    fetchUsers();
  }, []);

  // Manejo de cambios en inputs con validación de solo números
  const handleChanges = (e) => {
    const { name, value } = e.target;

    // Validación para campos numéricos (Cédula y Teléfono)
    if (name === "CedulaId" || name === "Telefono") {
      // Solo permitir números
      const numericValue = value.replace(/[^0-9]/g, '');

      // Validar longitud máxima según el campo
      let maxLength = 0;
      if (name === "CedulaId") {
        maxLength = 10; // Cédula colombiana: 6-10 dígitos
      } else if (name === "Telefono") {
        maxLength = 10; // Teléfono colombiano: 10 dígitos
      }

      // Limitar longitud
      const limitedValue = numericValue.slice(0, maxLength);

      setValues({ ...values, [name]: limitedValue });

      // Validación de formato en tiempo real
      if (name === "CedulaId") {
        validateCedulaFormat(limitedValue);
      } else if (name === "Telefono") {
        validateTelefonoFormat(limitedValue);
      }
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  // Función para validar formato de cédula colombiana
  const validateCedulaFormat = (cedula) => {
    if (!cedula) {
      setCedulaFormatoError("");
      return;
    }

    // Validar que sea numérico (ya se hace en handleChanges)
    // Validar longitud: en Colombia las cédulas tienen entre 6 y 10 dígitos
    if (cedula.length < 6 || cedula.length > 10) {
      setCedulaFormatoError("La cédula debe tener entre 6 y 10 dígitos");
      return;
    }

    // Validar que no empiece con 0 (opcional, depende de tus reglas)
    if (cedula.startsWith('0')) {
      setCedulaFormatoError("La cédula no puede comenzar con 0");
      return;
    }

    // Si pasa todas las validaciones
    setCedulaFormatoError("");
  };

  // Función para validar formato de teléfono colombiano
  const validateTelefonoFormat = (telefono) => {
    if (!telefono) {
      setTelefonoFormatoError("");
      return;
    }

    // Validar longitud exacta: 10 dígitos para Colombia
    if (telefono.length !== 10) {
      setTelefonoFormatoError("El teléfono debe tener 10 dígitos");
      return;
    }

    // Validar que empiece con 3 (celulares en Colombia empiezan con 3)
    // O con 60, 4, etc. dependiendo del tipo
    const codigosAreaValidos = ['3', '60', '4', '5', '6', '7', '8'];
    const codigoValido = codigosAreaValidos.some(codigo =>
      telefono.startsWith(codigo)
    );

    if (!codigoValido) {
      setTelefonoFormatoError("El teléfono debe comenzar con un código válido (3, 60, 4, 5, 6, 7, 8)");
      return;
    }

    // Si pasa todas las validaciones
    setTelefonoFormatoError("");
  };

  // Validaciones de existencia en BD
  const [originalCorreo, setOriginalCorreo] = useState("");
  const [originalCedula, setOriginalCedula] = useState("");
  const [originalTelefono, setOriginalTelefono] = useState("");

  const handleCorreoBlur = async () => {
    if (values.CorreoElectronico === originalCorreo) return;

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (values.CorreoElectronico && !emailRegex.test(values.CorreoElectronico)) {
      setCorreoError('Ingrese un correo electrónico válido');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/user/validar-correo?correo=${values.CorreoElectronico}`);
      setCorreoError(response.data.exists ? 'Este correo ya está registrado' : '');
    } catch {
      setCorreoError('No se pudo validar el correo');
    }
  };

  const handleCedulaBlur = async () => {
    if (values.CedulaId === originalCedula) return;

    // Primero validar formato
    validateCedulaFormat(values.CedulaId);
    if (cedulaFormatoError) return;

    try {
      const response = await axios.get(`http://localhost:3000/user/validar-cedula?cedula=${values.CedulaId}`);
      setCedulaError(response.data.exists ? 'Esta cédula ya está registrada' : '');
    } catch {
      setCedulaError('No se pudo validar la cédula');
    }
  };

  const handleTelefonoBlur = async () => {
    if (values.Telefono === originalTelefono) return;

    // Primero validar formato
    validateTelefonoFormat(values.Telefono);
    if (telefonoFormatoError) return;

    try {
      const response = await axios.get(`http://localhost:3000/user/validar-telefono?telefono=${values.Telefono}`);
      setTelefonoError(response.data.exists ? 'Este teléfono ya está registrado' : '');
    } catch {
      setTelefonoError('No se pudo validar el teléfono');
    }
  };

  // Crear / Editar cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validar formatos antes de enviar
    validateCedulaFormat(values.CedulaId);
    validateTelefonoFormat(values.Telefono);

    // Validación campos obligatorios 
    const camposObligatorios = [
      "CedulaId",
      "TipoDocumentoId",
      "NombreCompleto",
      "Telefono",
      "CorreoElectronico",
      "Direccion",
    ].filter(Boolean);

    const camposVacios = camposObligatorios.filter(campo => !values[campo] || !values[campo].toString().trim());

    if (camposVacios.length > 0) {
      toast.warning(`Los siguientes campos son obligatorios: ${camposVacios.join(", ")}`);
      return; // Detiene el envío
    }

    // Validar formato de cédula antes de enviar
    if (values.CedulaId.length < 6 || values.CedulaId.length > 10) {
      toast.warning("La cédula debe tener entre 6 y 10 dígitos");
      return;
    }

    // Validar formato de teléfono antes de enviar
    if (values.Telefono.length !== 10) {
      toast.warning("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    // Validaciones existentes de correo, cédula y teléfono
    if (correoError || cedulaError || telefonoError || cedulaFormatoError || telefonoFormatoError) {
      toast.warning("Corrige los errores antes de enviar");
      return;
    }

    // VALIDAR EXISTENCIA EN BD ANTES DE ENVIAR

    try {
      const [correoRes, cedulaRes, telefonoRes] = await Promise.all([
        axios.get(`http://localhost:3000/user/validar-correo?correo=${values.CorreoElectronico}`),
        axios.get(`http://localhost:3000/user/validar-cedula?cedula=${values.CedulaId}`),
        axios.get(`http://localhost:3000/user/validar-telefono?telefono=${values.Telefono}`)
      ]);

      if (!editData && correoRes.data.exists) {
        toast.warning("Este correo ya está registrado");
        return;
      }

      if (!editData && cedulaRes.data.exists) {
        toast.warning("Esta cédula ya está registrada");
        return;
      }

      if (!editData && telefonoRes.data.exists) {
        toast.warning("Este teléfono ya está registrado");
        return;
      }

      // Si está editando, solo validar si cambió el valor
      if (editData) {
        if (values.CorreoElectronico !== originalCorreo && correoRes.data.exists) {
          toast.warning("Este correo ya está registrado");
          return;
        }

        if (values.Telefono !== originalTelefono && telefonoRes.data.exists) {
          toast.warning("Este teléfono ya está registrado");
          return;
        }
      }

    } catch (error) {
      toast.error("Error validando datos");
      return;
    }


    try {
      if (editData) {
        const response = await updateDataClient(editData.CedulaId, values);
        if (response.status === 200) {
          const updatedList = await getDataClients();

          // ACTUALIZAR DATOS CON PAGINACIÓN 
          setAllData(updatedList.data || []);
          setTotalItems(updatedList.data?.length || 0);

          setOpenEditar(false);
          toast.success("Usuario actualizado correctamente");
        }
      } else {
        const response = await postDataClients(values);
        if (response.status === 201) {
          const updatedList = await getDataClients();
          setUser(updatedList.data);
          // ACTUALIZAR DATOS CON PAGINACIÓN 
          setAllData(updatedList.data || []);
          setTotalItems(updatedList.data?.length || 0);
          setOpenCreate(false);
          toast.success("Usuario creado correctamente");
        }
      }
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la solicitud");
    }
  };

  //Reseteo de las alertas de errores
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
    setSubmitted(false); // esto evita que muestre validaciones al abrir
  };

  // Eliminar cliente
  const handleDelete = async (id) => {
    try {
      const response = await deleteDataClient(id); // Usamos la función del servicio

      // Si la respuesta es exitosa (200 o 201)
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message); // Mensaje del backend

        // Actualiza la lista de clientes después de eliminar
        const updatedList = await getDataClients();
        if (updatedList?.data) {
          // ACTUALIZAR DATOS CON PAGINACIÓN 
          setAllData(updatedList.data);
          setTotalItems(updatedList.data.length);
        }

        setOpenEliminar(false); // Cerramos el modal
      }
    } catch (error) {
      // Manejar específicamente el error 409 (Conflict)
      if (error.response && error.response.status === 409) {
        // Mostrar el mensaje específico del backend
        toast.warning(error.response.data.message || "No se puede eliminar el cliente porque tiene pedidos asociados");
      } else {
        // Otros errores
        toast.error(error.message || "Error al eliminar el cliente");
      }
      // No cerrar el modal si hay error 409
      if (!error.response || error.response.status !== 409) {
        setOpenEliminar(false);
      }
    }
  };

  // FUNCIONES DE PAGINACIÓN 
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Abrir modal para editar, ver o eliminar
  const handleEditClick = (u) => {
    setEditData(u);
    setValues({ ...u });

    //Evita que en el editar saque la exepción si no ha habido cambios
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

  // Formulario para modales
  const renderModalForm = (type = "create") => {
    const isReadOnly = type === "ver";
    const isCreate = type === "create";
    const buttonLabel = type === "create" ? "Crear" : type === "editar" ? "Guardar" : "Cerrar";

    return (
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-left">
        {/* Tipo de documento */}
        <div className="flex flex-col">
          <label className="mb-1">Tipo de documento</label>
          <select
            name="TipoDocumentoId"
            value={values.TipoDocumentoId || ""}
            onChange={handleChanges}
            disabled={isReadOnly}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.TipoDocumentoId ? "border-red-500" : "border-gray-300"} ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">Seleccione un tipo de documento</option>
            {tiposDocumento.map((tipo) => (
              <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId}>
                {tipo.Nombre}
              </option>
            ))}
          </select>
          <div className="min-h-[16px] mt-0.5">
            {(!values.TipoDocumentoId && submitted) && (
              <p className="text-red-500 text-[12px] leading-4">Campo obligatorio.</p>
            )}
          </div>
        </div>

        {/* Cédula */}
        <div className="flex flex-col">
          <label className="mb-1">Cédula *</label>
          <input
            type="text"
            name="CedulaId"
            value={values.CedulaId}
            placeholder="Ingrese su cédula (6-10 dígitos)"
            readOnly={isReadOnly || (type === "editar")}
            onChange={handleChanges}
            onBlur={!isReadOnly ? handleCedulaBlur : undefined}
            maxLength="10"
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
      ${(submitted && !values.CedulaId.trim()) || cedulaError || cedulaFormatoError ? "border-red-500" : "border-gray-300"} ${(isReadOnly || type === "editar") ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          <div className="min-h-[32px] mt-0.5">
            {(!values.CedulaId.trim() && submitted) ? (
              <p className="text-red-500 text-[12px] leading-4">Ingrese una cédula válida</p>
            ) : cedulaError ? (
              <p className="text-red-500 text-[12px] leading-4">{cedulaError}</p>
            ) : cedulaFormatoError ? (
              <p className="text-red-500 text-[12px] leading-4">{cedulaFormatoError}</p>
            ) : values.CedulaId ? (
              <p className="text-gray-500 text-[11px] leading-4">
                {values.CedulaId.length}/10 dígitos • Solo números permitidos
              </p>
            ) : null}
          </div>
        </div>

        {/* Nombre completo */}
        <div className="flex flex-col">
          <label className="mb-1">Nombre completo</label>
          <input
            type="text"
            name="NombreCompleto"
            value={values.NombreCompleto}
            placeholder="Ingrese su nombre"
            readOnly={isReadOnly}
            onChange={handleChanges}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.NombreCompleto.trim() ? "border-red-500" : "border-gray-300"} ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          <div className="min-h-[16px] mt-0.5">
            {(!values.NombreCompleto.trim() && submitted) && (
              <p className="text-red-500 text-[12px] leading-4">Ingrese su nombre completo</p>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="flex flex-col">
          <label className="mb-1">Dirección</label>
          <input
            type="text"
            name="Direccion"
            value={values.Direccion}
            placeholder="Ingrese su dirección"
            readOnly={isReadOnly}
            onChange={handleChanges}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.Direccion.trim() ? "border-red-500" : "border-gray-300"} ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          <div className="min-h-[16px] mt-0.5">
            {(!values.Direccion.trim() && submitted) && (
              <p className="text-red-500 text-[12px] leading-4">Ingrese una dirección</p>
            )}
          </div>
        </div>

        {/* Correo electrónico */}
        <div className="flex flex-col">
          <label className="mb-1">Correo electrónico</label>
          <input
            type="email"
            name="CorreoElectronico"
            value={values.CorreoElectronico}
            placeholder="ejemplo@correo.com"
            readOnly={isReadOnly}
            onChange={handleChanges}
            onBlur={!isReadOnly ? handleCorreoBlur : undefined}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${(submitted && !values.CorreoElectronico.trim()) || correoError ? "border-red-500" : "border-gray-300"} ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          <div className="min-h-[16px] mt-0.5">
            {(!values.CorreoElectronico.trim() && submitted) ? (
              <p className="text-red-500 text-[12px] leading-4">Ingrese un correo válido</p>
            ) : correoError ? (
              <p className="text-red-500 text-[12px] leading-4">{correoError}</p>
            ) : null}
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex flex-col">
          <label className="mb-1">Teléfono *</label>
          <input
            type="text"
            name="Telefono"
            value={values.Telefono}
            placeholder="Ej: 3001234567 (10 dígitos)"
            readOnly={isReadOnly}
            onChange={handleChanges}
            onBlur={!isReadOnly ? handleTelefonoBlur : undefined}
            maxLength="10"
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${(submitted && !values.Telefono.trim()) || telefonoError || telefonoFormatoError ? "border-red-500" : "border-gray-300"} ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
          <div className="min-h-[32px] mt-0.5">
            {(!values.Telefono.trim() && submitted) ? (
              <p className="text-red-500 text-[12px] leading-4">Ingrese un número de teléfono</p>
            ) : telefonoError ? (
              <p className="text-red-500 text-[12px] leading-4">{telefonoError}</p>
            ) : telefonoFormatoError ? (
              <p className="text-red-500 text-[12px] leading-4">{telefonoFormatoError}</p>
            ) : values.Telefono ? (
              <p className="text-gray-500 text-[11px] leading-4">
                {values.Telefono.length}/10 dígitos • Solo números permitidos
                {values.Telefono.length === 10 && " ✓ Formato válido"}
              </p>
            ) : null}
          </div>
        </div>

        {/* Botones */}
        <div className="col-span-1 md:col-span-2 flex gap-4 mt-3">
          {type !== "ver" && (
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              {buttonLabel}
            </button>
          )}

          <button
            type="button"
            className={`flex-1 ${type === "ver" ? "w-full" : ""} bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors`}
            onClick={() => {
              setOpenCreate(false);
              setOpenEditar(false);
              setOpenVer(false);
              setOpenEliminar(false);
              resetForm();
            }}
          >
            {type === "ver" ? "Cerrar" : "Cancelar"}
          </button>
        </div>
      </form>
    );
  };

  const renderView = () => {
    if (!editData) return null;

    return (
      <div className="text-left space-y-2">
        <p><strong>Tipo de documento:</strong> {tiposDocumento.find(tipo => tipo.TipoDocumentoId === editData.TipoDocumentoId)?.Nombre}</p>
        <p><strong>ID:</strong> {editData.CedulaId}</p>
        <p><strong>Nombre:</strong> {editData.NombreCompleto}</p>
        <p><strong>Teléfono:</strong> {editData.Telefono}</p>
        <p><strong>Correo electrónico:</strong> {editData.CorreoElectronico}</p>
        <p><strong>Dirección:</strong> {editData.Direccion}</p>
        <p><strong>Rol:</strong> {editData.RolNombre}</p>
        <div className="mt-4 text-center">
          <button
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 w-full"
            onClick={() => setOpenVer(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de clientes</h1>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link onClick={() => {
              resetForm();          // limpia valores, errores y submitted
              setEditData(null);    // asegura que no quede data previa
              setOpenEditar(false);
              setOpenCreate(true);  // abre el modal de crear limpio
            }} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg">
              <Plus size={18} /> Nuevo cliente
            </Link>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input value={filtroValor}
                onChange={(e) => setFiltroValor(e.target.value)}
                type="text"
                placeholder="Buscar clientes"
                className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700" />
            </div>

            <select
              value={filtroCampo}
              onChange={(e) => setFiltroCampo(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]">
              <option value="">Filtrar por campo</option>
              <option value="tipoDocumento">Tipo de documento</option>
              <option value="cedula">Cédula</option>
              <option value="nombre">Nombre</option>
              <option value="direccion">Dirección</option>
              <option value="correo">Correo</option>
              <option value="telefono">Telefono</option>
            </select>
          </div>
        </div>

        {/* Modales */}
        <Modal open={openCreate} onClose={() => {
          setOpenCreate(false);
          resetForm();
        }}>
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Nuevo cliente</h3>
            {renderModalForm("create")}
          </div>
        </Modal>

        <Modal open={openEditar} onClose={() => {
          setOpenEditar(false);
          resetForm();
        }} >
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Editar cliente</h3>
            {renderModalForm("editar")}
          </div>
        </Modal>

        <Modal open={openVer} onClose={() => {
          setOpenVer(false);
          resetForm();
        }}>
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Ver cliente</h3>
            {renderView()}
          </div>
        </Modal>

        <Modal open={openEliminar} onClose={() => {
          setOpenEliminar(false);
          resetForm();
        }}>
          <div className="w-[400px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar cliente</h3>
            <p className="mb-6">¿Estás seguro de eliminar este cliente?</p>
            <div className="flex gap-4">
              <button className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors" onClick={() => handleDelete(editData.CedulaId)}>
                Eliminar
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors" onClick={() => setOpenEliminar(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-visible">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                <tr>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Tipo documento</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Cédula</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Nombre</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Dirección</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Correo</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Teléfono</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Rol</th>
                  <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length > 0 ? (
                  paginatedData.map((u) => (
                    <tr key={u.CedulaId} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[120px]">
                        {tiposDocumento.find(tipo => tipo.TipoDocumentoId === u.TipoDocumentoId)?.Nombre || u.TipoDocumentoId}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-900">{u.CedulaId}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[150px]">{u.NombreCompleto}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[150px]">{u.Direccion}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[180px]">{u.CorreoElectronico}</td>
                      <td className="py-4 px-4 text-sm text-slate-900">{u.Telefono}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[120px]">{u.RolNombre}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link onClick={() => handleEditClick(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit size={16} />
                          </Link>
                          <Link onClick={() => handleViewClick(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Eye size={16} />
                          </Link>
                          <Link onClick={() => handleDeleteClick(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No se encontraron clientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {paginatedData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>

        {/* El contenedor de notificaciones (una sola vez) */}
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
    </div>
  );
};