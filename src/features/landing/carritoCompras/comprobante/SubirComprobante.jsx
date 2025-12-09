// src/components/checkout/SubirComprobante.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const SubirComprobante = () => {
  const { pedidoId } = useParams(); // UUID del pedido
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor selecciona un comprobante (imagen o PDF)");
      return;
    }

    const formData = new FormData();
    formData.append("comprobante", file);
    formData.append("pedidoId", pedidoId);

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/comprobantes", {
        method: "POST",
        body: formData
        // ⚠️ No pongas headers: Content-Type aquí
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al subir el comprobante");
      }

      setSuccess(true);
      // Opcional: redirigir a "mis pedidos" o página de seguimiento
      setTimeout(() => navigate("/mis-pedidos"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sube tu comprobante de pago</h1>
      <p className="text-gray-600 mb-4">
        Adjunta el comprobante de tu transferencia para que podamos verificar tu pago.
      </p>

      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
      {success && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
          ¡Comprobante subido con éxito! Revisaremos tu pago pronto.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded font-bold text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
        >
          {loading ? "Subiendo..." : "Enviar comprobante"}
        </button>
      </form>

      <button
        onClick={() => navigate(-1)}
        className="mt-4 text-gray-600 underline"
      >
        ← Volver
      </button>
    </div>
  );
};