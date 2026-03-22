import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { ModalPaginado } from "../../components/modals/ModalPaginado";
import { formatPrice } from "../pedidos/utils/pedidosHelpers";
import { GetDataservicios, buscarservicios } from "../../servicios/services/services.servicios";

export const ServicioSelector = ({
  isOpen,
  onClose,
  onSelect,
  servicios: initialServicios = [], 
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  totalItems: externalTotalItems,
  itemsPerPage = 5
}) => {
  // Estados internos para manejar la paginación
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || "");
  const [currentPage, setCurrentPage] = useState(externalCurrentPage || 1);
  const [totalPages, setTotalPages] = useState(externalTotalPages || 1);
  const [totalItems, setTotalItems] = useState(externalTotalItems || 0);

  // Cargar servicios cuando se abre el modal o cambian los filtros
  useEffect(() => {
    if (isOpen) {
      cargarServicios();
    }
  }, [isOpen, currentPage, searchTerm]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      
      let resultado;
      if (searchTerm) {
        // Si hay término de búsqueda, usar búsqueda
        resultado = await buscarservicios('nombre', searchTerm, currentPage, itemsPerPage, 'Activo');
      } else {
        // Si no, obtener todos los activos con paginación
        resultado = await GetDataservicios(true, currentPage, itemsPerPage);
      }
      
      setServicios(resultado.data);
      setTotalPages(resultado.pagination.totalPages);
      setTotalItems(resultado.pagination.totalItems);
      
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

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
      titulo="Seleccionar Servicio"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Cargando servicios...</p>
          </div>
        ) : (
          <>
            {servicios.map((servicio) => (
              <button
                key={servicio.ServicioId}
                onClick={() => onSelect(servicio)}
                className="w-full p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  {servicio.Imagen ? (
                    <img 
                      src={servicio.Imagen} 
                      alt={servicio.Nombre} 
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        // Fallback cuando la imagen no carga
                        const parent = e.target.parentNode;
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-12 h-12 bg-purple-100 rounded flex items-center justify-center';
                        fallbackDiv.innerHTML = '<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4v10l8 4 8-4V7z"></path></svg>';
                        parent.appendChild(fallbackDiv);
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center">
                      <Package size={24} className="text-purple-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{servicio.Nombre}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                        Servicio
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {formatPrice(servicio.Precio || 0)}
                      </span>
                    </div>
                    {servicio.RequiereImagen === 1 && (
                      <span className="text-xs text-amber-600 ml-2">
                        ⚠️ Requiere imagen
                      </span>
                    )}
                    {servicio.Descripcion && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {servicio.Descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            {!loading && servicios.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {searchTerm ? 'No se encontraron servicios' : 'No hay servicios disponibles'}
              </div>
            )}
          </>
        )}
      </div>
    </ModalPaginado>
  );
};