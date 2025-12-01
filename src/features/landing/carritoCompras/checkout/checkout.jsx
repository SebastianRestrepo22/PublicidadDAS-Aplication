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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Confirmar pedido</h1>

      {error && <div className="bg-red-200 p-2 rounded mb-3">{error}</div>}

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold border-b pb-2 mb-3">Resumen</h2>

        {cart.map((item) => (
          <div key={item.id} className="border-b py-2">
            <div className="font-bold">{item.Nombre}</div>
            <div className="text-sm">Cant: {item.quantity}</div>
            <div className="text-sm">Alto: {item.options?.alto}</div>
            <div className="text-sm">Ancho: {item.options?.ancho}</div>

            <div className="font-semibold mt-1">
              {(item.Precio * item.quantity).toLocaleString("es-CO", {
                style: "currency",
                currency: "COP"
              })}
            </div>
          </div>
        ))}

        <div className="text-right mt-3 text-xl font-bold">
          Total:{" "}
          {getTotal().toLocaleString("es-CO", {
            style: "currency",
            currency: "COP"
          })}
        </div>
      </div>

      <button
        onClick={enviarPedido}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-xl font-bold"
      >
        {loading ? "Enviando..." : "Confirmar pedido"}
      </button>
    </div>
  );
};
