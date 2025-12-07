import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export const RestablecerContrasena = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3000/auth/reset-password/${token}`, {
        nuevaContrasena,
      });
      setMensaje(response.data.message);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al restablecer contraseña");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Restablecer Contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="w-full border-2 border-gray-200 rounded-xl p-2 focus:border-blue-600 focus:outline-none"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="w-full border-2 border-gray-200 rounded-xl p-2 focus:border-blue-600 focus:outline-none"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Restablecer contraseña
          </button>
        </form>
        {error && <p className="text-red-500 mt-3 text-center">{error}</p>}
        {mensaje && <p className="text-green-600 mt-3 text-center">{mensaje}</p>}
      </div>
    </div>
  );
};
