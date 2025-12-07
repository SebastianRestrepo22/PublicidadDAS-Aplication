import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export const PedidoExitoso = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        
        <CheckCircle className="text-green-600 w-16 h-16 mx-auto" />

        <h1 className="text-2xl font-bold mt-4 text-gray-800">
          ¡Pedido realizado con éxito!
        </h1>

        <p className="text-gray-600 mt-2">
          Hemos recibido tu pedido. Pronto podrás ver su estado en tu panel o por correo.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/productos"
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Seguir comprando
          </Link>

          <Link
            to="/"
            className="text-blue-600 underline text-sm"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};
