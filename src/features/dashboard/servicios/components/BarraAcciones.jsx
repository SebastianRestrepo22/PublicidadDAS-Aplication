import React from "react";
import { Plus, Search } from "lucide-react";

export const BarraAcciones = ({
    onNewClick,
    filtroEstado,
    setFiltroEstado,
    filtroValor,
    setFiltroValor,
    filtroCampo,
    setFiltroCampo
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex flex-wrap gap-4 items-center">
            <button
                onClick={onNewClick}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
                <Plus size={18} />
                Nuevo servicio
            </button>

            <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="border rounded-lg px-4 py-3 bg-white min-w-[150px]"
            >
                <option value="">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Inactivo">Inactivos</option>
            </select>

            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    value={filtroValor}
                    onChange={(e) => setFiltroValor(e.target.value)}
                    placeholder="Buscar servicio..."
                    className="border rounded-lg pl-10 pr-4 py-3 w-full"
                />
            </div>

            <select
                value={filtroCampo}
                onChange={(e) => setFiltroCampo(e.target.value)}
                className="border rounded-lg px-4 py-3 bg-white min-w-[180px]"
            >
                <option value="">Filtrar por...</option>
                <option value="nombre">Nombre</option>
                <option value="descripcion">Descripción</option>
                <option value="precio">Precio</option>
                <option value="descuento">Descuento</option>
                <option value="categoria">Categoría</option>
                <option value="estado">Estado</option>
            </select>
        </div>
    );
};