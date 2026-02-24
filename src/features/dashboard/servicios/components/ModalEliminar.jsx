import React from "react";
import { Trash2 } from "lucide-react";
import Modal from "../../components/modals/modal";

export const ModalEliminar = ({ open, onClose, editData, onConfirm }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="w-[450px] p-6 bg-white rounded-xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Eliminar Servicio</h3>
                    <p className="text-gray-600">¿Estás seguro de eliminar este servicio?</p>
                </div>

                {editData && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">{editData.Nombre}</p>
                        <p className="text-sm text-gray-500 mt-1">ID: {editData.ServicioId}</p>
                        <p className="text-sm text-gray-500">Tipo: {editData.TipoPrecio}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Estado:
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                editData.Estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {editData.Estado}
                            </span>
                        </p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
                        onClick={() => onConfirm(editData?.ServicioId)}
                    >
                        Sí, eliminar
                    </button>
                    <button
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};