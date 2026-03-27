import React from 'react';
import { Search } from 'lucide-react';
import Modal from '../../../components/modals/modal.jsx';

export const ModalSeleccionarCliente = ({
  open,
  onClose,
  busqueda,
  onBusquedaChange,
  clientesFiltrados,
  onSeleccionarCliente,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-[600px] p-6">
        <h3 className="text-lg font-bold mb-4">Seleccionar Cliente</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map(cliente => (
              <button
                key={cliente.CedulaId || cliente.id}
                onClick={() => onSeleccionarCliente(cliente)}
                className="w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
              >
                <div className="font-medium">{cliente.NombreCompleto || cliente.nombre}</div>
                <div className="text-xs text-slate-500 mt-1 flex gap-3">
                  {cliente.Telefono && <span>📞 {cliente.Telefono}</span>}
                  {cliente.CorreoElectronico && <span>✉️ {cliente.CorreoElectronico}</span>}
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-slate-500 py-4">
              {busqueda ? "No hay clientes que coincidan" : "No hay clientes disponibles"}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};