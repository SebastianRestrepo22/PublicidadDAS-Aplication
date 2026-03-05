import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, User, AlertCircle } from "lucide-react";
import { Pagination } from "../../components/paginacion/pagination";

export const ClientSelector = ({ goToBack, onSelect, clientes = [] }) => { //  RECIBIR CLIENTES
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!clientes || clientes.length === 0) {
      setFilteredClientes([]);
      setTotalPages(1);
      return;
    }

    // Filtrar localmente por el término de búsqueda
    let filtered = clientes;
    if (searchTerm) {
      filtered = clientes.filter(cliente => 
        (cliente.NombreCompleto || cliente.Nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.CedulaId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.Telefono || "").includes(searchTerm) ||
        (cliente.Email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calcular páginas
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Paginar
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(start, start + itemsPerPage);
    setFilteredClientes(paginatedData);
    
  }, [searchTerm, clientes, currentPage]);

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset a primera página al buscar
  };

  // Si no hay clientes, mostrar mensaje
  if (!clientes || clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={goToBack} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-lg font-bold">Seleccionar Cliente</h3>
          </div>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-slate-700">No hay clientes disponibles</h4>
          <p className="text-slate-500 mt-2">Agrega clientes desde el módulo de clientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goToBack} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="text-lg font-bold">Seleccionar Cliente</h3>
          <p className="text-slate-600 text-sm">
            {clientes.length} clientes disponibles
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por cédula, nombre, teléfono o email..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredClientes.length > 0 ? (
        <>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {filteredClientes.map((cliente) => (
              <button
                key={cliente.CedulaId || cliente.ClienteId || cliente.id}
                onClick={() => {
                  console.log('✅ Cliente seleccionado:', cliente);
                  onSelect(cliente);
                }}
                className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-left transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">
                      {cliente.NombreCompleto || cliente.Nombre || "Sin nombre"}
                    </div>
                    <div className="text-sm text-slate-600">
                      Cédula: {cliente.CedulaId || cliente.Identificacion || "—"}
                    </div>
                    {cliente.Telefono && (
                      <div className="text-sm text-slate-500"> {cliente.Telefono}</div>
                    )}
                    {cliente.Email && (
                      <div className="text-sm text-slate-500 truncate">✉️ {cliente.Email}</div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-slate-700">No se encontraron clientes</h4>
          <p className="text-slate-500 mt-2">
            {searchTerm ? `No hay resultados para "${searchTerm}"` : "No hay clientes registrados"}
          </p>
        </div>
      )}
    </div>
  );
};