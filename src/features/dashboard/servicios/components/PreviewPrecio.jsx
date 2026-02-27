import React from "react";

export const PreviewPrecio = ({ precio, descuento }) => {
    if (!precio || !descuento || parseFloat(descuento) <= 0) return null;

    const precioFinal = parseFloat(precio) * (1 - parseFloat(descuento) / 100);

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

    return (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
                Precio original: <span className="line-through">${formatPrice(precio)}</span>
            </p>
            <p className="text-lg font-bold text-green-600">
                Precio final: ${precioFinal.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Descuento aplicado: {descuento}%</p>
        </div>
    );
};