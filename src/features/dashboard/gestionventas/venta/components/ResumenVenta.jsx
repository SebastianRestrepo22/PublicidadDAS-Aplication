import React from 'react';

const formatPrice = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return `${currency}0`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${currency}0`;
  return `${currency} ${Math.round(num).toLocaleString('es-CO')}`;
};

export const ResumenVenta = ({ tipoCliente, subtotal, iva, total }) => {
  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h4 className="font-semibold text-slate-800 mb-2">Resumen de la Venta</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Tipo de cliente:</span>
              <span className="font-medium">{tipoCliente === 'registrado' ? 'Cliente Registrado' : 'Cliente Walk-in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">IVA (19%):</span>
              <span className="font-medium">{formatPrice(iva)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-slate-800 font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-700">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};