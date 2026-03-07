import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const TamanosManager = ({ tamanos, setTamanos, disabled, submitted }) => {
    // Estado para la paginación
    const [paginaActual, setPaginaActual] = useState(1);
    const tamanosPorPagina = 5; // Número de tamaños por página

    const agregarTamano = () => {
        const nuevoTamano = {
            id: Date.now(), // ID temporal
            NombreTamano: '',
            Precio: ''
        };
        setTamanos([...tamanos, nuevoTamano]);
        
        // Cuando se agrega un nuevo tamaño, ir a la última página
        const nuevasPaginas = Math.ceil((tamanos.length + 1) / tamanosPorPagina);
        setPaginaActual(nuevasPaginas);
    };

    const eliminarTamano = (index) => {
        const nuevosTamanos = tamanos.filter((_, i) => i !== index);
        setTamanos(nuevosTamanos);
        
        // Ajustar página actual si es necesario
        const nuevasPaginas = Math.ceil(nuevosTamanos.length / tamanosPorPagina);
        if (paginaActual > nuevasPaginas) {
            setPaginaActual(nuevasPaginas || 1);
        }
    };

    const handleTamanoChange = (index, field, value) => {
        const nuevosTamanos = [...tamanos];
        if (field === 'Precio') {
            nuevosTamanos[index][field] = value === '' ? '' : parseFloat(value);
        } else {
            nuevosTamanos[index][field] = value;
        }
        setTamanos(nuevosTamanos);
    };

    // Calcular paginación
    const totalPaginas = Math.ceil(tamanos.length / tamanosPorPagina);
    const inicio = (paginaActual - 1) * tamanosPorPagina;
    const tamanosPaginados = tamanos.slice(inicio, inicio + tamanosPorPagina);

    // Navegación de páginas
    const irPaginaAnterior = () => {
        setPaginaActual(prev => Math.max(1, prev - 1));
    };

    const irPaginaSiguiente = () => {
        setPaginaActual(prev => Math.min(totalPaginas, prev + 1));
    };

    // Componente de paginación
    const Paginacion = () => {
        if (totalPaginas <= 1) return null;

        return (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                    Mostrando {inicio + 1} - {Math.min(inicio + tamanosPorPagina, tamanos.length)} de {tamanos.length} tamaños
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={irPaginaAnterior}
                        disabled={paginaActual === 1}
                        className={`p-1.5 rounded-lg border transition-all ${
                            paginaActual === 1
                                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        title="Página anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                            let pageNum;
                            if (totalPaginas <= 5) {
                                pageNum = i + 1;
                            } else if (paginaActual <= 3) {
                                pageNum = i + 1;
                            } else if (paginaActual >= totalPaginas - 2) {
                                pageNum = totalPaginas - 4 + i;
                            } else {
                                pageNum = paginaActual - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setPaginaActual(pageNum)}
                                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                                        paginaActual === pageNum
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={irPaginaSiguiente}
                        disabled={paginaActual === totalPaginas}
                        className={`p-1.5 rounded-lg border transition-all ${
                            paginaActual === totalPaginas
                                ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        title="Página siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Tamaños del servicio *</h4>
                <button
                    type="button"
                    onClick={agregarTamano}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={16} />
                    Agregar tamaño
                </button>
            </div>

            {tamanos.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No hay tamaños agregados</p>
                    <p className="text-sm text-gray-400 mt-1">Haga clic en "Agregar tamaño" para comenzar</p>
                </div>
            )}

            {tamanos.length > 0 && (
                <>
                    <div className="space-y-3">
                        {tamanosPaginados.map((tamano, index) => {
                            const indexReal = inicio + index;
                            
                            return (
                                <div key={tamano.id || indexReal} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-600 mb-1 block">Nombre del tamaño *</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Pequeño, Mediano, Grande..."
                                            value={tamano.NombreTamano}
                                            onChange={(e) => handleTamanoChange(indexReal, 'NombreTamano', e.target.value)}
                                            className={`w-full h-9 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                                ${submitted && !tamano.NombreTamano?.trim() ? 'border-red-500' : 'border-gray-300'}`}
                                            disabled={disabled}
                                        />
                                        {submitted && !tamano.NombreTamano?.trim() && (
                                            <p className="text-red-500 text-[10px] mt-1">Nombre requerido</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-600 mb-1 block">Precio *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={tamano.Precio}
                                                onChange={(e) => handleTamanoChange(indexReal, 'Precio', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className={`w-full h-9 pl-7 pr-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                                    ${submitted && (!tamano.Precio || parseFloat(tamano.Precio) <= 0) ? 'border-red-500' : 'border-gray-300'}`}
                                                disabled={disabled}
                                            />
                                        </div>
                                        {submitted && (!tamano.Precio || parseFloat(tamano.Precio) <= 0) && (
                                            <p className="text-red-500 text-[10px] mt-1">Precio válido requerido</p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => eliminarTamano(indexReal)}
                                        className="mt-6 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={disabled}
                                        title="Eliminar tamaño"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Componente de paginación */}
                    <Paginacion />
                </>
            )}

            {submitted && tamanos.length === 0 && (
                <p className="text-red-500 text-sm">Debe agregar al menos un tamaño</p>
            )}

            <div className="mt-2 text-xs text-gray-500">
                * Los precios de los tamaños pueden tener descuento aplicado según el porcentaje general del servicio
            </div>
        </div>
    );
};

export default TamanosManager;