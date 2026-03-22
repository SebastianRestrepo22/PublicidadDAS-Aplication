import React from 'react';
import { Trash2, X } from 'lucide-react';

export const RolDelete = ({ editData, onDelete, onCancel, cargando = false }) => {
  return (
    <div className="w-[400px] p-6 mx-auto text-center bg-white rounded-xl shadow-lg">
      <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar rol</h3>
      <p className="mb-6 text-gray-600">¿Estás seguro de eliminar este rol?</p>
      <div className="flex gap-4">
        <button
          className={`flex-1 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium
            ${cargando 
              ? 'bg-red-400 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600'} 
            text-white`}
          onClick={() => onDelete(editData.RoleId)}
          disabled={cargando}
        >
          {cargando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Eliminando...
            </>
          ) : (
            <>
              <Trash2 size={16} />
              Eliminar
            </>
          )}
        </button>
        <button
          className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
          onClick={onCancel}
          disabled={cargando}
        >
          <X size={16} />
          Cancelar
        </button>
      </div>
    </div>
  );
};