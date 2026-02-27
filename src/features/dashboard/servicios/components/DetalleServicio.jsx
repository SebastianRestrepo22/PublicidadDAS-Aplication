import React from "react";

export const DetalleServicio = ({
    editData,
    categorias,
    tamanos,
    onEdit,
    onDelete,
    onBack
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


    if (!editData) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando servicio...</p>
            </div>
        );
    }

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'Activo': return 'bg-green-100 text-green-800';
            case 'Inactivo': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Información general */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">Información general</h4>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getEstadoColor(editData.Estado)}`}>
                        {editData.Estado || "Activo"}
                    </span>
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm text-gray-500">ID</dt>
                        <dd className="font-mono text-sm">{editData.ServicioId}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Nombre</dt>
                        <dd className="font-medium">{editData.Nombre}</dd>
                    </div>
                    <div className="md:col-span-2">
                        <dt className="text-sm text-gray-500">Descripción</dt>
                        <dd>{editData.Descripcion || "—"}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Tipo de precio</dt>
                        <dd>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                editData.TipoPrecio === 'UNICO' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                                {editData.TipoPrecio === 'UNICO' ? 'Precio Único' : 'Por Tamaño'}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm text-gray-500">Categoría</dt>
                        <dd>{categorias.find(c => c.CategoriaId === editData.CategoriaId)?.Nombre || editData.CategoriaId}</dd>
                    </div>
                    {editData.Descuento > 0 && (
                        <div>
                            <dt className="text-sm text-gray-500">Descuento</dt>
                            <dd className="text-red-600 font-medium">{editData.Descuento}%</dd>
                        </div>
                    )}
                </dl>
            </div>

            {/* Imagen */}
            {editData.Imagen && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Imagen</h4>
                    <img
                        src={editData.Imagen}
                        alt={editData.Nombre}
                        className="max-w-xs rounded-lg border shadow-sm"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
                        }}
                    />
                </div>
            )}

            {/* Precio o tamaños según tipo */}
            {editData.TipoPrecio === 'UNICO' ? (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Precio</h4>

                    <dl>
                        <div>
                            <dt className="text-sm text-gray-500">Precio base</dt>
                            <dd className="text-xl font-bold text-blue-900">{formatPrice(editData.Precio || 0)}</dd>
                        </div>
                        {editData.Descuento > 0 && (
                            <div className="mt-4 bg-green-50 p-4 rounded-lg">
                                <dt className="text-sm text-gray-600">Precio final con descuento</dt>
                                <dd className="text-2xl font-bold text-green-600">
                                    {(formatPrice(editData.Precio) * (1 - editData.Descuento / 100))}
                                </dd>
                                <dd className="text-xs text-gray-500">Descuento del {editData.Descuento}% aplicado</dd>
                            </div>
                        )}
                    </dl>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Tamaños disponibles</h4>

                    {tamanos.length > 0 ? (
                        <div className="space-y-2">
                            {tamanos.map((tamano, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                    <span className="font-medium text-gray-900">{tamano.NombreTamano}</span>
                                    <div className="text-right">
                                        {editData.Descuento > 0 ? (
                                            <>
                                                <span className="text-gray-400 line-through text-sm mr-2">
                                                    {formatPrice(tamano.Precio)}
                                                </span>
                                                <span className="text-blue-600 font-bold">
                                                    {(formatPrice(tamano.Precio) * (1 - editData.Descuento / 100))}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-blue-600 font-bold">
                                                {formatPrice(tamano.Precio)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {editData.Descuento > 0 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    * Descuento del {editData.Descuento}% aplicado a todos los tamaños
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No hay tamaños configurados</p>
                    )}
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
                <button
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        editData.Estado === 'Activo'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => onEdit(editData.ServicioId)}
                    disabled={editData.Estado === 'Inactivo'}
                >
                    Editar Servicio
                </button>

                {editData.Estado === 'Inactivo' && (
                    <button
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        onClick={() => onDelete(editData)}
                    >
                        Eliminar Servicio
                    </button>
                )}

                <button
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    onClick={onBack}
                >
                    Volver a la lista
                </button>
            </div>
        </div>
    );
};