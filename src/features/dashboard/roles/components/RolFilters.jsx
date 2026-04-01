import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useState } from "react";
import HelpModal from '../../components/modals/HelpModal';

export const RolFilters = ({
  filtroCampo,
  setFiltroCampo,
  filtroValor,
  setFiltroValor,
  onNewRol
}) => {
  const [open, setOpen] = useState(false);
  const helpVideos = [
    { key: "create", label: "Crear rol", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=3._Crear_rol_fikdi4" },
    { key: "status", label: "Cambiar el estado", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=4._Cambio_de_estado_en_el_rol_gpovo6" },
    { key: "update", label: "Editar rol", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=5._editar_rol_idx2ai" },
    { key: "asing", label: "Asignar permisos", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=6._Asignar_permisos_hhlkkf" },
    { key: "delete", label: "Eliminar rol", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=7._Eliminar_rol_xrmawb" },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Link
          onClick={onNewRol}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
        >
          <Plus size={18} /> Nuevo rol
        </Link>

        {filtroCampo === "estado" ? (
          <select
            value={filtroValor}
            onChange={(e) => setFiltroValor(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[160px]"
          >
            <option value="">Seleccionar estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        ) : (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={filtroValor}
              onChange={(e) => setFiltroValor(e.target.value)}
              type="text"
              placeholder="Buscar roles"
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
            />
          </div>
        )}

        <select
          value={filtroCampo}
          onChange={(e) => setFiltroCampo(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
        >
          <option value="">Filtrar por campo</option>
          <option value="nombre">Nombre</option>
          <option value="estado">Estado</option>
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