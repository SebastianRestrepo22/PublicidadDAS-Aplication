import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, User, AlertCircle } from "lucide-react";
import { Pagination } from "../../components/paginacion/pagination";

export const ClientSelector = ({ goToBack, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const buscarClientes = async (search = "", page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/user/search?search=${encodeURIComponent(search)}&page=${page}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setClientes(data.clientes || []);
        setTotalPages(data.pages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Error buscando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarClientes("", 1);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={goToBack} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h3 className="text-lg font-bold">Seleccionar Cliente</h3>
          <p className="text-slate-600 text-sm">Busque y seleccione un cliente del sistema</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              buscarClientes(e.target.value, 1);
            }}
            placeholder="Buscar por cédula, nombre..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Cargando clientes...</p>
        </div>
      ) : clientes.length > 0 ? (
        <div className="space-y-3">
          {clientes.map((cliente) => (
            <button
              key={cliente.CedulaId || cliente.id}
              onClick={() => onSelect(cliente)}
              className="w-full p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{cliente.NombreCompleto || "Sin nombre"}</div>
                  <div className="text-sm text-slate-600">Cédula: {cliente.CedulaId || "—"}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-slate-700">No se encontraron clientes</h4>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => buscarClientes(searchTerm, page)}
            itemsPerPage={5}
          />
        </div>
      )}
    </div>
  );
};