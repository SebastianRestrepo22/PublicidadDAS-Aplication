import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export const RecuperarContrasena = () => {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/auth/forgot-password", { correo });
      setMensaje(response.data.message || "Correo enviado con éxito");
    } catch (error) {
      setMensaje(error.response?.data?.message || "Error al enviar el correo");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Recuperar Contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            className="w-full border-2 border-gray-200 rounded-xl p-2 focus:border-blue-600 focus:outline-none"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Enviar enlace de recuperación
          </button>
        </form>
        {mensaje && (
          <p className="text-center text-sm mt-3 text-gray-700">{mensaje}</p>
        )}
        <div className="text-center mt-4">
          <Link to="/login" className="text-blue-700 hover:underline text-sm">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
