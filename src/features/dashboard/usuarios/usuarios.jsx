import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
import Modal from "../components/modals/modal.jsx";
import { GetDataUser, postDataUsers, updateDatauser, deleteDataUser, buscarUsuarios } from './services/services.user';
import axios from "axios";
import { GetDataRoles } from "../roles/services/services.role.js";

//importamos toastify
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Usuarios = () => {
  const [user, setUser] = useState([]);
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


  const [editData, setEditData] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

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

  //Traer los roles para el seleccionar un rol para el usuario
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await GetDataRoles();
        //Que solo aparezca los roles activos
        if (response?.data) {
          const activos = response.data.filter((rol) => rol.Estado === "Activo");
          setRoles(activos);
        }
      } catch (error) {
        console.error("Error al cargar roles:", error);
      }
    };
    fetchRoles();
  }, []);

  //Buscar usuarios

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
          const todos = await GetDataUser();
          resultados = todos?.data || [];
        }
        setUser(Array.isArray(resultados) ? resultados : []);
      } catch (error) {
        console.error(error);
        setUser([]);
      }
    };
    cargarUsuarios();
  }, [filtroCampo, filtroValor]);

  const [correoError, setCorreoError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [telefonoError, setTelefonoError] = useState("");

  // Obtener usuarios al cargar
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await GetDataUser();
      if (data?.data) setUser(data.data);
    };
    fetchUsers();
  }, []);

  // Manejo de cambios en inputs
  const handleChanges = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // Validaciones
  const [originalCorreo, setOriginalCorreo] = useState("");
  const [originalCedula, setOriginalCedula] = useState("");
  const [originalTelefono, setOriginalTelefono] = useState("");

  const handleCorreoBlur = async () => {
    if (setValues.Nombre === originalCorreo) return;
    try {
      const response = await axios.get(`http://localhost:3000/user/validar-correo?correo=${values.CorreoElectronico}`);
      setCorreoError(response.data.exists ? 'Este correo ya está registrado' : '');
    } catch {
      setCorreoError('No se pudo validar el correo');
    }
  };

  const handleCedulaBlur = async () => {
    if (setValues.Nombre === originalCedula) return;
    try {
      const response = await axios.get(`http://localhost:3000/user/validar-cedula?cedula=${values.CedulaId}`);
      setCedulaError(response.data.exists ? 'Esta cédula ya está registrada' : '');
    } catch {
      setCedulaError('No se pudo validar la cédula');
    }
  };

  const handleTelefonoBlur = async () => {
    if (setValues.Nombre === originalTelefono) return; //Trae el valor original

    try {
      const response = await axios.get(`http://localhost:3000/user/validar-telefono?telefono=${values.Telefono}`);
      setTelefonoError(response.data.exists ? 'Este teléfono ya está registrado' : '');
    } catch {
      setTelefonoError('No se pudo validar el teléfono');
    }
  };

  // Crear / Editar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validación campos obligatorios
    const camposObligatorios = [
      "CedulaId",
      "TipoDocumentoId",
      "NombreCompleto",
      "Telefono",
      "CorreoElectronico",
      "Direccion",
      openEditar ? "RoleId" : null
    ].filter(Boolean);

    const camposVacios = camposObligatorios.filter(campo => !values[campo] || !values[campo].trim());

    if (camposVacios.length > 0) {
      toast.warning(`Los siguientes campos son obligatorios: ${camposVacios.join(", ")}`);
      return; // Detiene el envío
    }

    // Validaciones existentes de correo, cédula y teléfono
    if (correoError || cedulaError || telefonoError) {
      toast.warning("Corrige los errores antes de enviar");
      return;
    }

    try {
      if (editData) {
        const response = await updateDatauser(editData.CedulaId, values);
        if (response.status === 200) {
          const updatedList = await GetDataUser();
          setUser(updatedList.data);
          setOpenEditar(false);
          toast.success("Usuario actualizado correctamente");
        }
      } else {
        const response = await postDataUsers(values);
        if (response.status === 201) {
          const updatedList = await GetDataUser();
          setUser(updatedList.data);
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
      RoleId: ""
    });

    setEditData(null);
    setCedulaError("");
    setCorreoError("");
    setTelefonoError("");
    setSubmitted(false); // esto evita que muestre validaciones al abrir
  };

  // Eliminar usuario
  const handleDelete = async (id) => {
    try {
      const response = await deleteDataUser(id); // Usamos la función del servicio
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message); // Mensaje del backend

        // Actualiza la lista de usuarios después de eliminar
        const updatedList = await GetDataUser();
        if (updatedList?.data) setUser(updatedList.data);

        setOpenEliminar(false); // Cerramos el modal
      } else {
        toast.error(response.message || "No se pudo eliminar el usuario");
      }
    } catch (error) {
      toast.error(error.message || "Error al  el usuario");
    }
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
    const isReadOnly = type === "editar";
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
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.TipoDocumentoId ? "border-red-500" : "border-gray-300"}`}
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
          <label className="mb-1">Cédula</label>
          <input
            type="text"
            name="CedulaId"
            value={values.CedulaId}
            placeholder="Ingrese su cédula"
            readOnly={isReadOnly}
            onChange={handleChanges}
            onBlur={handleCedulaBlur}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
      ${(submitted && !values.CedulaId.trim()) || cedulaError ? "border-red-500" : "border-gray-300"}`}
          />
          <div className="min-h-[16px] mt-0.5">
            {(!values.CedulaId.trim() && submitted) ? (
              <p className="text-red-500 text-[12px] leading-4">Ingrese una cédula válida</p>
            ) : cedulaError ? (
              <p className="text-red-500 text-[12px] leading-4">{cedulaError}</p>
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
            onChange={handleChanges}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.NombreCompleto.trim() ? "border-red-500" : "border-gray-300"}`}
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
            onChange={handleChanges}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${submitted && !values.Direccion.trim() ? "border-red-500" : "border-gray-300"}`}
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
            placeholder="Ingrese su correo"
            onChange={handleChanges}
            onBlur={handleCorreoBlur}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${(submitted && !values.CorreoElectronico.trim()) || correoError ? "border-red-500" : "border-gray-300"}`}
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
          <label className="mb-1">Teléfono</label>
          <input
            type="text"
            name="Telefono"
            value={values.Telefono}
            placeholder="Ingrese su teléfono"
            onChange={handleChanges}
            onBlur={handleTelefonoBlur}
            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
      ${(submitted && !values.Telefono.trim()) || telefonoError ? "border-red-500" : "border-gray-300"}`}
          />
          <div className="min-h-[16px] mt-0.5">
            {(!values.Telefono.trim() && submitted) ? (
              <p className="text-red-500 text-[12px] leading-4">Ingrese un número</p>
            ) : telefonoError ? (
              <p className="text-red-500 text-[12px] leading-4">{telefonoError}</p>
            ) : null}
          </div>
        </div>

        {/* Rol solo si se edita */}
        {openEditar && (
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-1">Rol</label>
            <select
              name="RoleId"
              value={values.RoleId || ""}
              onChange={handleChanges}
              className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
        ${submitted && !values.RoleId ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((rol) => (
                <option key={rol.RoleId} value={rol.RoleId}>
                  {rol.Nombre}
                </option>
              ))}
            </select>
            <div className="min-h-[16px] mt-0.5">
              {(!values.RoleId && submitted) && (
                <p className="text-red-500 text-[12px] leading-4">Seleccione un rol</p>
              )}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="col-span-1 md:col-span-2 flex gap-4 mt-3">
          <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
            {buttonLabel}
          </button>

          <button
            type="button"
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={() => {
              setOpenCreate(false);
              setOpenEditar(false);
              setOpenVer(false);
              setOpenEliminar(false);
              resetForm();
            }}
          >
            Cerrar
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
        <p><strong>Telfono:</strong> {editData.Telefono}</p>
        <p><strong>Correo electronico:</strong> {editData.CorreoElectronico}</p>
        <p><strong>Dirección:</strong> {editData.Direccion}</p>
        <p><strong>Rol:</strong> {editData.RolNombre}</p>
        <div className="mt-4 text-center">
          <button
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 w-[400px]"
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
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Gestión de usuarios</h1>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link onClick={() => {
              resetForm();          // limpia valores, errores y submitted
              setEditData(null);    // asegura que no quede data previa
              setOpenEditar(false);
              setOpenCreate(true);  // abre el modal de crear limpio
            }} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg">
              <Plus size={18} /> Nuevo usuario
            </Link>

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
              <option value="rol">Rol</option>
            </select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input value={filtroValor}
                onChange={(e) => setFiltroValor(e.target.value)}
                type="text"
                placeholder="Buscar usuarios"
                className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700" />
            </div>
          </div>
        </div>

        {/* Modales */}
        <Modal open={openCreate} onClose={() => {
          setOpenCreate(false);
          resetForm();
        }}>
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Nuevo usuario</h3>
            {renderModalForm("create")}
          </div>
        </Modal>

        <Modal open={openEditar} onClose={() => {
          setOpenEditar(false);
          resetForm();
        }} >
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Editar usuario</h3>
            {renderModalForm("editar")}
          </div>
        </Modal>

        <Modal open={openVer} onClose={() => {
          setOpenVer(false);
          resetForm();
        }}>
          <div className="w-[450px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-6">Ver rol</h3>
            {renderView()}
          </div>
        </Modal>

        <Modal open={openEliminar} onClose={() => {
          setOpenEliminar(false);
          resetForm();
        }}>
          <div className="w-[400px] p-6 mx-auto text-center">
            <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar usuario</h3>
            <p className="mb-6">¿Estás seguro de eliminar este usuario?</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
              <tr>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Tipo documento</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Cédula</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Nombre</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Dirección</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Correo</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Teléfono</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Rol</th>
                <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {user.length > 0 ? (
                user.map((u) => (
                  <tr key={u.CedulaId} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm text-slate-900">
                      {tiposDocumento.find(tipo => tipo.TipoDocumentoId === u.TipoDocumentoId)?.Nombre || u.TipoDocumentoId}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-900">{u.CedulaId}</td>
                    <td className="py-4 px-6 text-sm text-slate-900">{u.NombreCompleto}</td>
                    <td className="py-4 px-6 text-sm text-slate-900">{u.Direccion}</td>
                    <td className="py-4 px-6 text-sm text-slate-900">{u.CorreoElectronico}</td>
                    <td className="py-4 px-6 text-sm text-slate-900">{u.Telefono}</td>
                    <td className="py-4 px-6 text-sm text-slate-900">{u.RolNombre}</td>
                    <td className="py-4 px-6">
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
                  <td colSpan="7" className="text-center py-4">
                    No se econtraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
