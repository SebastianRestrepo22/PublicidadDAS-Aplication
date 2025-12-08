import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../../context/AuthContext";

export const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enviarPedido = async () => {
    if (!user) {
      setError("Debes iniciar sesión");
      return;
    }

    setLoading(true);

    const payload = {
      ClienteId: user.CedulaId,
      FechaRegistro: new Date().toISOString().split("T")[0],
      Total: getTotal(),
      Estado: "pendiente",
      detalle: cart.map(item => ({
        ProductoServicioId: item.ProductoServicioId,
        Cantidad: item.quantity,
        Alto: item.options?.alto,
        Ancho: item.options?.ancho,
        Descripcion: item.options?.descripcion,
        UrlImagen: item.options?.urlImagen || item.UrlImagen
      }))
    };

    try {
      const res = await fetch("http://localhost:3000/api/pedidos-clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error creando pedido");

      clearCart();
      navigate("/pedido-exitoso");
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al enviar el pedido");
    } finally {
      setLoading(false);
    }
  };

  // Simulación de datos de pago
  const nombreTitular = user ? `${user.Nombre} ${user.Apellido}` : "Juan Pérez González";
  const numeroCuenta = "1234 5678 9012 3456";
  const tipoCuenta = "Ahorro";

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      {/* Título */}
      <h1 className="text-2xl font-bold mb-1">Confirmar pedido</h1>
      <p className="text-sm text-gray-600 mb-6">Revisa tu orden y completa el pago</p>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-200 text-red-800 p-3 rounded-lg mb-6 text-center">
          {error}
        </div>
      )}

      {/* Contenedor principal con espacio entre columnas */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Columna izquierda: Resumen del pedido */}
        <div className="lg:w-1/2 rounded-lg shadow p-5 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-1a3 3 0 005.356-2.356L21 12a4.978 4.978 0 00-5.356-5.356L12 12m-3 3h6M9 17H7m14 0v-1a3 3 0 00-5.356-2.356L12 12m-3 3h6M9 17H7" />
            </svg>
            <h2 className="font-semibold ">Resumen del pedido</h2>
          </div>

          {/* Lista de productos */}
          {cart.map((item) => (
            <div key={item.id} className="border-b py-3 flex justify-between">
              <div className="flex-1">
                <div className="font-medium">{item.Nombre}</div>
                <div className="text-xs text-gray-500">Cantidad: {item.quantity}</div>
                <div className="text-xs text-gray-500">Alto: {item.options?.alto || "-"}</div>
                <div className="text-xs text-gray-500">Ancho: {item.options?.ancho || "-"}</div>
              </div>
              <div className="text-right font-medium">
                {(item.Precio * item.quantity).toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP"
                })}
              </div>
            </div>
          ))}

          {/* Subtotal e IVA */}
          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {getTotal().toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP"
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>IVA</span>
              <span>$0,00</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 bg-gray-100 p-3 rounded-lg flex justify-between font-bold">
            <span>Total</span>
            <span>
              {getTotal().toLocaleString("es-CO", {
                style: "currency",
                currency: "COP"
              })}
            </span>
          </div>
        </div>

        {/* Columna derecha: Información de pago */}
        <div className="lg:w-1/2 space-y-6 bg-gray-50">
          {/* Tarjeta de información de pago */}
          <div className="rounded-lg shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9l4 4m0 0l-4 4m4-4H7m6 6v-6" />
              </svg>
              <h2 className="font-semibold">Información de pago</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">NOMBRE DEL TITULAR</label>
                <div className="text-sm font-medium">{nombreTitular}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">NÚMERO DE CUENTA</label>
                <div className="text-sm font-medium">{numeroCuenta}</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">TIPO DE CUENTA</label>
                <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {tipoCuenta}
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de escaneo QR */}
          <div className="rounded-lg shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h2 className="font-semibold">Escanea para pagar</h2>
            </div>

            <div className="flex justify-center mb-3">
              <div className="bg-gray-200 p-4 rounded-md">
                <img
                  src="https://via.placeholder.com/150?text=QR+Code"
                  alt="QR de pago"
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>

            <div className="text-center text-xs text-gray-500">
              Usa tu aplicación bancaria para escanear
            </div>
          </div>

          {/* Botón confirmar pedido */}
          <button
            onClick={enviarPedido}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 ${loading ? "bg-gray-400 cursor-not-allowed scale-95" : "bg-black hover:bg-gray-800"
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.644z"
                  ></path>
                </svg>
                <span>Enviando...</span>
              </div>
            ) : (
              "Confirmar pedido"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};