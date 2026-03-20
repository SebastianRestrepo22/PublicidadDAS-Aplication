import React from 'react';
import { Edit, Eye, Shield, Trash2 } from 'lucide-react';
import { Toggle } from './Toggle';

export const RolTable = ({
  roles,
  onEdit,
  onPermissions,
  onView,
  onDelete,
  onToggleEstado
}) => {
  if (roles.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <p className="text-lg font-medium">No se encontraron roles</p>
          <p className="text-sm mt-1">Intenta con otros filtros o crea un nuevo rol</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
          <tr>
            <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">ID</th>
            <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Nombre</th>
            <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider">Estado</th>
            <th className="py-4 px-6 text-sm font-semibold text-white uppercase tracking-wider text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {roles.map((rol) => (
            <tr key={rol.RoleId} className="hover:bg-slate-50 transition-colors duration-150">
              <td className="py-4 px-6 text-sm text-slate-900 font-mono">
                {String(rol.RoleId).slice(0, 3)}
              </td>
              <td className="py-4 px-6 text-sm text-slate-900 font-medium">{rol.Nombre}</td>
              <td className="py-4 px-6">
                <div className="flex justify-center">
                  <Toggle
                    checked={rol.Estado === "Activo"}
                    onChange={(value) => onToggleEstado(
                      rol.RoleId,
                      value ? "Activo" : "Inactivo",
                      rol.Nombre, 
                      rol.IsSystem  
                    )}
                  />
                </div>
              </td>
              <td className="py-4 px-6">
                <div className="flex justify-center gap-1">
                  <button
                    onClick={() => onEdit(rol)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onPermissions(rol)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Permisos"
                  >
                    <Shield size={16} />
                  </button>
                  <button
                    onClick={() => onView(rol)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(rol)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};