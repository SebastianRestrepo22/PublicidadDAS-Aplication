import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;