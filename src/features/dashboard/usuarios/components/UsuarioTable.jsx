import React from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, Trash2 } from "lucide-react";

export const UsuarioTable = ({
  paginatedData,
  tiposDocumento,
  onEdit,
  onView,
  onDelete
}) => {
  return (
    <div className="overflow-x-visible">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
          <tr>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Tipo documento</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Cédula</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Nombre</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Dirección</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Correo</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Teléfono</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Rol</th>
            <th className="py-4 px-4 text-sm font-semibold text-white uppercase tracking-wider w-1/8">Acciones</th>
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
                    <Link onClick={() => onEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={16} />
                    </Link>
                    <Link onClick={() => onView(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <Eye size={16} />
                    </Link>
                    <Link onClick={() => onDelete(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-4 text-slate-500">
                No se encontraron usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};