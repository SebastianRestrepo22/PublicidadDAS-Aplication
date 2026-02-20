import React from "react";
import Modal from "../../components/modals/modal";

export const ModalTamanos = ({
    open,
    onClose,
    tamanoForm,
    onFormChange,
    onGuardar,
    tamanoEnEdicion
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="p-6 bg-white rounded-xl w-[450px]">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {tamanoEnEdicion ? "Editar Tamaño" : "Agregar Nuevo Tamaño"}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del tamaño *
                        </label>
                        <input
                            type="text"
                            name="NombreTamano"
                            value={tamanoForm.NombreTamano}
                            onChange={onFormChange}
                            placeholder="Ej: Pequeño, Mediano, Grande..."
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                name="Precio"
                                value={tamanoForm.Precio}
                                onChange={onFormChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full h-10 pl-7 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onGuardar}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        {tamanoEnEdicion ? "Actualizar" : "Agregar"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
};