import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Redirector } from "../../redirector/redirector";

export const Login = () => {
  // Estado para ver u ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { setUser } = useAuth();

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

  // Confirmar contraseña
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [contrasenaError, setContrasenaError] = useState("");

  // Validar correo
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

  // Validar cedula
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

  // Validar telefono
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
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (values.Contrasena !== confirmarContrasena) {
      setContrasenaError("Las contraseñas no coinciden");
      return;
    }

    setContrasenaError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/register", values);
      if (response.status === 201) {
        toast.success("Registro exitoso");
        setIsLogin(true);
        setValues({
          CedulaId: "",
          NombreCompleto: "",
          TipoDocumentoId: "",
          Telefono: "",
          CorreoElectronico: "",
          Direccion: "",
          Contrasena: "",
        });
        setConfirmarContrasena("");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      alert(error.response?.data?.message || "Error al registrar");
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
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);

      // Guardamos en localStorage los datos base
      localStorage.setItem("usuario", JSON.stringify(decoded));

      setUser(decoded);

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

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center bg-gray-100 pt-20">
        <div className="w-[90%] max-w-2xl h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden relative">
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
                <form onSubmit={handleSubmitLogin} className="space-y-5">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                    value={valuesLogin.CorreoElectronico}
                    name="CorreoElectronico"
                    onChange={handleChangesLogin}
                    required
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none pr-10"
                      value={valuesLogin.Contrasena}
                      name="Contrasena"
                      onChange={handleChangesLogin}
                      required
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
                <h1 className="text-2xl font-bold text-center mb-1">Crear Cuenta</h1>
                <form
                  className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide"
                  onSubmit={handleSubmit}
                >
                  {/* Nombre */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Nombre Completo"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                      value={values.NombreCompleto}
                      name="NombreCompleto"
                      onChange={handleChanges}
                      required
                    />
                    <p className="min-h-[16px] text-sm"></p>
                  </div>

                  {/* Correo */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                      value={values.CorreoElectronico}
                      name="CorreoElectronico"
                      onChange={handleChanges}
                      onBlur={handleCorreoBlur}
                      required
                    />
                    <p className="text-red-500 text-xs min-h-[16px] leading-none">{correoError}</p>
                  </div>

                  {/* Tipo documento */}
                  <div className="flex flex-col gap-1">
                    <select
                      name="TipoDocumentoId"
                      value={values.TipoDocumentoId}
                      onChange={handleChanges}
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                      required
                    >
                      <option value="">Seleccione un tipo de documento</option>
                      {tiposDocumento.map((tipo) => (
                        <option key={tipo.TipoDocumentoId} value={tipo.TipoDocumentoId}>
                          {tipo.Nombre}
                        </option>
                      ))}
                    </select>
                    <p className="min-h-[16px] text-sm"></p>
                  </div>

                  {/* Cédula */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Cédula"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                      value={values.CedulaId}
                      name="CedulaId"
                      onChange={handleChanges}
                      onBlur={handleCedulaBlur}
                      required
                    />
                    <p className="text-red-500 text-xs min-h-[16px] leading-none">{cedulaError}</p>
                  </div>

                  {/* Dirección */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Dirección"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                      value={values.Direccion}
                      name="Direccion"
                      onChange={handleChanges}
                      required
                    />
                    <p className="min-h-[16px] text-sm"></p>
                  </div>

                  {/* Teléfono */}
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      placeholder="Teléfono"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none"
                      value={values.Telefono}
                      name="Telefono"
                      onChange={handleChanges}
                      onBlur={handleTelefonoBlur}
                      required
                    />
                    <p className="text-red-500 text-xs min-h-[16px] leading-none">{telefonoError}</p>
                  </div>

                  {/* Contraseña */}
                  <div className="relative flex flex-col gap-1">
                    <input
                      type={showPasswordRegister ? "text" : "password"}
                      placeholder="Contraseña"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none pr-10"
                      value={values.Contrasena}
                      name="Contrasena"
                      onChange={handleChanges}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswordRegister ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="relative flex flex-col gap-1">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      placeholder="Confirmar contraseña"
                      className="w-full border-2 border-gray-200 rounded-xl p-2 bg-transparent focus:border-violet-500 focus:outline-none pr-10"
                      value={confirmarContrasena}
                      onChange={(e) => {
                        setConfirmarContrasena(e.target.value);
                        if (values.Contrasena !== e.target.value) {
                          setContrasenaError("Las contraseñas no coinciden");
                        } else {
                          setContrasenaError("");
                        }
                      }}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-red-500 text-xs min-h-[16px] leading-none">{contrasenaError}</p>

                  <button
                    type="submit"
                    className="w-full bg-blue-900 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Registrarse
                  </button>
                </form>

                <button
                  onClick={() => setIsLogin(true)}
                  className="mt-1 text-blue-800 hover:underline text-sm"
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