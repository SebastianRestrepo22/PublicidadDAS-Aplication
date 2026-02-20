import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Home } from "lucide-react";

export const SinAcceso = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta sección.
        </p>
        
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Home className="w-4 w-4" />
          Ir al inicio del dashboard
        </button>
      </div>
    </div>
  );
};