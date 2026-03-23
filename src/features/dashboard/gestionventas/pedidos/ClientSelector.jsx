import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";
import { getAllClientes, buscarClientes } from "../pedidos/services/services.pedidosClientes";

export const ClientSelector = ({
  isOpen,
  onClose,
  onSelect,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  totalItems: externalTotalItems,
  itemsPerPage = 5
}) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [totalPages, setTotalPages] = useState(externalTotalPages || 1);
  const [totalItems, setTotalItems] = useState(externalTotalItems || 0);

  // 🔥 FUNCIÓN PARA CARGAR CLIENTES
  const cargarClientes = async () => {
    try {
      setLoading(true);
      
      let resultado;
      if (searchTerm) {
        // Si hay término de búsqueda, usar búsqueda
        resultado = await buscarClientes('nombre', searchTerm, currentPage, itemsPerPage);
      } else {
        // Si no, obtener todos con paginación
        resultado = await getAllClientes(currentPage, itemsPerPage);
      }
      
      setClientes(resultado.data || []);
      setTotalPages(resultado.pagination?.totalPages || 1);
      setTotalItems(resultado.pagination?.totalItems || 0);
      
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setClientes([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarClientes();
    }
  }, [isOpen, currentPage, searchTerm]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Resetear a primera página al buscar
    if (externalOnSearchChange) {
      externalOnSearchChange(term);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (externalOnPageChange) {
      externalOnPageChange(page);
    }
  };

  return (
    <ModalPaginado
      isOpen={isOpen}
      onClose={onClose}
      titulo="Seleccionar Cliente"
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      loading={loading}
    >
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Cargando clientes...</p>
          </div>
        ) : (
          <>
            {clientes.map((cliente) => (
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
            
            {!loading && clientes.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
              </div>
            )}
          </>
        )}
      </div>
    </ModalPaginado>
  );
};