// ProductoView.jsx
import React from "react";

export const ProductoView = ({
  editData,
  categorias,
  goToEdit,
  goToBackToList
}) => {
  if (!editData) return <div>Cargando...</div>;

  const estado = editData.Estado || 'Activo';

  const formatPrice = (value, currency = '$') => {
    if (value === null || value === undefined || value === '') return `${currency}0`;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return `${currency}0`;
    return `${currency} ${Math.round(num).toLocaleString('es-CO')}`;
  };

  return (
    <div className="text-left space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-black text-gray-800 mb-4">Detalles del Producto</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><strong>ID:</strong> {editData.ProductoId}</div>
        <div><strong>Nombre:</strong> {editData.Nombre}</div>
        <div><strong>Descripción:</strong> {editData.Descripcion || "—"}</div>
        <div><strong>Precio:</strong> {formatPrice(editData.Precio || 0)}</div>
        {editData.Descuento > 0 && (
          <div><strong>Descuento:</strong> {editData.Descuento}%</div>
        )}
        <div>
          <strong>Estado:</strong>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
            }`}>
            {estado}
          </span>
        </div>

        {/* Sección de colores */}
        {parseInt(editData.UsaColores) === 1 && (
          <div className="mt-4">
            <strong className="block mb-2">Colores disponibles:</strong>
            {editData.Colores && editData.Colores.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {editData.Colores.map(color => (
                  <div key={color.ColorId} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.Hex }}
                    />
                    <div>
                      <div className="text-sm font-medium">{color.Nombre}</div>
                      <div className="text-xs text-gray-500">Stock: {color.Stock || 0} unidades</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay colores asignados a este producto</p>
            )}
          </div>
        )}

        <div>
          <strong>Stock:</strong> {editData.Stock || 0} unidades
          {parseInt(editData.UsaColores) === 1 && (
            <span className="ml-2 text-xs text-blue-600">(Stock por color - ver en tabla)</span>
          )}
        </div>
        <div><strong>Categoría:</strong> {categorias.find(c => c.CategoriaId === editData.CategoriaId)?.Nombre || editData.CategoriaId}</div>
        <div>
          <strong>Sistema de colores:</strong>
          <span className="ml-2 text-sm">
            {parseInt(editData.UsaColores) === 1 ? 'Sí' : 'No'}
          </span>
        </div>
      </div>
      {editData.Imagen && (
        <div className="mt-4">
          <p className="font-medium mb-2">Imagen:</p>
          <img
            src={editData.Imagen}
            alt={editData.Nombre}
            className="w-40 h-40 object-cover rounded-lg border"
          />
        </div>
      )}
      <div className="mt-6 flex gap-3">
        <button
          className={`flex-1 py-2 rounded-lg transition-colors ${estado === 'Activo'
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          onClick={goToEdit}
          disabled={estado === 'Inactivo'}
        >
          {estado === 'Activo' ? 'Editar Producto' : 'Solo activos se pueden editar'}
        </button>
        <button
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          onClick={goToBackToList}
        >
          Volver a la lista
        </button>
      </div>
    </div>
  );
};