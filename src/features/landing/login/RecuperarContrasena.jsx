import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export const RecuperarContrasena = () => {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setCorreo(value);
    setEmailValid(value ? validateEmail(value) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(correo)) {
      setMensaje("Por favor ingresa un correo electrónico válido");
      return;
    }

    setIsLoading(true);
    setMensaje("");

    try {
      const response = await axios.post("http://localhost:3000/auth/forgot-password", { correo });
      setMensaje(response.data.message || "✅ Correo enviado con éxito. Revisa tu bandeja de entrada.");
    } catch (error) {
      setMensaje(error.response?.data?.message || "❌ Error al enviar el correo. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Recuperar Contraseña
          </h2>
          <p className="text-gray-600 text-sm">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className={`w-full border-2 rounded-xl p-3 pl-4 pr-12 focus:outline-none focus:ring-2 transition-all ${
                  emailValid === null
                    ? 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                    : emailValid
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-100'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-100'
                }`}
                value={correo}
                onChange={handleEmailChange}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {emailValid === true && <CheckCircle className="w-5 h-5 text-green-500" />}
                {emailValid === false && <XCircle className="w-5 h-5 text-red-400" />}
              </div>
            </div>
            
            {/* Indicador de validación de email */}
            {correo && emailValid !== null && (
              <div className="mt-2">
                <p className={`text-xs flex items-center ${
                  emailValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {emailValid ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Formato de correo válido
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Ingresa un correo electrónico válido
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !validateEmail(correo)}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
              validateEmail(correo) && !isLoading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mt-6 p-4 rounded-xl border ${
            mensaje.includes('✅') || mensaje.includes('éxito')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start">
              {mensaje.includes('✅') || mensaje.includes('éxito') ? (
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{mensaje.replace(/[✅❌]/g, '').trim()}</p>
                {mensaje.includes('éxito') && (
                  <p className="text-sm opacity-90 mt-1">
                    Revisa tu bandeja de entrada y la carpeta de spam si no encuentras el correo.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link
            to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Volver al inicio de sesión
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Nota:</span> El enlace de recuperación tiene una validez de 1 hora. 
            Asegúrate de revisar tu correo pronto.
          </p>
        </div>
      </div>
    </div>
  );
};