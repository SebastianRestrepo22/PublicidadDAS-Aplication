import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const TamanosManager = ({ tamanos, setTamanos, disabled, submitted }) => {
    
    const agregarTamano = () => {
        const nuevoTamano = {
            id: Date.now(), // ID temporal
            NombreTamano: '',
            Precio: ''
        };
        setTamanos([...tamanos, nuevoTamano]);
    };

    const eliminarTamano = (index) => {
        const nuevosTamanos = tamanos.filter((_, i) => i !== index);
        setTamanos(nuevosTamanos);
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
                <div className="space-y-3">
                    {tamanos.map((tamano, index) => (
                        <div key={tamano.id || index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex-1">
                                <label className="text-xs text-gray-600 mb-1 block">Nombre del tamaño *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Pequeño, Mediano, Grande..."
                                    value={tamano.NombreTamano}
                                    onChange={(e) => handleTamanoChange(index, 'NombreTamano', e.target.value)}
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
                                        onChange={(e) => handleTamanoChange(index, 'Precio', e.target.value)}
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
                                onClick={() => eliminarTamano(index)}
                                className="mt-6 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                disabled={disabled}
                                title="Eliminar tamaño"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
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