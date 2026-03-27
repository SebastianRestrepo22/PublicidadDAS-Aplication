import React from "react";
import Modal from "../../components/modals/modal.jsx";

export const UsuarioViewModal = ({ open, onClose, editData, tiposDocumento }) => {
  if (!editData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[450px] p-6 mx-auto text-center">
        <h3 className="text-lg font-black text-gray-800 mb-6">Ver usuario</h3>
        <div className="text-left space-y-2">
          <p><strong>Tipo de documento:</strong> {tiposDocumento.find(tipo => tipo.TipoDocumentoId === editData.TipoDocumentoId)?.Nombre}</p>
          <p><strong>ID:</strong> {editData.CedulaId}</p>
          <p><strong>Nombre:</strong> {editData.NombreCompleto}</p>
          <p><strong>Teléfono:</strong> {editData.Telefono}</p>
          <p><strong>Correo electrónico:</strong> {editData.CorreoElectronico}</p>
          <p><strong>Dirección:</strong> {editData.Direccion}</p>
          <p><strong>Rol:</strong> {editData.RolNombre}</p>
        </div>
        <div className="mt-4 text-center">
          <button
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 w-full"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};