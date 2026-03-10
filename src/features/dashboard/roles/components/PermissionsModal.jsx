import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

export const PermissionsModal = ({
  editData,
  allPermissions,
  permissionsByModule,
  selectedPermissions,
  onPermissionToggle,
  onSelectAllModule,
  onSelectAllPermissions,
  onSave,
  onClose
}) => {
  const [expandedModules, setExpandedModules] = useState([]);

  useEffect(() => {
    setExpandedModules(Object.keys(permissionsByModule));
  }, [permissionsByModule]);

  const totalSelected = selectedPermissions.length;
  const totalPermissions = allPermissions.length;
  const allSelected = totalSelected === totalPermissions;

  const toggleModule = (module) => {
    setExpandedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const sidebarSections = [
    { name: 'Medición y Desempeño', modules: ['Dashboard'] },
    { name: 'Configuración', modules: ['Roles'] },
    { name: 'Usuarios', modules: ['Usuarios'] },
    { name: 'Compras', modules: ['Categorias', 'Productos', 'Insumos'] },
    { name: 'Ventas', modules: ['Servicios', 'Clientes', 'Ventas'] }
  ];

  if (!editData) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className="mb-5 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Permisos para: <span className="text-blue-600">{editData.Nombre}</span>
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${totalSelected > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600 font-medium">
            {totalSelected} de {totalPermissions} permisos seleccionados
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={onSelectAllPermissions}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            allSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
        <button
          type="button"
          onClick={() => onSelectAllPermissions(true)}
          className="px-4 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Limpiar
        </button>
      </div>

      {/* Lista de permisos */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {sidebarSections.map((section) => {
          const sectionModules = section.modules.filter(module => permissionsByModule[module]);
          if (sectionModules.length === 0) return null;

          return (
            <div key={section.name} className="mb-5 last:mb-0">
              {sectionModules.length > 1 && (
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">{section.name}</span>
                </div>
              )}

              {sectionModules.map((modulo) => {
                const modulePermisos = permissionsByModule[modulo];
                const moduleSelectedCount = modulePermisos.filter(p => selectedPermissions.includes(p.PermisoId)).length;
                const isModuleExpanded = expandedModules.includes(modulo);
                const moduleAllSelected = moduleSelectedCount === modulePermisos.length;

                const moduleName = modulo === 'Insumos'
                  ? 'Proveedores y Compras'
                  : modulo === 'Ventas' && section.name === 'Ventas'
                    ? 'Pedidos y Ventas'
                    : modulo;

                return (
                  <div key={modulo} className="mb-3 last:mb-0">
                    <div
                      className="flex items-center justify-between py-2 cursor-pointer group"
                      onClick={() => toggleModule(modulo)}
                    >
                      <div className="flex items-center gap-2">
                        {isModuleExpanded ? (
                          <ChevronUp size={16} className="text-gray-500 group-hover:text-gray-700" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500 group-hover:text-gray-700" />
                        )}
                        <span className="font-medium text-gray-800">{moduleName}</span>
                        {moduleSelectedCount > 0 && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            moduleAllSelected ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {moduleSelectedCount}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAllModule(modulo);
                        }}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          moduleAllSelected
                            ? 'text-green-700 bg-green-100 hover:bg-green-200'
                            : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        {moduleAllSelected ? 'Todos' : 'Seleccionar'}
                      </button>
                    </div>

                    {isModuleExpanded && (
                      <div className="mt-2 space-y-1.5 pl-6">
                        {modulePermisos.map((permiso) => {
                          const isSelected = selectedPermissions.includes(permiso.PermisoId);
                          return (
                            <div
                              key={permiso.PermisoId}
                              className={`flex items-center py-1.5 px-2 rounded cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => onPermissionToggle(permiso.PermisoId)}
                            >
                              <div className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center mr-2 ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 bg-white hover:border-blue-400'
                              }`}>
                                {isSelected && <Check size={10} className="text-white" />}
                              </div>
                              <div className="flex-1">
                                <div className={`text-sm ${isSelected ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                                  {permiso.Nombre}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
        <button
          type="button"
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={onSave}
        >
          Guardar permisos
        </button>
        <button
          type="button"
          className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};