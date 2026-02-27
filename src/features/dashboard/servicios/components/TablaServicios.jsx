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
     // Formatear precio
    const formatPrice = (value, currency = '$') => {
        if (value === null || value === undefined || value === '') return `${currency}0.00`;

        // Convertir a número si es string
        const num = typeof value === 'string' ? parseFloat(value) : value;

        // Verificar si es un número válido
        if (isNaN(num)) return `${currency}0.00`;

        // Formatear con separador de miles y 2 decimales
        return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    };

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
                <table className="w-full">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold">ID</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Nombre</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Estado</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Tipo</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Precio</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Descuento</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Categoría</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedData.map((p) => {
                            const estado = p.Estado || 'Activo';
                            const precioMostrar = p.TipoPrecio === 'UNICO'
                                ? `${formatPrice(p.Precio || 0)}`
                                : 'Por tamaño';

                            return (
                                <tr key={p.ServicioId} className={`hover:bg-gray-50 ${estado === 'Inactivo' ? 'bg-gray-50 opacity-75' : ''}`}>
                                    <td className="py-3 px-4 text-sm text-gray-700" title={p.ServicioId}>
                                        {p.ServicioId.slice(0, 3)}...
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium">{p.Nombre}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <ToggleEstado
                                                checked={estado === 'Activo'}
                                                onChange={(checked) => onToggleEstado(p.ServicioId, checked ? 'Activo' : 'Inactivo')}
                                            />
                                            <span className={`text-xs font-medium ${estado === 'Activo' ? 'text-green-600' : 'text-gray-500'}`}>
                                                {estado}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${p.TipoPrecio === 'UNICO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {p.TipoPrecio}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium text-blue-900">{precioMostrar}</td>
                                    <td className="py-3 px-4">
                                        {p.Descuento ? (
                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {p.Descuento}%
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">0%</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-700">
                                        {categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre || "—"}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onView(p)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Ver">
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => estado === 'Activo' && onEdit(p)}
                                                className={`p-1.5 rounded transition-colors ${estado === 'Activo' ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed'}`}
                                                disabled={estado === 'Inactivo'}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => estado === 'Inactivo' && onDelete(p)}
                                                className={`p-1.5 rounded transition-colors ${estado === 'Inactivo' ? 'text-red-600 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'}`}
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