import React from "react";
import { ChevronDown } from "lucide-react";
import { PreviewPrecio } from "./PreviewPrecio";
import TamanosManager from "./TamanosManager";

export const FormularioServicio = ({
    mode,
    values,
    setValues,
    tamanos,
    setTamanos,
    estadoEdit,
    setEstadoEdit,
    submitted,
    nombreError,
    isSubmitting,
    handleChanges,
    handleNombreBlur,
    handleSubmit,
    onCancel,
    abrirModalCategorias,
    obtenerNombreCategoria
}) => {
    const isEditing = mode === "edit";
    const buttonLabel = isEditing ? "Editar Servicio" : "Crear Servicio";
    const estados = ["Activo", "Inactivo"];

    const handleEstadoChange = (e) => setEstadoEdit(e.target.value);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Información básica</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre - CON VALIDACIÓN VISUAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input
                            type="text"
                            name="Nombre"
                            value={values.Nombre || ""}
                            onChange={handleChanges}
                            onBlur={handleNombreBlur}
                            className={`w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${submitted && (!values.Nombre?.trim() || nombreError) ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        />
                        {submitted && !values.Nombre?.trim() && (
                            <p className="text-red-500 text-xs mt-1">Ingrese el nombre</p>
                        )}
                        {nombreError && (
                            <p className="text-red-500 text-xs mt-1">{nombreError}</p>
                        )}
                    </div>

                    {/* Tipo de Precio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Precio *</label>
                        <select
                            name="TipoPrecio"
                            value={values.TipoPrecio}
                            onChange={handleChanges}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isEditing || isSubmitting}
                        >
                            <option value="UNICO">Precio Único</option>
                            <option value="POR_TAMANO">Por Tamaño</option>
                        </select>
                        {isEditing && (
                            <p className="text-xs text-gray-500 mt-1">* No se puede cambiar el tipo de precio</p>
                        )}
                    </div>

                    {/* Descripción - CON VALIDACIÓN VISUAL */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                        <textarea
                            name="Descripcion"
                            value={values.Descripcion || ""}
                            onChange={handleChanges}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${submitted && !values.Descripcion?.trim() ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        />
                        {submitted && !values.Descripcion?.trim() && (
                            <p className="text-red-500 text-xs mt-1">Ingrese la descripción</p>
                        )}
                    </div>

                    {/* Categoría - CON VALIDACIÓN VISUAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                        <button
                            type="button"
                            onClick={abrirModalCategorias}
                            className={`w-full h-10 px-3 border rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50
                                ${submitted && !values.CategoriaId ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        >
                            <span className={values.CategoriaId ? "text-gray-900" : "text-gray-500"}>
                                {values.CategoriaId ? obtenerNombreCategoria(values.CategoriaId) : "Seleccione una categoría"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                        {submitted && !values.CategoriaId && (
                            <p className="text-red-500 text-xs mt-1">Seleccione una categoría</p>
                        )}
                    </div>

                    {/* Descuento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="Descuento"
                                value={values.Descuento || ""}
                                onChange={handleChanges}
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0"
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Imagen - CON VALIDACIÓN VISUAL */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Imagen del servicio</h4>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de la imagen *</label>
                        <input
                            type="text"
                            name="Imagen"
                            value={values.Imagen || ""}
                            onChange={handleChanges}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className={`w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${submitted && !values.Imagen?.trim() ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        />
                        {submitted && !values.Imagen?.trim() && (
                            <p className="text-red-500 text-xs mt-1">Ingrese una URL de imagen</p>
                        )}
                    </div>

                    {values.Imagen && (
                        <div className="flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
                            <img
                                src={values.Imagen}
                                alt="Vista previa"
                                className="w-24 h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/96x96?text=Error';
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Sección específica según tipo de precio */}
            {values.TipoPrecio === 'UNICO' ? (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Precio</h4>

                    <div className="max-w-md">
                        {/* Precio - CON VALIDACIÓN VISUAL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="Precio"
                                    value={values.Precio || ""}
                                    onChange={handleChanges}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`w-full h-10 pl-7 pr-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                                        ${submitted && (!values.Precio || parseFloat(values.Precio) <= 0) ? "border-red-500" : "border-gray-300"}`}
                                    disabled={isSubmitting}
                                />
                            </div>
                            {submitted && (!values.Precio || parseFloat(values.Precio) <= 0) && (
                                <p className="text-red-500 text-xs mt-1">Ingrese un precio válido</p>
                            )}
                        </div>

                        <PreviewPrecio precio={values.Precio} descuento={values.Descuento} />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <TamanosManager
                        tamanos={tamanos}
                        setTamanos={setTamanos}
                        disabled={isSubmitting}
                        submitted={submitted}
                    />

                    {values.Descuento && parseFloat(values.Descuento) > 0 && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Nota:</span> El descuento del {values.Descuento}% se aplicará a todos los tamaños.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Estado (solo en edición) */}
            {isEditing && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Estado del servicio</h4>

                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                        <select
                            value={estadoEdit}
                            onChange={handleEstadoChange}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        >
                            {estados.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">El estado determina si el servicio es visible para los clientes</p>
                    </div>
                </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        isSubmitting
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Procesando...
                        </div>
                    ) : buttonLabel}
                </button>
                <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};