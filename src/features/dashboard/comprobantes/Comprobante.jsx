import React from "react";
import { Link } from "react-router-dom";

const Comprobante = ({ comprobante, onEliminar }) => {
  // ✅ Protección temprana
  if (!comprobante) {
    return (
      <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
        <p className="text-gray-500 italic">Comprobante no disponible</p>
      </div>
    );
  }

  const {
    id,
    codigo,
    cliente,
    fecha,
    monto,
    metodoPago,
    comentario,
    estado
  } = comprobante;

  const handleEliminar = () => {
    if (window.confirm(`¿Estás seguro de eliminar el comprobante ${codigo}?`)) {
      onEliminar(id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block me-2 text-green-500">🟢</span>
          <h3 className="font-semibold text-gray-800">{codigo}</h3>
          <p className="text-sm text-gray-600 mt-1">Servicio de consultoría</p>
        </div>
        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {estado || 'Verificado'}
        </span>
      </div>

      {/* Detalles en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <label className="text-gray-500">Cliente</label>
          <p className="font-medium">{cliente}</p>
        </div>
        <div>
          <label className="text-gray-500">Fecha</label>
          <p className="font-medium">{new Date(fecha).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="text-gray-500">Monto</label>
          <p className="font-medium text-green-600">{monto}</p>
        </div>
        <div>
          <label className="text-gray-500">Método de pago</label>
          <p className="font-medium">{metodoPago}</p>
        </div>
      </div>

      {/* Comentario */}
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <label className="text-gray-500 text-xs">Comentario</label>
        <p className="text-gray-700 text-sm mt-1">{comentario}</p>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          to={`/comprobantes/${id}/detalle`}
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
        >
          👁️ Ver Detalles
        </Link>
        <button
          onClick={handleEliminar}
          className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default Comprobante;