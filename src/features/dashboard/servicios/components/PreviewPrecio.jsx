import React from "react";

export const PreviewPrecio = ({ precio, descuento }) => {
    if (!precio || !descuento || parseFloat(descuento) <= 0) return null;

    const precioFinal = parseFloat(precio) * (1 - parseFloat(descuento) / 100);

    return (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
                Precio original: <span className="line-through">${parseFloat(precio).toFixed(2)}</span>
            </p>
            <p className="text-lg font-bold text-green-600">
                Precio final: ${precioFinal.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Descuento aplicado: {descuento}%</p>
        </div>
    );
};