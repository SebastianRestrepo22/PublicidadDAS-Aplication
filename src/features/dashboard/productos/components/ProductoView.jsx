import React from "react";
import { Check } from "lucide-react";

export const ProductoView = ({
  editData,
  categorias,
  coloresConStock,
  goToEdit,
  goToBackToList
}) => {
  if (!editData) return <div>Cargando...</div>;

  const stockTotal = coloresConStock.reduce((sum, c) => sum + (c.Stock || 0), 0);

  return (
    <div className="text-left space-y-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-black text-gray-800 mb-4">Detalles del Producto</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><strong>ID:</strong> {editData.ProductoId}</div>
        <div><strong>Nombre:</strong> {editData.Nombre}</div>
        <div><strong>Descripción:</strong> {editData.Descripcion || "—"}</div>
        <div><strong>Precio:</strong> ${parseFloat(editData.Precio || 0).toFixed(2)}</div>
        {editData.Descuento > 0 && (
          <div><strong>Descuento:</strong> {editData.Descuento}%</div>
        )}
        <div><strong>Stock total:</strong> {stockTotal} unidades</div>
        <div>
          <strong>Colores con stock:</strong>
          {coloresConStock.length > 0 ? (
            <div className="mt-2 space-y-2">
              {coloresConStock.map(c => (
                <div key={c.ColorId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: c.Hex }}
                      title={c.Nombre}
                    />
                    <span>{c.Nombre}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${c.Stock === 0 ? 'bg-red-100 text-red-800' :
                    c.Stock < 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {c.Stock} unidades
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 ml-2">No tiene colores asignados</span>
          )}
        </div>
        <div><strong>Categoría:</strong> {categorias.find(c => c.CategoriaId === editData.CategoriaId)?.Nombre || editData.CategoriaId}</div>
        <div>
          <strong>Colores:</strong>
          <div className="flex gap-2 mt-2">
            {coloresConStock.length > 0 ? (
              coloresConStock.map(c => (
                <span
                  key={c.ColorId}
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: c.Hex }}
                  title={c.Nombre}
                />
              ))
            ) : (
              <span className="text-gray-400">No tiene colores asignados</span>
            )}
          </div>
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
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={goToEdit}
        >
          Editar Producto
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