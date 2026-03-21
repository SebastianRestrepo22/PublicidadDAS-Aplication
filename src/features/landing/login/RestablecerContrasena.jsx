import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, CheckCircle, XCircle, Lock, UserPlus, Key, Info } from "lucide-react";

export const RestablecerContrasena = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });
  const [isFirstPassword, setIsFirstPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Detectar si es la primera contraseña o recuperación
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tipo = searchParams.get('tipo');
    setIsFirstPassword(tipo === 'primera' || location.pathname.includes('setup-password'));
  }, [location]);

  // Validar criterios de contraseña
  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNuevaContrasena(value);
    validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar que la contraseña cumpla con todos los criterios
    const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion);

    if (!allCriteriaMet) {
      setError("La contraseña debe cumplir con todos los requisitos de seguridad");
      setIsLoading(false);
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      let response;

      if (isFirstPassword) {
        response = await axios.post(`${API_URL}/auth/setup-password/${token}`, {
          nuevaContrasena,
        });
      } else {
        response = await axios.post(`${API_URL}/auth/reset-password/${token}`, {
          nuevaContrasena,
        });
      }

      setMensaje(response.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const isPasswordValid = Object.values(passwordCriteria).every(criterion => criterion);
  const passwordsMatch = nuevaContrasena === confirmarContrasena;
  const canSubmit = isPasswordValid && passwordsMatch && nuevaContrasena;

  // Calcular allCriteriaMet para usar en el JSX
  const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion);
  const metCriteriaCount = Object.values(passwordCriteria).filter(v => v).length;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isFirstPassword ? 'bg-emerald-100' : 'bg-blue-100'
            }`}>
            {isFirstPassword ? (
              <UserPlus className="w-8 h-8 text-emerald-600" />
            ) : (
              <Key className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isFirstPassword ? '¡Bienvenido!' : 'Restablecer Contraseña'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isFirstPassword
              ? 'Establece tu contraseña para activar tu cuenta'
              : 'Crea una nueva contraseña para tu cuenta'}
          </p>

          {/* Badge indicador */}
          <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${isFirstPassword
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
            {isFirstPassword ? '🎯 Primera contraseña' : '🔄 Recuperación de cuenta'}
          </div>
        </div>

        {/* Nota informativa */}
        <div className={`mb-6 p-4 rounded-xl border ${isFirstPassword
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
          <p className="text-sm font-medium flex items-center">
            <Info className="w-4 h-4 mr-2" />
            {isFirstPassword
              ? 'Tu cuenta ha sido creada. Establece tu contraseña para comenzar a usarla.'
              : 'Estás estableciendo una nueva contraseña para tu cuenta existente.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstPassword ? 'Establece tu contraseña' : 'Nueva Contraseña'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isFirstPassword ? "Crea una contraseña segura" : "Ingresa tu nueva contraseña"}
                className="w-full border-2 border-gray-200 rounded-xl p-3 pl-4 pr-12 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={nuevaContrasena}
                onChange={handlePasswordChange}
                required
                minLength="8"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Criterios de contraseña */}
            {nuevaContrasena && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Requisitos de seguridad:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    {passwordCriteria.length ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${passwordCriteria.length ? 'text-green-600' : 'text-gray-500'}`}>
                      8+ caracteres
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordCriteria.uppercase ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${passwordCriteria.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      Mayúscula
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordCriteria.lowercase ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${passwordCriteria.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      Minúscula
                    </span>
                  </div>
                  <div className="flex items-center">
                    {passwordCriteria.number ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${passwordCriteria.number ? 'text-green-600' : 'text-gray-500'}`}>
                      Número
                    </span>
                  </div>
                </div>

                {/* Indicador de fortaleza */}
                {nuevaContrasena && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Fortaleza:</span>
                      <span className={`text-xs font-medium ${allCriteriaMet ? 'text-green-600' :
                          metCriteriaCount >= 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {allCriteriaMet ? 'Fuerte' :
                          metCriteriaCount >= 2 ? 'Media' : 'Débil'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${allCriteriaMet ? 'w-full bg-green-500' :
                            metCriteriaCount >= 2 ? 'w-2/3 bg-yellow-500' : 'w-1/3 bg-red-500'
                          }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFirstPassword ? 'Confirma tu contraseña' : 'Confirmar Contraseña'}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={isFirstPassword ? "Repite tu contraseña" : "Confirma tu nueva contraseña"}
                className={`w-full border-2 rounded-xl p-3 pl-4 pr-12 focus:outline-none focus:ring-2 transition-all ${confirmarContrasena && nuevaContrasena
                    ? passwordsMatch
                      ? 'border-green-400 focus:border-green-500 focus:ring-green-100'
                      : 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Indicador de coincidencia */}
            {confirmarContrasena && nuevaContrasena && (
              <div className="mt-2 flex items-center">
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-600">Las contraseñas coinciden ✓</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-600">Las contraseñas no coinciden</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${canSubmit && !isLoading
                ? isFirstPassword
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isFirstPassword ? 'Activando cuenta...' : 'Procesando...'}
              </>
            ) : isFirstPassword ? (
              <>
                <UserPlus className="w-5 h-5" />
                Activar mi cuenta
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                Cambiar contraseña
              </>
            )}
          </button>
        </form>

        {/* Mensajes de estado */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center text-red-700">
              <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {mensaje && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-pulse">
            <div className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">{mensaje}</p>
                <p className="text-sm text-green-600 mt-1">
                  Redirigiendo al inicio de sesión en 3 segundos...
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {isFirstPassword ? '¿Ya tienes una cuenta?' : '¿Recordaste tu contraseña?'}{' '}
            <button
              onClick={() => navigate("/login")}
              className={`font-medium hover:underline transition-colors ${isFirstPassword ? 'text-emerald-600 hover:text-emerald-800' : 'text-blue-600 hover:text-blue-800'
                }`}
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};