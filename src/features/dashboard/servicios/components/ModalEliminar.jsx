import React from "react";
import { Trash2, AlertCircle } from "lucide-react";
import Modal from "../../components/modals/modal";

export const ModalEliminar = ({ open, onClose, editData, onConfirm, cargando = false }) => {
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
                        
                        <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-700">
                                Si este servicio ha sido incluido en pedidos o ventas, 
                                no podrá eliminarse para mantener la integridad del historial.
                                Usa <strong>"Desactivar"</strong> para ocultarlo.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2
                            ${cargando 
                                ? 'bg-red-400 cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700'} 
                            text-white`}
                        onClick={() => onConfirm(editData?.ServicioId)}
                        disabled={cargando}
                    >
                        {cargando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Eliminando...
                            </>
                        ) : (
                            "Sí, eliminar"
                        )}
                    </button>
                    <button
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
                        onClick={onClose}
                        disabled={cargando}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};