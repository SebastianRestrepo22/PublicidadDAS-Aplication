import React from 'react';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Pagination } from '../../components/paginacion/pagination.jsx';

export const ClienteTable = ({
  paginatedData,
  tiposDocumento,
  cargando,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}) => {
  if (cargando) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-3 text-slate-600">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-visible">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
            <tr>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Tipo documento</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Cédula</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Nombre</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Dirección</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Correo</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Teléfono</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Rol</th>
              <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((u) => (
                <tr key={u.CedulaId} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[120px]">
                    {tiposDocumento.find(tipo => tipo.TipoDocumentoId === u.TipoDocumentoId)?.Nombre || u.TipoDocumentoId}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-900">{u.CedulaId}</td>
                  <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[150px]">{u.NombreCompleto}</td>
                  <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[150px]">{u.Direccion}</td>
                  <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[180px]">{u.CorreoElectronico}</td>
                  <td className="py-4 px-4 text-sm text-slate-900">{u.Telefono}</td>
                  <td className="py-4 px-4 text-sm text-slate-900 truncate max-w-[120px]">{u.RolNombre}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onView(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => onDelete(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-slate-500">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginatedData && paginatedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};