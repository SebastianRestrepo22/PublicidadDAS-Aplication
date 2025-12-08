// src/components/checkout/PagoPendiente.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

export const PagoPendiente = () => {
  const { pedidoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const nombreTitular = user ? `${user.Nombre} ${user.Apellido}` : "Cliente";
  const numeroCuenta = "1234 5678 9012 3456"; // ← Reemplaza con tu cuenta real
  const tipoCuenta = "Ahorro";

  const handleSubirComprobante = () => {
    navigate(`/subir-comprobante/${pedidoId}`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Pago pendiente</h1>
        <p className="text-gray-600 mt-2">
          Tu pedido está creado. Por favor, realiza el pago y sube tu comprobante.
        </p>
      </div>

      {/* Datos de pago */}
      <div className="bg-gray-50 rounded-lg shadow p-5 mb-6">
        <h2 className="font-semibold text-lg mb-4">Datos para el pago</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">TITULAR</label>
            <div className="text-sm font-medium">{nombreTitular}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">NÚMERO DE CUENTA</label>
            <div className="text-sm font-medium">{numeroCuenta}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">TIPO DE CUENTA</label>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {tipoCuenta}
            </span>
          </div>
        </div>
      </div>

      {/* QR (opcional) */}
      <div className="bg-gray-50 rounded-lg shadow p-5 mb-6">
        <h2 className="font-semibold text-lg mb-3">Pagar con QR</h2>
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded">
            <img
              src="https://placehold.co/150?text=QR+Pago"
              alt="QR de pago"
              className="w-24 h-24"
            />
          </div>
        </div>
      </div>

      {/* Botón para subir comprobante */}
      <button
        onClick={handleSubirComprobante}
        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"
      >
        Subir comprobante de pago
      </button>

      <button
        onClick={() => navigate("/")}
        className="w-full mt-3 text-gray-600 underline"
      >
        ← Volver al inicio
      </button>
    </div>
  );
};