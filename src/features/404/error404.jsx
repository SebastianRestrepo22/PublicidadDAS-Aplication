import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";

export const Error404 = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGoHome = () => {
        if (!user) {
            navigate("/");
            return;
        }

        // Normalizar el rol (convertir a minúsculas para comparación consistente)
        const userRole = user.Role?.toLowerCase() || "";

        console.log("Rol del usuario:", userRole); // Para debug

        // Según el rol dirígete a un sitio distinto
        if (userRole === "administrador") {
            navigate("/dashboard/graficosEstadisticos");
        } else if (userRole === "cliente") {
            navigate("/cliente/productos");
        } else {
            navigate("/"); // fallback para otros roles
        }
    };

    const handleGoBack = () => {
        navigate(-1); // Volver a la página anterior
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
            </div>

            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 text-center border border-gray-100">
                {/* Icono principal */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-full shadow-lg">
                            <AlertTriangle className="w-16 h-16 text-white" />
                        </div>
                    </div>
                </div>

                {/* Código 404 con diseño especial */}
                <div className="mb-6">
                    <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        404
                    </h1>
                </div>

                {/* Título y descripción */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    ¡Oops! Página no encontrada
                </h2>
                
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    La página que estás buscando no existe, ha sido movida o no tienes acceso a ella.
                </p>

                {/* Tarjeta informativa para el usuario */}
                {user && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
                        <p className="text-sm text-blue-800 font-medium mb-2">
                            👋 Has iniciado sesión como:
                        </p>
                        <p className="text-blue-900 font-semibold">
                            {user.Role === "administrador" ? "Administrador" : 
                             user.Role === "cliente" ? "Cliente" : "Usuario"}
                        </p>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Volver atrás
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl font-medium group"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Ir al inicio
                    </button>
                </div>
            </div>
        </div>
    );
};