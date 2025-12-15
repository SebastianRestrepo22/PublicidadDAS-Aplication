import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export const Login = () => {
  //Estado para ver o ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth(); // CAMBIO: Usar login en lugar de setUser

  const [tiposDocumento, setTiposDocumento] = useState([]);

  // Obtener tipos de documento desde el backend
  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await axios.get("http://localhost:3000/tipoS-documento");
        setTiposDocumento(response.data);
      } catch (error) {
        console.error("Error obteniendo tipos de documento:", error);
      }
    };
    fetchTiposDocumento();
  }, []);

  //Confirmar constraseña
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [contrasenaError, setContrasenaError] = useState("");

  //Validar correo
  const [correoError, setCorreoError] = useState('');

  const handleCorreoBlur = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/validar-correo?correo=${values.CorreoElectronico}`);
      if (response.data.exists) {
        setCorreoError('Este correo ya está registrado');
      } else {
        setCorreoError('');
      }
    } catch (error) {
      console.error('Error validando correo:', error);
      setCorreoError('No se pudo validar el correo');
    }
  };

  //Validar cedula
  const [cedulaError, setCedulaError] = useState('');

  const handleCedulaBlur = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/validar-cedula?cedula=${values.CedulaId}`);
      if (response.data.exists) {
        setCedulaError('Esta cedula ya está registrada');
      } else {
        setCedulaError('');
      }
    } catch (error) {
      console.error('Error validando la cedula:', error);
      setCedulaError('No se pudo validar la cedula');
    }
  };

  //Validar telefono
  const [telefonoError, setTelefonoError] = useState('');

  const handleTelefonoBlur = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/auth/validar-telefono?telefono=${values.Telefono}`);
      if (response.data.exists) {
        setTelefonoError('Este telefono ya está registrado');
      } else {
        setTelefonoError('');
      }
    } catch (error) {
      console.error('Error validando el telefono:', error);
      setTelefonoError('No se pudo validar el telefono');
    }
  };

  // Estados para errores de validación de campos vacíos
  const [fieldErrors, setFieldErrors] = useState({
    NombreCompleto: '',
    CorreoElectronico: '',
    TipoDocumentoId: '',
    CedulaId: '',
    Direccion: '',
    Telefono: '',
    Contrasena: '',
    ConfirmarContrasena: ''
  });

  // Validar campos individuales cuando pierden el foco
  const validateField = (fieldName, value) => {
    let error = '';
    if (!value.trim()) {
      error = 'Este campo es requerido';
    } else {
      // Validaciones específicas por campo
      switch (fieldName) {
        case 'CorreoElectronico':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Correo electrónico no válido';
          }
          break;
        case 'Telefono':
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            error = 'Teléfono debe tener 10 dígitos';
          }
          break;
        case 'Contrasena':
          if (value.length < 6) {
            error = 'La contraseña debe tener al menos 6 caracteres';
          }
          break;
        case 'CedulaId':
          if (!/^\d+$/.test(value)) {
            error = 'La cédula solo debe contener números';
          }
          break;
      }
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return !error;
  };

  // Validar confirmación de contraseña
  const validateConfirmPassword = (value) => {
    let error = '';
    if (!value.trim()) {
      error = 'Este campo es requerido';
    } else if (values.Contrasena !== value) {
      error = 'Las contraseñas no coinciden';
    }

    setFieldErrors(prev => ({
      ...prev,
      ConfirmarContrasena: error
    }));
    setContrasenaError(error);

    return !error;
  };

  // Función para manejar blur en campos
  const handleFieldBlur = (fieldName, value) => {
    if (fieldName === 'ConfirmarContrasena') {
      validateConfirmPassword(value);
    } else {
      validateField(fieldName, value);
    }
  };

  // Registro
  const [values, setValues] = useState({
    CedulaId: "",
    TipoDocumentoId: "",
    NombreCompleto: "",
    Telefono: "",
    CorreoElectronico: "",
    Direccion: "",
    Contrasena: "",
  });

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    // Limpiar error cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // En la función handleSubmit (líneas ~163-200):
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
      return;
    }

    // Validaciones existentes de correo, cédula y teléfono
    if (correoError || cedulaError || telefonoError) {
      toast.warning("Corrige los errores antes de enviar");
      return;
    }

    try {
      if (editData) {
        console.log("Datos a enviar para actualizar:", values); // Para debug

        const response = await updateDatauser(editData.CedulaId, values);
        console.log("Respuesta del servidor:", response.data); // Para debug

        if (response.status === 200) {
          toast.success("Usuario actualizado correctamente");

          // Si el servidor devuelve el usuario actualizado, actualizarlo
          if (response.data.user) {
            // Actualizar editData con la respuesta del servidor
            setEditData(response.data.user);

            // Actualizar la lista completa de usuarios
            const updatedList = await GetDataUser();

            // ACTUALIZAR DATOS CON PAGINACIÓN 
            setAllData(updatedList.data || []);
            setTotalItems(updatedList.data?.length || 0);

            // Actualizar también el estado user
            setUser(updatedList.data || []);
          } else {
            // Si no viene en la respuesta, recargar toda la lista
            const updatedList = await GetDataUser();
            setAllData(updatedList.data || []);
            setTotalItems(updatedList.data?.length || 0);
            setUser(updatedList.data || []);
          }

          setOpenEditar(false);
        }
      } else {
        const response = await postDataUsers(values);
        if (response.status === 201) {
          toast.success("Usuario creado correctamente");

          // Refrescar lista completa
          const updatedList = await GetDataUser();

          // ACTUALIZAR DATOS CON PAGINACIÓN 
          setAllData(updatedList.data || []);
          setTotalItems(updatedList.data?.length || 0);
          setUser(updatedList.data || []);

          setOpenCreate(false);
        }
      }

      // Solo resetear si no hay errores
      if (!correoError && !cedulaError && !telefonoError) {
        resetForm();
      }

    } catch (error) {
      console.error("Error:", error);

      // Manejo de errores específicos
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Error al procesar la solicitud");
      }
    }
  };

  // Login
  const [valuesLogin, setValuesLogin] = useState({
    CorreoElectronico: "",
    Contrasena: "",
  });

  const handleChangesLogin = (e) => {
    setValuesLogin({ ...valuesLogin, [e.target.name]: e.target.value });
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/login", valuesLogin);
      const token = response.data.token;
      const userData = response.data.user || {}; // Asegurarnos de obtener userData

      // DEPURACIÓN: Ver qué contiene el token
      console.log("Token recibido:", token);
      const decoded = jwtDecode(token);
      console.log("Token decodificado:", decoded);
      console.log("Permisos en el token:", decoded.Permisos);

      // Usar la nueva función login del contexto
      login(token, userData);

      // Redirigir según el rol
      if (decoded.Role.toLowerCase() === "administrador") {
        navigate("/dashboard/graficosEstadisticos");
      } else if (decoded.Role.toLowerCase() === "cliente") {
        navigate("/cliente/productos");
      }

    } catch (error) {
      console.error("Error en login:", error);
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  // Determinar si un campo tiene error
  const hasError = (fieldName) => {
    return fieldErrors[fieldName] ||
      (fieldName === 'CorreoElectronico' && correoError) ||
      (fieldName === 'CedulaId' && cedulaError) ||
      (fieldName === 'Telefono' && telefonoError) ||
      (fieldName === 'ConfirmarContrasena' && contrasenaError);
  };

  // Obtener mensaje de error combinado
  const getErrorMessage = (fieldName) => {
    if (fieldName === 'CorreoElectronico' && correoError) return correoError;
    if (fieldName === 'CedulaId' && cedulaError) return cedulaError;
    if (fieldName === 'Telefono' && telefonoError) return telefonoError;
    if (fieldName === 'ConfirmarContrasena' && contrasenaError) return contrasenaError;
    return fieldErrors[fieldName] || '';
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center bg-gray-100 pt-20">
        <div className="w-[90%] max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          <div
            className={`flex w-[200%] h-full transition-transform duration-700 ease-in-out ${isLogin ? "translate-x-0" : "-translate-x-1/2"
              }`}
          >
            {/* Login */}
            <div className="w-1/2 flex flex-col md:flex-row">
              <div
                className="hidden md:flex flex-col justify-between items-start text-white p-10 w-1/2 bg-cover bg-center"
                style={{ backgroundImage: "url('/multimedia/login1.png')" }}
              ></div>

              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-center mb-6">Iniciar Sesión</h1>
                {/* Login */}
                <form onSubmit={handleSubmitLogin} className="space-y-5">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                    value={valuesLogin.CorreoElectronico}
                    name="CorreoElectronico"
                    onChange={handleChangesLogin}

                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none pr-10"
                      value={valuesLogin.Contrasena}
                      name="Contrasena"
                      onChange={handleChangesLogin}

                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Iniciar Sesión
                  </button>

                </form>

                {/* Link para recuperar contraseña */}
                <button
                  onClick={() => navigate("/recuperar-contrasena")}
                  className="mt-3 text-blue-700 hover:underline text-sm"
                >
                  ¿Olvidaste tu contraseña?
                </button>

                <button
                  onClick={() => setIsLogin(false)}
                  className="mt-4 text-blue-700 hover:underline text-sm"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
              </div>
            </div>

            {/* Registro */}
            <div className="w-1/2 flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-center mb-4">Crear Cuenta</h1>
                <form
                  className="space-y-4"
                  onSubmit={handleSubmit}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Columna Izquierda */}
                    <div className="space-y-4">
                      {/* Nombre */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Nombre Completo"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none ${hasError('NombreCompleto') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={values.NombreCompleto}
                          name="NombreCompleto"
                          onChange={handleChanges}
                          onBlur={(e) => handleFieldBlur('NombreCompleto', e.target.value)}

                        />
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('NombreCompleto')}
                        </p>
                      </div>

                      {/* Correo */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="email"
                          placeholder="Correo electrónico"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none ${hasError('CorreoElectronico') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={values.CorreoElectronico}
                          name="CorreoElectronico"
                          onChange={handleChanges}
                          onBlur={(e) => {
                            handleFieldBlur('CorreoElectronico', e.target.value);
                            handleCorreoBlur();
                          }}

                        />
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('CorreoElectronico')}
                        </p>
                      </div>

                      {/* Tipo documento */}
                      <div className="flex flex-col gap-1">
                        <select
                          name="TipoDocumentoId"
                          value={values.TipoDocumentoId}
                          onChange={handleChanges}
                          onBlur={(e) => handleFieldBlur('TipoDocumentoId', e.target.value)}
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none ${hasError('TipoDocumentoId') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}

                        >
                          <option value="">Tipo de documento</option>
                          {tiposDocumento.map((tipo) => (
                            <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId}>
                              {tipo.Nombre}
                            </option>
                          ))}
                        </select>
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('TipoDocumentoId')}
                        </p>
                      </div>

                      {/* Cédula */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Cédula"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none ${hasError('CedulaId') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={values.CedulaId}
                          name="CedulaId"
                          onChange={handleChanges}
                          onBlur={(e) => {
                            handleFieldBlur('CedulaId', e.target.value);
                            handleCedulaBlur();
                          }}

                        />
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('CedulaId')}
                        </p>
                      </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-4">
                      {/* Dirección */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Dirección"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none ${hasError('Direccion') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={values.Direccion}
                          name="Direccion"
                          onChange={handleChanges}
                          onBlur={(e) => handleFieldBlur('Direccion', e.target.value)}

                        />
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('Direccion')}
                        </p>
                      </div>

                      {/* Teléfono */}
                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          placeholder="Teléfono"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none ${hasError('Telefono') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={values.Telefono}
                          name="Telefono"
                          onChange={handleChanges}
                          onBlur={(e) => {
                            handleFieldBlur('Telefono', e.target.value);
                            handleTelefonoBlur();
                          }}

                        />
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('Telefono')}
                        </p>
                      </div>

                      {/* Contraseña */}
                      <div className="relative flex flex-col gap-1">
                        <input
                          type={showPasswordRegister ? "text" : "password"}
                          placeholder="Contraseña"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none pr-10 ${hasError('Contrasena') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={values.Contrasena}
                          name="Contrasena"
                          onChange={handleChanges}
                          onBlur={(e) => handleFieldBlur('Contrasena', e.target.value)}

                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswordRegister ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('Contrasena')}
                        </p>
                      </div>

                      {/* Confirmar contraseña */}
                      <div className="relative flex flex-col gap-1">
                        <input
                          type={showPasswordConfirm ? "text" : "password"}
                          placeholder="Confirmar contraseña"
                          className={`w-full border-2 rounded-xl p-2 bg-transparent focus:outline-none pr-10 ${hasError('ConfirmarContrasena') ? 'border-red-500' : 'border-gray-200 focus:border-violet-500'}`}
                          value={confirmarContrasena}
                          onChange={(e) => {
                            setConfirmarContrasena(e.target.value);
                            if (values.Contrasena !== e.target.value) {
                              setContrasenaError("Las contraseñas no coinciden");
                            } else {
                              setContrasenaError("");
                            }
                          }}
                          onBlur={(e) => handleFieldBlur('ConfirmarContrasena', e.target.value)}

                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <p className="text-red-500 text-xs min-h-[16px] leading-none">
                          {getErrorMessage('ConfirmarContrasena')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón de registro */}
                  <button
                    type="submit"
                    className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mt-2"
                  >
                    Registrarse
                  </button>
                </form>

                <button
                  onClick={() => setIsLogin(true)}
                  className="mt-4 text-blue-800 hover:underline text-sm text-center"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>

              <div
                className="hidden md:flex flex-col justify-between items-start text-white p-10 w-1/2 bg-cover bg-center"
                style={{ backgroundImage: "url('/multimedia/register2.png')" }}
              ></div>
            </div>
          </div>
        </div>
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
    </>
  );
};