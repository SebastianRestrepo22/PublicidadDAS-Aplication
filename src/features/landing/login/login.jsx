import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // CORREGIDO: Usar login del contexto
  const { login } = useAuth();

  const [tiposDocumento, setTiposDocumento] = useState([]);

  useEffect(() => {
    const fetchTiposDocumento = async () => {
      try {
        const response = await axios.get("http://localhost:3000/tipoS-documento");
        const tiposUnicos = response.data.filter(
          (tipo, index, self) =>
            index === self.findIndex((t) => t.TipoDocumentoId === tipo.TipoDocumentoId)
        );
        setTiposDocumento(tiposUnicos);
      } catch (error) {
        console.error("Error obteniendo tipos de documento:", error);
        // Eliminado: toast.error("Error al cargar tipos de documento");
      }
    };
    fetchTiposDocumento();
  }, []);

  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  const [values, setValues] = useState({
    CedulaId: "",
    TipoDocumentoId: "",
    NombreCompleto: "",
    Telefono: "",
    CorreoElectronico: "",
    Direccion: "",
    Contrasena: "",
  });

  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  // Función para limpiar errores al cambiar entre formularios
  const toggleForm = (isLoginForm) => {
    setIsLogin(isLoginForm);
    if (isLoginForm) {
      setRegisterErrors({});
      setValues({
        CedulaId: "",
        TipoDocumentoId: "",
        NombreCompleto: "",
        Telefono: "",
        CorreoElectronico: "",
        Direccion: "",
        Contrasena: "",
      });
      setConfirmarContrasena("");
    } else {
      setLoginErrors({});
      setValuesLogin({
        CorreoElectronico: "",
        Contrasena: "",
      });
    }
  };

  // Funciones de validación
  const validateCedula = (cedula) => {
    if (!cedula) return "La cédula es obligatoria";
    if (!/^\d+$/.test(cedula)) return "La cédula debe contener solo números";

    // Límites para Colombia
    const length = cedula.length;
    if (length < 6 || length > 10) {
      return "La cédula debe tener entre 6 y 10 dígitos";
    }

    return "";
  };

  const validateTelefono = (telefono) => {
    if (!telefono) return "El teléfono es obligatorio";
    if (!/^\d+$/.test(telefono)) return "El teléfono debe contener solo números";

    // Límites para Colombia
    const length = telefono.length;
    if (length !== 10) {
      return "El teléfono debe tener 10 dígitos (ej: 3001234567)";
    }

    // Validar que empiece con 3 (celulares) o 6/7/8 (fijos)
    const firstDigit = telefono.charAt(0);
    if (!['3', '6', '7', '8'].includes(firstDigit)) {
      return "El teléfono debe comenzar con 3 (celular) o 6/7/8 (fijo)";
    }

    return "";
  };

  // Función para validar si un campo ya existe en el backend
  const validarCampoUnico = async (campo, valor) => {
    if (!valor) return;

    try {
      const response = await axios.get(`http://localhost:3000/auth/validar-${campo}`, {
        params: { [campo]: valor }
      });

      if (response.data.exists) {
        setRegisterErrors(prev => ({
          ...prev,
          [campo === 'correo' ? 'CorreoElectronico' :
            campo === 'cedula' ? 'CedulaId' : 'Telefono']:
            `Este ${campo} ya está registrado`
        }));
      }
    } catch (error) {
      console.error(`Error validando ${campo}:`, error);
    }
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    // Limpiar error específico
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Validaciones en tiempo real para cédula y teléfono
    if (name === 'CedulaId') {
      const error = validateCedula(value);
      setRegisterErrors(prev => ({ ...prev, CedulaId: error }));

      // Validar en backend después de validación básica
      if (!error && value.length >= 6) {
        setTimeout(() => validarCampoUnico('cedula', value), 500);
      }
    }

    if (name === 'Telefono') {
      const error = validateTelefono(value);
      setRegisterErrors(prev => ({ ...prev, Telefono: error }));

      // Validar en backend después de validación básica
      if (!error && value.length === 10) {
        setTimeout(() => validarCampoUnico('telefono', value), 500);
      }
    }

    // Validación de correo en tiempo real
    if (name === 'CorreoElectronico' && value) {
      if (!/\S+@\S+\.\S+/.test(value)) {
        setRegisterErrors(prev => ({ ...prev, CorreoElectronico: "Correo electrónico inválido" }));
      } else {
        // Validar en backend si el correo ya existe
        setTimeout(() => validarCampoUnico('correo', value), 500);
      }
    }

    // Validación de contraseña en tiempo real
    if (name === 'Contrasena' && value) {
      if (value.length < 6) {
        setRegisterErrors(prev => ({ ...prev, Contrasena: "La contraseña debe tener al menos 6 caracteres" }));
      }

      // Si hay confirmación de contraseña, validar coincidencia
      if (confirmarContrasena && value !== confirmarContrasena) {
        setRegisterErrors(prev => ({
          ...prev,
          ConfirmarContrasena: "Las contraseñas no coinciden"
        }));
      } else if (confirmarContrasena && value === confirmarContrasena) {
        setRegisterErrors(prev => ({
          ...prev,
          ConfirmarContrasena: ""
        }));
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmarContrasena(value);

    if (values.Contrasena !== value) {
      setRegisterErrors(prev => ({
        ...prev,
        ConfirmarContrasena: "Las contraseñas no coinciden"
      }));
    } else {
      setRegisterErrors(prev => ({
        ...prev,
        ConfirmarContrasena: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones específicas para cédula y teléfono
    const cedulaError = validateCedula(values.CedulaId);
    const telefonoError = validateTelefono(values.Telefono);
    const passwordError = values.Contrasena !== confirmarContrasena
      ? "Las contraseñas no coinciden"
      : "";

    const newErrors = {
      CedulaId: cedulaError,
      Telefono: telefonoError,
      ConfirmarContrasena: passwordError
    };

    // Validar campos obligatorios
    const requiredFields = {
      TipoDocumentoId: "Tipo de documento es obligatorio",
      NombreCompleto: "Nombre completo es obligatorio",
      CorreoElectronico: "Correo electrónico es obligatorio",
      Direccion: "Dirección es obligatoria",
      Contrasena: "Contraseña es obligatoria"
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!values[field]) {
        newErrors[field] = message;
      }
    });

    // Validar formato de correo
    if (values.CorreoElectronico && !/\S+@\S+\.\S+/.test(values.CorreoElectronico)) {
      newErrors.CorreoElectronico = "Correo electrónico inválido";
    }

    // Validar contraseña
    if (values.Contrasena && values.Contrasena.length < 6) {
      newErrors.Contrasena = "La contraseña debe tener al menos 6 caracteres";
    }

    // Si hay errores, mostrarlos y detener el envío
    const hasErrors = Object.values(newErrors).some(error => error);
    if (hasErrors) {
      setRegisterErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/register", values);
      if (response.status === 201) {
        toast.success("Registro exitoso");
        toggleForm(true);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      // Manejo de errores del backend
      if (error.response?.data?.errors) {
        // El backend ahora devuelve { errors: { campo: mensaje } }
        setRegisterErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        // Para compatibilidad con respuestas antiguas
        const errorMsg = error.response.data.message.toLowerCase();
        if (errorMsg.includes("correo") || errorMsg.includes("email")) {
          setRegisterErrors({
            CorreoElectronico: "Este correo ya está registrado"
          });
        } else if (errorMsg.includes("cédula") || errorMsg.includes("cedula")) {
          setRegisterErrors({
            CedulaId: "Esta cédula ya está registrada"
          });
        } else if (errorMsg.includes("teléfono") || errorMsg.includes("telefono")) {
          setRegisterErrors({
            Telefono: "Este teléfono ya está registrado"
          });
        } else {
          setRegisterErrors({
            general: error.response.data.message
          });
        }
      } else {
        setRegisterErrors({
          general: "Error en el servidor. Intente nuevamente"
        });
      }
    }
  };

  const [valuesLogin, setValuesLogin] = useState({
    CorreoElectronico: "",
    Contrasena: "",
  });

  const handleChangesLogin = (e) => {
    setValuesLogin({ ...valuesLogin, [e.target.name]: e.target.value });
    if (loginErrors[e.target.name] || loginErrors.general) {
      setLoginErrors(prev => ({ ...prev, [e.target.name]: '', general: '' }));
    }
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    // Validaciones básicas para login
    const newErrors = {};

    if (!valuesLogin.CorreoElectronico.trim()) {
      newErrors.CorreoElectronico = "Ingrese su correo electrónico";
    } else if (!/\S+@\S+\.\S+/.test(valuesLogin.CorreoElectronico)) {
      newErrors.CorreoElectronico = "Correo electrónico inválido";
    }

    if (!valuesLogin.Contrasena.trim()) {
      newErrors.Contrasena = "Ingrese su contraseña";
    }

    // Si hay errores de validación, mostrarlos y detener
    if (Object.keys(newErrors).length > 0) {
      setLoginErrors(newErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/login", valuesLogin);
      const token = response.data.token;

      // Obtener userData de la respuesta (ajusta según tu backend)
      const userData = response.data.user || {
        NombreCompleto: response.data.nombre || response.data.NombreCompleto,
        CorreoElectronico: valuesLogin.CorreoElectronico,
        Role: response.data.role || response.data.Role,
        Permisos: response.data.permisos || response.data.Permisos || []
      };

      login(token, userData);

      // Navegar inmediatamente después del login
      const userRole = (userData.Role || "").toLowerCase();

      if (userRole === "administrador") {
        navigate("/dashboard/graficosEstadisticos");
      } else if (userRole === "cliente") {
        navigate("/cliente/productos");
      } else {
        navigate("/dashboard/graficosEstadisticos");
      }

    } catch (error) {
      console.error("Error en login:", error);

      // Manejo de errores específicos para login
      if (error.response?.status === 401) {
        if (error.response?.data?.message?.includes("no existe")) {
          setLoginErrors({
            general: "El usuario no existe"
          });
        } else if (error.response?.data?.message?.includes("incorrecta")) {
          setLoginErrors({
            general: "Credenciales inválidas"
          });
        } else {
          setLoginErrors({
            general: "Credenciales inválidas"
          });
        }
      } else if (error.response?.status === 404) {
        setLoginErrors({
          general: "El usuario no existe"
        });
      } else {
        setLoginErrors({
          general: "Error en el servidor. Intente nuevamente"
        });
      }
    }
  };

  const getRegisterError = (fieldName) => registerErrors[fieldName] || '';
  const getLoginError = (fieldName) => loginErrors[fieldName] || '';

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex flex-col relative overflow-hidden">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4 relative pt-16">
        {/* Fondos decorativos */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="w-full max-w-7xl z-10 mt-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            {/* Imagen a la izquierda */}
            <div className="hidden lg:flex w-2/5 items-center justify-start relative -ml-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-700 scale-110"></div>
                <div className="relative">
                  <img
                    src="/multimedia/login3.png"
                    alt="Ilustración de autenticación"
                    className="relative w-full max-w-lg drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700 animate-float"
                  />
                </div>
              </div>
            </div>

            {/* Formulario único con fade */}
            <div className="w-full lg:w-3/5 max-w-lg">
              <div className="relative">
                {/* LOGIN FORM */}
                <div
                  className={`transition-all duration-500 ${isLogin
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 -translate-x-8 pointer-events-none absolute inset-0"
                    }`}
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 border border-white/20">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Iniciar Sesión
                      </h1>
                      <p className="text-gray-600 text-sm">
                        Ingresa tus credenciales para acceder
                      </p>
                    </div>

                    {/* Mostrar error general del login */}
                    {loginErrors.general && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm font-medium text-center">
                          {loginErrors.general}
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmitLogin} className="space-y-4">
                      <div className="group">
                        <div className="flex">
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Correo Electrónico
                          </label>
                          <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                        </div>

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                          <input
                            type="email"
                            placeholder="tu@email.com"
                            name="CorreoElectronico"
                            className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getLoginError("CorreoElectronico")
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                              }`}
                            value={valuesLogin.CorreoElectronico}
                            onChange={handleChangesLogin}
                          />
                        </div>
                        {/* Error específico para correo en login */}
                        {getLoginError("CorreoElectronico") && (
                          <p className="text-red-500 text-xs mt-1.5 h-5">
                            {getLoginError("CorreoElectronico")}
                          </p>
                        )}
                      </div>

                      <div className="group">
                        <div className="flex">
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Contraseña
                          </label>
                          <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                        </div>

                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" size={20} />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            name="Contrasena"
                            className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getLoginError("Contrasena")
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                              }`}
                            value={valuesLogin.Contrasena}
                            onChange={handleChangesLogin}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors z-10"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {/* Error específico para contraseña en login */}
                        {getLoginError("Contrasena") && (
                          <p className="text-red-500 text-xs mt-1.5 h-5">
                            {getLoginError("Contrasena")}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl font-semibold overflow-hidden group/btn hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Iniciar Sesión
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </button>
                    </form>

                    <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => navigate("/recuperar-contrasena")}
                        className="text-blue-600 hover:underline text-sm block mb-2"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                      <p className="text-gray-600 text-sm">
                        ¿No tienes cuenta?{" "}
                        <button
                          onClick={() => toggleForm(false)}
                          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Regístrate aquí
                        </button>
                      </p>
                    </div>
                  </div>
                </div>

                {/* REGISTER FORM */}
                <div
                  className={`transition-all duration-500 ${!isLogin
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-x-8 pointer-events-none absolute inset-0"
                    }`}
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                    <div className="p-4 md:p-6 text-center">
                      <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                          Crear Cuenta
                        </h1>
                        {/* Indicador de pasos solo en móvil */}
                        <div className="md:hidden flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                        </div>
                      </div>

                      {/* Mensaje de error general */}
                      {registerErrors.general && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm font-medium text-center">
                            {registerErrors.general}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="px-4 pb-4 md:px-6 md:pb-6">
                      <form onSubmit={handleSubmit}>
                        {/* Paso 1 - Información Personal (visible en móvil solo si step=1) */}
                        <div className={`md:block ${step === 1 ? 'block' : 'hidden'}`}>
                          <div className="space-y-4">
                            {/* Fila 1: Nombre y Email */}
                            <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                              <div className="group">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Nombre Completo
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type="text"
                                    placeholder="Juan Pérez"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("NombreCompleto")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={values.NombreCompleto}
                                    name="NombreCompleto"
                                    onChange={handleChanges}
                                  />
                                </div>
                                {getRegisterError("NombreCompleto") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("NombreCompleto")}
                                  </p>
                                )}
                              </div>

                              <div className="group mt-4 md:mt-0">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Correo Electrónico
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("CorreoElectronico")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={values.CorreoElectronico}
                                    name="CorreoElectronico"
                                    onChange={handleChanges}
                                  />
                                </div>
                                {getRegisterError("CorreoElectronico") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("CorreoElectronico")}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Fila 2: Tipo Documento y Número */}
                            <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                              <div className="group">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Tipo Documento
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <select
                                    name="TipoDocumentoId"
                                    value={values.TipoDocumentoId}
                                    onChange={handleChanges}
                                    className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 appearance-none ${getRegisterError("TipoDocumentoId")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                  >
                                    <option value="">Seleccionar</option>
                                    {tiposDocumento.map((tipo) => (
                                      <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId}>
                                        {tipo.Nombre}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {getRegisterError("TipoDocumentoId") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("TipoDocumentoId")}
                                  </p>
                                )}
                              </div>

                              <div className="group mt-4 md:mt-0">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Número de documento
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type="text"
                                    placeholder="123456789"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("CedulaId")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={values.CedulaId}
                                    name="CedulaId"
                                    onChange={handleChanges}
                                  />
                                </div>
                                {getRegisterError("CedulaId") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("CedulaId")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Botón Siguiente solo en móvil */}
                          <div className="mt-6 md:hidden">
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300"
                            >
                              Siguiente
                            </button>
                          </div>
                        </div>

                        {/* Paso 2 - Contacto y Contraseñas (visible en móvil solo si step=2) */}
                        <div className={`md:block ${step === 2 ? 'block' : 'hidden'}`}>
                          <div className="space-y-4">
                            {/* Fila 1: Teléfono y Dirección */}
                            <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                              <div className="group">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Teléfono
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type="text"
                                    placeholder="3001234567"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("Telefono")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={values.Telefono}
                                    name="Telefono"
                                    onChange={handleChanges}
                                  />
                                </div>
                                {getRegisterError("Telefono") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("Telefono")}
                                  </p>
                                )}
                              </div>

                              <div className="group mt-4 md:mt-0">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Dirección
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type="text"
                                    placeholder="Calle 123 #45-67"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("Direccion")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={values.Direccion}
                                    name="Direccion"
                                    onChange={handleChanges}
                                  />
                                </div>
                                {getRegisterError("Direccion") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("Direccion")}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Fila 2: Contraseña y Confirmar */}
                            <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                              <div className="group">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Contraseña
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type={showPasswordRegister ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("Contrasena")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={values.Contrasena}
                                    name="Contrasena"
                                    onChange={handleChanges}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors z-10"
                                  >
                                    {showPasswordRegister ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </button>
                                </div>
                                {getRegisterError("Contrasena") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("Contrasena")}
                                  </p>
                                )}
                              </div>

                              <div className="group mt-4 md:mt-0">
                                <div className="flex">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Confirmar Contraseña
                                  </label>
                                  <span className="block text-sm font-semibold text-red-500 ml-0.5">*</span>
                                </div>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors z-10" size={20} />
                                  <input
                                    type={showPasswordConfirm ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-2.5 bg-gray-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-all duration-300 ${getRegisterError("ConfirmarContrasena")
                                      ? "border-red-500 focus:border-red-500"
                                      : "border-gray-200 focus:border-purple-500 hover:border-gray-300"
                                      }`}
                                    value={confirmarContrasena}
                                    onChange={handleConfirmPasswordChange}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors z-10"
                                  >
                                    {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </button>
                                </div>
                                {getRegisterError("ConfirmarContrasena") && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {getRegisterError("ConfirmarContrasena")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Botones del paso 2 (móvil) */}
                          <div className="mt-6 md:hidden">
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="py-3 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:border-gray-400 transition-all duration-300"
                              >
                                Atrás
                              </button>
                              <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300"
                              >
                                Crear Cuenta
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Botón de submit solo en desktop (donde se ve todo junto) */}
                        <div className="hidden md:block mt-6">
                          <button
                            type="submit"
                            className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-3 rounded-xl font-semibold overflow-hidden group/btn hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              Crear Cuenta
                              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                          </button>
                        </div>
                      </form>

                      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                        <p className="text-gray-600 text-sm">
                          ¿Ya tienes cuenta?{" "}
                          <button
                            onClick={() => toggleForm(true)}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:from-pink-600 hover:to-orange-600 transition-all"
                          >
                            Inicia sesión aquí
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-16px); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .animate-float { animation: float 6s ease-in-out infinite; }
        `}</style>
      </div>
    </div>
  );
};