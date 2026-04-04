import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import HelpModal from '../../../components/modals/HelpModal';

export const VentasFilters = ({
  campoFiltro,
  filtroValor,
  setCampoFiltro,
  setFiltroValor,
  onLimpiarFiltros,
}) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const helpVideos = [
    { key: "create", label: "Crear una venta", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=32._Crear_venta_n8gtgh" },
    { key: "rechazar", label: "Rechazar una venta", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=33._Rechazar_venta_sb34gy" },
    { key: "pagada", label: "Pagar una venta", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=34._Poner_venta_pagada_ijsum6" },
    { key: "anular", label: "Anular una venta", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=35._Anular_venta_tsevt4" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <button
          onClick={() => navigate("/dashboard/ventas/crear")}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap text-sm"
        >
          <Plus size={18} /> Nueva venta
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          {campoFiltro === "Estado" ? (
            <select
              value={filtroValor}
              onChange={(e) => { setFiltroValor(e.target.value); }}
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="anulado">Anulado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
            </select>
          ) : campoFiltro === "Origen" ? (
            <select
              value={filtroValor}
              onChange={(e) => { setFiltroValor(e.target.value); }}
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="">Todos los orígenes</option>
              <option value="pedido">Desde Pedido</option>
              <option value="manual">Venta Manual</option>
            </select>
          ) : (
            <input
              value={filtroValor}
              onChange={(e) => setFiltroValor(e.target.value)}
              type="text"
              placeholder={campoFiltro ? `Buscar por ${campoFiltro}` : "Seleccione un campo para buscar"}
              disabled={!campoFiltro}
              className="border border-slate-300 rounded-lg pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          )}
        </div>

        <select
          value={campoFiltro}
          onChange={(e) => { setCampoFiltro(e.target.value); setFiltroValor(''); }}
          className="border border-slate-300 rounded-lg px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
        >
          <option value="">Filtrar por Campo</option>
          <option value="VentaId">ID Venta</option>
          <option value="PedidoClienteId">ID Pedido</option>
          <option value="ClienteNombre">Cliente</option>
          <option value="Estado">Estado</option>
          <option value="Origen">Origen</option>
        </select>

        {(campoFiltro || filtroValor) && (
          <button
            onClick={onLimpiarFiltros}
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 whitespace-nowrap"
          >
            <X size={16} />Limpiar filtros
          </button>
        )}

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