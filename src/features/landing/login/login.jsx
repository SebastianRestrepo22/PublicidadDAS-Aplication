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
  
  // ✅ CORREGIDO: Usar login del contexto
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
        toast.error("Error al cargar tipos de documento");
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

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.Contrasena || !confirmarContrasena) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (values.Contrasena !== confirmarContrasena) {
      setRegisterErrors({ ConfirmarContrasena: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/auth/register", values);
      if (response.status === 201) {
        toast.success("Registro exitoso");
        setIsLogin(true);
        setValues({
          CedulaId: "", TipoDocumentoId: "", NombreCompleto: "",
          Telefono: "", CorreoElectronico: "", Direccion: "", Contrasena: "",
        });
        setConfirmarContrasena("");
        setRegisterErrors({});
      }
    } catch (error) {
      console.error("Error en registro:", error);
      if (error.response?.data?.errors) {
        setRegisterErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Error al registrar");
      }
    }
  };

  const [valuesLogin, setValuesLogin] = useState({
    CorreoElectronico: "",
    Contrasena: "",
  });

  const handleChangesLogin = (e) => {
    setValuesLogin({ ...valuesLogin, [e.target.name]: e.target.value });
    if (loginErrors[e.target.name]) {
      setLoginErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/login", valuesLogin);
      const token = response.data.token;
      
      // ✅ Obtener userData de la respuesta (ajusta según tu backend)
      const userData = response.data.user || {
        NombreCompleto: response.data.nombre || response.data.NombreCompleto,
        CorreoElectronico: valuesLogin.CorreoElectronico,
        Role: response.data.role || response.data.Role,
        Permisos: response.data.permisos || response.data.Permisos || []
      };
      
      // ✅ CORREGIDO: Usar la función login del contexto
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
      if (error.response?.data?.errors) {
        setLoginErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Credenciales incorrectas");
      }
    }
  };

  const getRegisterError = (fieldName) => registerErrors[fieldName] || '';
  const getLoginError = (fieldName) => loginErrors[fieldName] || '';

  // El resto del JSX permanece igual...
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

                    <form onSubmit={handleSubmitLogin} className="space-y-4">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Correo Electrónico *
                        </label>
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
                        {getLoginError("CorreoElectronico") && (
                          <p className="text-red-500 text-xs mt-1">
                            {getLoginError("CorreoElectronico")}
                          </p>
                        )}
                      </div>

                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Contraseña *
                        </label>
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
                        {getLoginError("Contrasena") && (
                          <p className="text-red-500 text-xs mt-1">
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
                          onClick={() => setIsLogin(false)}
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
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex flex-col max-h-[85vh]">
                    <div className="p-2 text-center mb-0">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2">
                        Crear Cuenta
                      </h1>
                    </div>

                    <div className="p-3 flex-1">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Nombre Completo *
                            </label>
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

                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Correo Electrónico *
                            </label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Tipo Documento *
                            </label>
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

                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Número de documento *
                            </label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Teléfono *
                            </label>
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

                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Dirección *
                            </label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Contraseña *
                            </label>
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

                          <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Confirmar Contraseña *
                            </label>
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
                                onChange={(e) => {
                                  setConfirmarContrasena(e.target.value);
                                  if (values.Contrasena !== e.target.value) {
                                    setRegisterErrors(prev => ({ ...prev, ConfirmarContrasena: "Las contraseñas no coinciden" }));
                                  } else {
                                    setRegisterErrors(prev => ({ ...prev, ConfirmarContrasena: "" }));
                                  }
                                }}
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

                        <button
                          type="submit"
                          className="relative w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-2.5 rounded-xl font-semibold overflow-hidden group/btn hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Crear Cuenta
                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      </form>

                      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                        <p className="text-gray-600 text-sm">
                          ¿Ya tienes cuenta?{" "}
                          <button
                            onClick={() => setIsLogin(true)}
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