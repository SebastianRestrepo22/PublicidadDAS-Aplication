import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Error404 = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (!user) return navigate("/"); // No logueado

        // Según el rol dirígete a un sitio distinto
        if (user.Role === "Administrador") return navigate("/dashboard/graficosEstadisticos");
        if (user.Role === "Cliente") return navigate("/cliente/productos");

        return navigate("/"); // fallback
    };
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center">
                <img src="/public/multimedia/404.png" alt="Página no encontrada" className="w-64 h-64 mb-6 object-contain" />

                <h1 className="text-4xl font-bold text-gray-800 mb-2">¡Oops! Página no encontrada</h1>
                <p className="text-gray-600 mb-6">
                    La página que estás buscando no existe o ha sido movida.
                </p>

                <button onClick={handleGoHome} className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                    Regresar al inicio
                </button>
            </div>

        </>
    )
}