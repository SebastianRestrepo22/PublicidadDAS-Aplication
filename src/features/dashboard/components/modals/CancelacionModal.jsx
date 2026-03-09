import React, { useState } from "react";
import { X, AlertTriangle, Loader } from "lucide-react";

export const CancelacionModal = ({ isOpen, onClose, onConfirm, pedidoId }) => {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleConfirm = async () => {
    // Validaciones
    if (!motivo.trim()) {
      setError("Debes ingresar un motivo para cancelar el pedido");
      return;
    }
    if (motivo.trim().length < 10) {
      setError("El motivo debe tener al menos 10 caracteres");
      return;
    }

    setCargando(true);
    setError("");
    
    try {
      await onConfirm(motivo.trim());
      setMotivo("");
      onClose();
    } catch (err) {
      console.error("Error en cancelación:", err);
      setError(err.message || "Error al cancelar el pedido");
    } finally {
      setCargando(false);
    }
  };

  const handleClose = () => {
    if (!cargando) {
      setMotivo("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-red-100">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancelar Pedido</h3>
                <p className="text-xs text-gray-500">Pedido #{pedidoId?.slice(-6)}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={cargando}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {/* Alerta */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>

            {/* Área de texto */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Motivo de cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setError("");
                }}
                disabled={cargando}
                placeholder="Ej: Cliente solicitó cancelación, problema de inventario, etc."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm ${
                  error ? 'border-red-500' : 'border-gray-300'
                } ${cargando ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                rows="3"
                autoFocus
              />
              {error && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Mínimo 10 caracteres. Este motivo será enviado al cliente.
              </p>
            </div>

            {/* Sugerencias */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Cliente solicitó cancelación",
                  "Problema de inventario",
                  "Error en el pedido",
                  "Pago no confirmado",
                  "Tiempo de entrega no disponible"
                ].map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => {
                      if (!cargando) {
                        setMotivo(sugerencia);
                        setError("");
                      }
                    }}
                    disabled={cargando}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors disabled:opacity-50"
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 bg-gray-50 rounded-b-xl border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={cargando}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700 transition-colors disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={handleConfirm}
              disabled={cargando}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {cargando ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};