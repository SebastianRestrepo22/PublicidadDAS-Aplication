import React from 'react';
import Modal from './modal';
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";

export const ConfirmProductoModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  productoNombre = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false
}) => {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      confirmBg: 'bg-red-600 hover:bg-red-700'
    },
    info: {
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      confirmBg: 'bg-green-600 hover:bg-green-700'
    },
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100',
      confirmBg: 'bg-red-600 hover:bg-red-700'
    }
  };

  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-md p-6 mx-auto text-center">
        <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <Icon size={32} className={config.iconColor} />
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {title}
        </h3>

        {productoNombre && (
          <div className="mb-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <Package size={18} className="text-gray-500" />
              <span className="font-medium text-gray-700">{productoNombre}</span>
            </div>
          </div>
        )}

        <p className="text-gray-600 mb-4 text-sm">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 text-white py-2.5 rounded-lg transition-colors font-medium text-sm ${config.confirmBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmProductoModal;