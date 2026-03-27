import React from 'react';
import { Store, UserCheck, X, ChevronRight, User } from 'lucide-react';

export const ClienteSection = ({
  tipoCliente,
  clienteSeleccionado,
  formData,
  erroresCliente,
  onTipoClienteChange,
  onClienteChange,
  onAbrirModalClientes,
  onLimpiarCliente,
}) => {
  return (
    <div className="bg-slate-50 p-6 rounded-xl">
      <h4 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
        <User size={20} /> Información del Cliente
      </h4>
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">Tipo de Cliente *</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onTipoClienteChange('walkin')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${
              tipoCliente === 'walkin'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Store size={24} className="mb-2" />
            <div className="font-medium">Cliente Walk-in</div>
          </button>
          <button
            type="button"
            onClick={() => onTipoClienteChange('registrado')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex flex-col items-center ${
              tipoCliente === 'registrado'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserCheck size={24} className="mb-2" />
            <div className="font-medium">Cliente Registrado</div>
          </button>
        </div>
      </div>

      {tipoCliente === 'registrado' ? (
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cliente Registrado *</label>
            {clienteSeleccionado ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-green-800">Cliente seleccionado:</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">{formData.ClienteNombre}</span>
                      {formData.ClienteTelefono && ` - ${formData.ClienteTelefono}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onLimpiarCliente}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onAbrirModalClientes}
                className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Buscar cliente registrado</div>
                    <div className="text-sm text-slate-500">Seleccionar del sistema</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cliente *</label>
            <input
              type="text"
              value={formData.ClienteNombre}
              onChange={(e) => onClienteChange('ClienteNombre', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                erroresCliente.nombre ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="Nombre completo"
            />
            {erroresCliente.nombre && <p className="text-red-500 text-xs mt-1">{erroresCliente.nombre}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
            <input
              type="tel"
              value={formData.ClienteTelefono}
              onChange={(e) => onClienteChange('ClienteTelefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                erroresCliente.telefono ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="10 dígitos"
              maxLength="10"
            />
            {erroresCliente.telefono && <p className="text-red-500 text-xs mt-1">{erroresCliente.telefono}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico *</label>
            <input
              type="email"
              value={formData.ClienteCorreo}
              onChange={(e) => onClienteChange('ClienteCorreo', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                erroresCliente.correo ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="cliente@ejemplo.com"
            />
            {erroresCliente.correo && <p className="text-red-500 text-xs mt-1">{erroresCliente.correo}</p>}
          </div>
        </div>
      )}
    </div>
  );
};