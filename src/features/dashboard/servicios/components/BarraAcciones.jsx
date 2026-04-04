import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import HelpModal from "../../components/modals/HelpModal";

export const BarraAcciones = ({
    onNewClick,
    filtroEstado,
    setFiltroEstado,
    filtroValor,
    setFiltroValor,
    filtroCampo,
    setFiltroCampo
}) => {
    const [open, setOpen] = useState(false);
    const helpVideos = [
        { key: "create", label: "Crear un servicio", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=23._Crear_servicio_rrtqco" },
        { key: "status", label: "Cambiar el estado de un servicio", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=24._Cambiar_el_estado_del_servicio_kzbs04" },
        { key: "update", label: "Editar un servicio", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=25._Editar_servicio_haj9bz" },
        { key: "delete", label: "Eliminar un servicio", url: "https://player.cloudinary.com/embed/?cloud_name=dosxzk3sr&public_id=26._Eliminar_servicio_rs9cws" },
    ];
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
                <option value="categoria">Categoría</option>
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
    );
};