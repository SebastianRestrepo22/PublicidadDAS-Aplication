import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import HelpModal from "../../components/modals/HelpModal";

export const UsuarioFilters = ({
  filtroCampo,
  filtroValor,
  setFiltroCampo,
  setFiltroValor,
  onNewUser
}) => {
  const [open, setOpen] = useState(false);
    const helpVideos = [
      { key: "create", label: "Crear usuario", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=8._Crear_un_usuario_imlnes" },
      { key: "update", label: "Editar usuario", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=9._Editar_usuario_oo7b1d" },
      { key: "delete", label: "Eliminar usuario", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=10._Eliminar_usuarios_sezui2" },
    ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Link
          onClick={onNewUser}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg"
        >
          <Plus size={18} /> Nuevo usuario
        </Link>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={filtroValor}
            onChange={(e) => setFiltroValor(e.target.value)}
            type="text"
            placeholder="Buscar usuarios"
            className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
          />
        </div>

        <select
          value={filtroCampo}
          onChange={(e) => setFiltroCampo(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
        >
          <option value="">Filtrar por campo</option>
          <option value="tipoDocumento">Tipo de documento</option>
          <option value="cedula">Cédula</option>
          <option value="nombre">Nombre</option>
          <option value="direccion">Dirección</option>
          <option value="correo">Correo</option>
          <option value="telefono">Telefono</option>
          <option value="rol">Rol</option>
        </select>

        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        >
          ?
        </button>
        <HelpModal
          isOpen={open}
          onClose={() => setOpen(false)}
          videos={helpVideos}
        />
      </div>
    </div>
  );
};