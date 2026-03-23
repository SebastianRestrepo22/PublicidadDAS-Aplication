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
    console.log('ProductosTable data:', data);

    const formatPrice = (value, currency = '$') => {
        if (value === null || value === undefined || value === '') return `${currency}0`;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return `${currency}0`;
        // Formato colombiano: puntos como separador de miles, sin decimales
        return `${currency} ${Math.round(num).toLocaleString('es-CO')}`;
    };

    const getStockTotal = (producto) => {
        if (parseInt(producto.UsaColores) === 0) {
            return producto.Stock || 0;
        } else {
            return producto.Colores?.reduce((sum, c) => sum + (c.Stock || 0), 0) || 0;
        }
    };

    const getStockColorClass = (stock) => {
        if (stock > 10) return 'bg-green-100 text-green-800';
        if (stock > 0) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getStockDisplay = (producto) => {
        if (parseInt(producto.UsaColores) === 0) {
            const stock = producto.Stock || 0;
            const stockClass = stock > 10 ? 'bg-green-100 text-green-800' :
                stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800';
            return (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockClass}`}>
                    {stock} unidades
                </span>
            );
        } else {
            const coloresConStock = producto.Colores?.filter(c => c.Stock > 0) || [];
            const totalStock = coloresConStock.reduce((sum, c) => sum + (c.Stock || 0), 0);

            return (
                <div className="space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${totalStock > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {totalStock} uds totales
                    </span>
                    {coloresConStock.length > 0 && (
                        <div className="text-xs text-gray-500">
                            {coloresConStock.length} color(es) con stock
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] table-auto">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                    <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Producto</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Precio</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Stock</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Categoría</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Colores</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {data.length > 0 ? (
                        data.map((p) => {
                            console.log('Producto individual:', p);
                            const estado = p.Estado || 'Activo';
                            const stockTotal = getStockTotal(p);
                            const nombreCategoria = categorias.find(c => c.CategoriaId === p.CategoriaId)?.Nombre || "—";

                            return (
                                <tr
                                    key={p.ProductoId}
                                    className={`hover:bg-slate-50 transition-colors duration-150 ${estado === 'Inactivo' ? 'bg-gray-50 opacity-75' : ''
                                        }`}
                                >
                                    {/* Producto (Nombre + Imagen) */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {p.Imagen ? (
                                                <img
                                                    src={p.Imagen}
                                                    alt={p.Nombre}
                                                    className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">📷</span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{p.Nombre}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                    {p.Descripcion?.substring(0, 50)}
                                                    {p.Descripcion?.length > 50 ? '...' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onToggleEstado(p.ProductoId, estado === 'Activo' ? 'Inactivo' : 'Activo')}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${estado === 'Activo' ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${estado === 'Activo' ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className={`text-xs font-medium ${estado === 'Activo' ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                {estado}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Precio y Descuento */}
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-blue-900">
                                            {formatPrice(p.Precio || 0)}
                                        </div>
                                        {p.Descuento > 0 && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                -{p.Descuento}%
                                            </span>
                                        )}
                                    </td>

                                    {/* Stock */}
                                    <td className="py-3 px-4">
                                        {getStockDisplay(p)}
                                    </td>

                                    {/* Categoría */}
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-700">
                                            {nombreCategoria}
                                        </span>
                                    </td>

                                    {/* Colores */}
                                    <td className="py-3 px-4">
                                        {parseInt(p.UsaColores) === 1 && p.Colores?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {p.Colores.filter(c => c.Stock > 0).slice(0, 3).map(c => (
                                                    <div
                                                        key={c.ColorId}
                                                        className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5"
                                                        title={`${c.Nombre}: ${c.Stock || 0} unidades`}
                                                    >
                                                        <span
                                                            className="w-3 h-3 rounded-full border border-white"
                                                            style={{ backgroundColor: c.Hex }}
                                                        />
                                                        <span className="text-xs text-gray-700">
                                                            {c.Stock || 0}
                                                        </span>
                                                    </div>
                                                ))}
                                                {p.Colores.filter(c => c.Stock > 0).length > 3 && (
                                                    <span className="text-xs text-gray-500 bg-gray-50 rounded-full px-2 py-0.5">
                                                        +{p.Colores.filter(c => c.Stock > 0).length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                {parseInt(p.UsaColores) === 1 ? 'Sin stock' : 'N/A'}
                                            </span>
                                        )}
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
                                                className={`p-1.5 rounded transition-colors ${estado === 'Activo'
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
                                                className={`p-1.5 rounded transition-colors ${estado === 'Inactivo'
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
                        })
                    ) : (
                        <tr>
                            <td colSpan={7} className="py-12 text-center">
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
        </div>
    );
};