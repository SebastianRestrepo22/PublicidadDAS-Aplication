import { Edit, Eye, Trash2 } from "lucide-react";
import { Pagination } from "../../../components/paginacion/pagination";

const getShortId = (id) => {
  const str = String(id || "");
  return str.length > 3 ? str.substring(0, 3) : str;
};

export const ProveedorTable = ({
  proveedores,
  estadoActivos,
  onEditar,
  onVer,
  onEliminar,
  onToggleEstado,
  pagination,
  onPageChange,
  onItemsPerPageChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800">
            <tr>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">ID</th>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-left">Nombre</th>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">NIT</th>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Teléfono</th>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Correo</th>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Estado</th>
              <th className="py-2.5 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold text-white uppercase tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {proveedores.length > 0 ? (
              proveedores.map((p) => (
                <tr key={p.ProveedorId} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle font-mono">
                    {getShortId(p.ProveedorId)}
                  </td>
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 align-middle">
                    {p.NombreProveedor}
                  </td>
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                    {p.Nit || '-'}
                  </td>
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                    {p.Telefono}
                  </td>
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                    {p.Correo}
                  </td>
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm font-medium text-slate-900 text-center align-middle">
                    <label className="inline-flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={estadoActivos[p.ProveedorId] === 1}
                          onChange={(e) => onToggleEstado(p.ProveedorId, estadoActivos[p.ProveedorId])}
                        />
                        <div className="w-10 h-5 rounded-full bg-gray-300 peer-checked:bg-green-500 transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-2 text-xs text-slate-700">
                        {estadoActivos[p.ProveedorId] === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </label>
                  </td>
                  <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-center align-middle">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => onEditar(p)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                        title="Editar"
                      >
                        <Edit size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onVer(p)}
                        className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                        title="Ver"
                      >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onEliminar(p)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                        title="Eliminar"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-4 sm:py-6 text-center text-gray-500 text-sm sm:text-base">
                  No se encontraron proveedores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalItems > 0 && (
        <div className="px-6 py-4 border-t border-slate-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={pagination.totalItems}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProveedorTable;