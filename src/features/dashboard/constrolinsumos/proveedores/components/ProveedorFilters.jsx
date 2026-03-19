import { Search, Plus } from "lucide-react";

export const ProveedorFilters = ({
  busqueda,
  setBusqueda,
  campoFiltro,
  setCampoFiltro,
  onNuevoProveedor
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
        <button
          onClick={onNuevoProveedor}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm sm:text-base"
        >
          <Plus size={18} /> Nuevo proveedor
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-slate-300 rounded-lg pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 text-sm sm:text-base"
          />
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={campoFiltro}
            onChange={(e) => setCampoFiltro(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] text-sm sm:text-base"
          >
            <option value="">Filtrar por campo</option>
            <option value="ProveedorId">ID</option>
            <option value="nombre">Nombre</option>
            <option value="nit">NIT</option>
            <option value="telefono">Teléfono</option>
            <option value="correo">Correo</option>
            <option value="direccion">Dirección</option>
            <option value="estado">Estado</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProveedorFilters;