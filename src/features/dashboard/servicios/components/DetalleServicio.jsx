import React from "react";

export const DetalleServicio = ({
    editData,
    categorias,
    onEdit,
    onDelete,
    onBack
}) => {
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
                        <dt className="text-sm text-gray-500">Categoría</dt>
                        <dd>{categorias.find(c => c.CategoriaId === editData.CategoriaId)?.Nombre || editData.CategoriaId}</dd>
                    </div>
                </dl>
            </div>

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