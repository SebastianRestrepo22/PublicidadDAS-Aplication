import React from "react";
import { User } from "lucide-react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";

export const ClientSelector = ({
  isOpen,
  onClose,
  onSelect,
  clientes = [],
  searchTerm,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 5
}) => {
  // Aplicar búsqueda
  const filteredClientes = searchTerm
    ? clientes.filter(c => {
        const term = searchTerm.toLowerCase();
        return (
          (c.NombreCompleto || c.Nombre || "").toLowerCase().includes(term) ||
          (c.Telefono || "").toLowerCase().includes(term) ||
          (c.CorreoElectronico || c.Email || "").toLowerCase().includes(term)
        );
      })
    : clientes;

  // Paginación
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPagesCalculated = Math.ceil(filteredClientes.length / itemsPerPage);

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Cliente"
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      currentPage={currentPage}
      totalPages={totalPagesCalculated}
      onPageChange={onPageChange}
      totalItems={filteredClientes.length}
      itemsPerPage={itemsPerPage}
    >
      <div className="space-y-2">
        {paginatedClientes.map((cliente) => (
          <button
            key={cliente.CedulaId || cliente.ClienteId || cliente.id}
            onClick={() => onSelect(cliente)}
            className="w-full p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{cliente.NombreCompleto || cliente.Nombre}</div>
                <div className="text-sm text-slate-500">
                  {cliente.Telefono && <span className="mr-3">📞 {cliente.Telefono}</span>}
                  {cliente.CorreoElectronico && <span>✉️ {cliente.CorreoElectronico}</span>}
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {paginatedClientes.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No hay clientes disponibles
          </div>
        )}
      </div>
    </ModalPaginado>
  );
};