import React from 'react';

export const RolView = ({ editData, onClose }) => {
  if (!editData) return null;

  return (
    <div className="text-left space-y-2">
      <p><strong>ID:</strong> {editData.RoleId}</p>
      <p><strong>Nombre:</strong> {editData.Nombre}</p>
      <p><strong>Estado:</strong> {editData.Estado}</p>
      <div className="mt-4 text-center">
        <button
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 w-[400px]"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};