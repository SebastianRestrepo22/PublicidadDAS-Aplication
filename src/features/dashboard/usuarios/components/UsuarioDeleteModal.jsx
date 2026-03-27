import React from "react";
import Modal from "../../components/modals/modal.jsx";

export const UsuarioDeleteModal = ({ open, onClose, onConfirm, cargandoFormulario, editData }) => {
  if (!editData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[400px] p-6 mx-auto text-center">
        <h3 className="text-lg font-black text-gray-800 mb-4">Eliminar usuario</h3>
        <p className="mb-6">¿Estás seguro de eliminar este usuario?</p>
        <div className="flex gap-4">
          <button
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2
              ${cargandoFormulario ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white`}
            onClick={() => onConfirm(editData?.CedulaId)}
            disabled={cargandoFormulario}
          >
            {cargandoFormulario ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onClose}
            disabled={cargandoFormulario}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};