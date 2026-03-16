import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Pagination } from "../../components/paginacion/pagination";
import { ToggleEstado } from "./ToggleEstado";

export const TablaServicios = ({
    paginatedData,
    categorias,
    onView,
    onEdit,
    onDelete,
    onToggleEstado,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange
}) => {
    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Activo': return 'bg-green-100 text-green-800';
            case 'Inactivo': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (paginatedData.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <p className="text-gray-500">No hay servicios disponibles</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] table-auto">
                    <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Servicio</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Categoría</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginatedData.map((p) => {
                            const estado = p.Estado || 'Activo';
                            const nombreCategoria = categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre || "—";

                            return (
                                <tr 
                                    key={p.ServicioId} 
                                    className={`hover:bg-slate-50 transition-colors duration-150 ${
                                        estado === 'Inactivo' ? 'bg-gray-50 opacity-75' : ''
                                    }`}
                                >
                                    {/* Servicio (Nombre + Imagen + Descripción) */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {p.Imagen ? (
                                                <img
                                                    src={p.Imagen}
                                                    alt={p.Nombre}
                                                    className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/40x40?text=Error';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">📷</span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{p.Nombre}</div>
                                                {p.Descripcion && (
                                                    <div className="text-xs text-gray-500 truncate max-w-[300px]">
                                                        {p.Descripcion}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* ID (mostrar solo parte para no ocupar tanto espacio) */}
                                    <td className="py-3 px-4">
                                        <span className="text-xs text-gray-500" title={p.ServicioId}>
                                            {p.ServicioId.slice(0, 3)}...
                                        </span>
                                    </td>

                                    {/* Estado */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onToggleEstado(p.ServicioId, estado === 'Activo' ? 'Inactivo' : 'Activo')}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                                                    estado === 'Activo' ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                                                        estado === 'Activo' ? 'translate-x-5' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                            <span className={`text-xs font-medium ${
                                                estado === 'Activo' ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                                {estado}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Categoría */}
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-700">
                                            {nombreCategoria}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => onView(p)} 
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(p)}
                                                className={`p-1.5 rounded transition-colors ${
                                                    estado === 'Activo'
                                                        ? 'text-blue-600 hover:bg-blue-50'
                                                        : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                                title={estado === 'Activo' ? 'Editar' : 'Debe estar activo para editar'}
                                                disabled={estado === 'Inactivo'}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(p)}
                                                className={`p-1.5 rounded transition-colors ${
                                                    estado === 'Inactivo'
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                                title={estado === 'Inactivo' ? 'Eliminar' : 'Debe estar inactivo para eliminar'}
                                                disabled={estado === 'Activo'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onItemsPerPageChange={onItemsPerPageChange}
            />
        </div>
    );
};