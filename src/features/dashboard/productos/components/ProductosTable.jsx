import React from "react";
import { Search, Edit, Eye, Trash2 } from "lucide-react";

export const ProductosTable = ({
    data,
    categorias,
    onEdit,
    onView,
    onDelete,
    onToggleEstado,
}) => {
    return (
        <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Nombre</th>
                                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descripción</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Imagen</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Precio</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Descuento</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Stock</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Categoría</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Colores</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.length > 0 ? (
                    data.map((p) => (
                        <tr key={p.ProductoId} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[100px]" title={p.ProductoId}>
                                {p.ProductoId.slice(0, 3)}...
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 truncate max-w-[150px]" title={p.Nombre}>
                                {p.Nombre}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onToggleEstado(p.ProductoId, p.Estado === 'Activo' ? 'Inactivo' : 'Activo')}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${p.Estado === 'Activo' ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${p.Estado === 'Activo' ? 'translate-x-6' : 'translate-x-1'}`}
                                        />
                                    </button>
                                    <span className={`text-xs font-medium ${p.Estado === 'Activo' ? 'text-green-600' : 'text-gray-500'}`}>
                                        {p.Estado === 'Activo' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 truncate max-w-[200px]" title={p.Descripcion}>
                                {p.Descripcion || "—"}
                            </td>
                            <td className="py-3 px-4">
                                {p.Imagen ? (
                                    <div className="flex items-center justify-center">
                                        <img
                                            src={p.Imagen}
                                            alt={p.Nombre}
                                            className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-400 text-sm">—</span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                ${parseFloat(p.Precio || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                                {p.Descuento ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {p.Descuento}%
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-sm">0%</span>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    // Lógica corregida
                                    p.UsaColores === 0
                                        ? (p.Stock > 10 ? 'bg-green-100 text-green-800' :
                                            p.Stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800')
                                        : (p.Colores && Array.isArray(p.Colores) && p.Colores.length > 0
                                            ? p.Colores.reduce((sum, c) => sum + (c.Stock || 0), 0) > 10
                                                ? 'bg-green-100 text-green-800'
                                                : p.Colores.reduce((sum, c) => sum + (c.Stock || 0), 0) > 0
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800')
                                    }`}>
                                    {/* Mostrar stock correctamente */}
                                    {p.UsaColores === 0
                                        ? (p.Stock !== null && p.Stock !== undefined ? p.Stock : 0)
                                        : (p.Colores && Array.isArray(p.Colores)
                                            ? p.Colores.reduce((sum, c) => sum + (c.Stock || 0), 0)
                                            : 0)}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 truncate max-w-[120px]" title={categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre}>
                                {categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre || "—"}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex gap-1 flex-wrap">
                                    {p.Colores && p.Colores.length > 0 ? (
                                        <div className="space-y-1">
                                            {p.Colores.slice(0, 3).map(c => (
                                                <div key={c.ColorId} className="flex items-center gap-2">
                                                    <span
                                                        className="w-4 h-4 rounded-full border"
                                                        style={{ backgroundColor: c.Hex }}
                                                        title={c.Nombre}
                                                    />
                                                    <span className="text-xs text-gray-600">
                                                        {c.Stock !== undefined ? `${c.Stock}` : 'N/A'}
                                                    </span>
                                                </div>
                                            ))}
                                            {p.Colores.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{p.Colores.length - 3} colores más
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sin colores</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(p)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onView(p)}
                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                        title="Ver"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(p)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={10} className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <Search size={48} className="mb-3 opacity-50" />
                                <p className="text-lg font-medium">No hay productos registrados</p>
                                <p className="text-sm mt-1">Comienza creando un nuevo producto</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};