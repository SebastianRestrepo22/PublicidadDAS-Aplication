import React from "react";
import { Search } from "lucide-react";
import Modal from "../../components/modals/modal";

export const ModalCategorias = ({
    open,
    onClose,
    categoriasFiltradas = [], // 👈 Valor por defecto como array vacío
    categoriaBusqueda,
    setCategoriaBusqueda,
    onSelectCategoria,
    categoriaSeleccionada
}) => {
    // Log para debug
    console.log("🎯 ModalCategorias - categoriasFiltradas:", categoriasFiltradas);
    console.log("🎯 ¿Es array?", Array.isArray(categoriasFiltradas));

    return (
        <Modal open={open} onClose={onClose}>
            <div className="p-6 bg-white rounded-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold mb-4">Seleccionar Categoría</h3>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar categoría..."
                        value={categoriaBusqueda || ""}
                        onChange={(e) => setCategoriaBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {!Array.isArray(categoriasFiltradas) ? (
                        <div className="text-center py-8 text-red-500">
                            Error: Datos de categorías inválidos
                        </div>
                    ) : categoriasFiltradas.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {categoriaBusqueda ? (
                                <>No hay categorías que coincidan con "<span className="font-medium">{categoriaBusqueda}</span>"</>
                            ) : (
                                "No hay categorías disponibles"
                            )}
                        </div>
                    ) : (
                        categoriasFiltradas.map((categoria) => (
                            <button
                                key={categoria.CategoriaId}
                                type="button"
                                onClick={() => onSelectCategoria(categoria)}
                                className={`w-full p-4 text-left rounded-lg border mb-2 transition-all ${
                                    categoriaSeleccionada === categoria.CategoriaId
                                        ? "bg-blue-50 border-blue-500"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                            >
                                <div className="font-medium">{categoria.Nombre}</div>
                                <div className="text-sm text-gray-500 mt-1">ID: {categoria.CategoriaId}</div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
};