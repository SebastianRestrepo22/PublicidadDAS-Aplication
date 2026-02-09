import React from "react";
import { ChevronDown, Check } from "lucide-react";
import Modal from "../../components/modals/modal.jsx";

export const ProductoForm = ({
    mode,
    values,
    setValues,
    editData,
    categorias,
    colores,
    coloresConStock,
    setColoresConStock,
    handleSubmit,
    isSubmitting,
    submitted,
    nombreError,
    imagenError,
    handleChanges,
    handleNombreBlur,
    validateImagen,
    goToBackToList,
    openColores,
    setOpenColores,
    openCategoriasModal,
    setOpenCategoriasModal,
    categoriaBusqueda,
    setCategoriaBusqueda,
    categoriasFiltradas,
    abrirModalCategorias,
    seleccionarCategoria,
    obtenerNombreCategoria,
}) => {
    const buttonLabel = mode === "edit" ? "Editar" : "Crear";
    const isEditing = mode === "edit";

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChanges({
                    target: {
                        name: "Imagen",
                        value: reader.result,
                    },
                });
                validateImagen(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                    {isEditing ? "Editar Producto" : "Crear Nuevo Producto"}
                </h3>
                {isEditing && editData && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        ID: {editData.ProductoId}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Información básica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Nombre *</label>
                        <input
                            type="text"
                            placeholder="Ingrese el nombre"
                            name="Nombre"
                            value={values.Nombre}
                            onChange={handleChanges}
                            onBlur={handleNombreBlur}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${submitted && !values.Nombre.trim() || nombreError ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        />
                        <div className="min-h-[20px] mt-0.5">
                            {(!values.Nombre.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Ingrese el nombre
                                </p>
                            )}
                            {nombreError && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    {nombreError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Descripción *</label>
                        <input
                            type="text"
                            placeholder="Ingrese la descripción"
                            name="Descripcion"
                            value={values.Descripcion}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${submitted && !values.Descripcion.trim() ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        />
                        <div className="min-h-[20px] mt-0.5">
                            {(!values.Descripcion.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Ingrese la descripción
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Configuración de stock</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sistema de colores */}
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">¿Usa sistema de colores?</label>
                        <select
                            name="UsaColores"
                            value={values.UsaColores}
                            onChange={(e) => {
                                handleChanges(e);
                                // Forzar re-render inmediato
                                setTimeout(() => { }, 0);
                            }}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        >
                            <option value="0">No - Stock general</option>
                            <option value="1">Sí - Stock por color</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {values.UsaColores === "0"
                                ? "Stock único para todas las variantes"
                                : "Stock independiente por color"}
                        </p>
                    </div>

                    {/* Stock general - Siempre renderizado pero condicionalmente visible */}
                    <div className={`flex flex-col gap-1 transition-all duration-200 ${parseInt(values.UsaColores) === 0 ? 'opacity-100' : 'opacity-50 pointer-events-none'
                        }`}>
                        <label className="font-medium">
                            Stock general {parseInt(values.UsaColores) === 0 && '*'}
                        </label>
                        <input
                            type="number"
                            placeholder={parseInt(values.UsaColores) === 0 ? "Cantidad disponible" : "No aplica"}
                            name="Stock"
                            value={parseInt(values.UsaColores) === 0 ? (values.Stock || "") : ""}
                            onChange={handleChanges}
                            min="0"
                            step="1"
                            className={`w-full h-10 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
          ${submitted && parseInt(values.UsaColores) === 0 && (!values.Stock || parseInt(values.Stock) < 0)
                                    ? "border-red-500"
                                    : "border-gray-300"}`}
                            disabled={isSubmitting || parseInt(values.UsaColores) === 1}
                        />
                        <div className="min-h-[20px] mt-0.5">
                            {parseInt(values.UsaColores) === 0 && submitted && (!values.Stock || parseInt(values.Stock) < 0) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Ingrese una cantidad válida (0 o más)
                                </p>
                            )}
                            {parseInt(values.UsaColores) === 0 && values.Stock > 0 && (
                                <p className="text-green-600 text-[12px] leading-4">
                                    Stock disponible: {values.Stock} unidades
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Gestión de colores */}
                    <div className={`flex flex-col gap-1 transition-all duration-200 ${parseInt(values.UsaColores) === 1 ? 'opacity-100' : 'opacity-50 pointer-events-none'
                        }`}>
                        <label className="font-medium">
                            Colores con stock {parseInt(values.UsaColores) === 1 && '*'}
                        </label>
                        <button
                            type="button"
                            onClick={() => setOpenColores(true)}
                            className={`h-10 px-4 text-sm rounded-lg w-fit flex items-center gap-2 transition-colors ${parseInt(values.UsaColores) === 1
                                    ? coloresConStock.length > 0
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                            disabled={isSubmitting || parseInt(values.UsaColores) === 0}
                        >
                            <span>
                                {parseInt(values.UsaColores) === 1
                                    ? coloresConStock.length > 0 ? "Editar colores" : "Asignar colores"
                                    : "No disponible"}
                            </span>
                            {parseInt(values.UsaColores) === 1 && coloresConStock.length > 0 && (
                                <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                    {coloresConStock.length}
                                </span>
                            )}
                        </button>
                        <div className="min-h-[20px] mt-0.5">
                            {parseInt(values.UsaColores) === 1 && coloresConStock.length > 0 ? (
                                <div className="text-xs text-gray-600">
                                    <p>{coloresConStock.length} color(es) asignado(s)</p>
                                    <p>Stock total: {coloresConStock.reduce((sum, c) => sum + (c.Stock || 0), 0)} unidades</p>
                                </div>
                            ) : parseInt(values.UsaColores) === 1 ? (
                                <p className="text-xs text-gray-500">
                                    Click para asignar colores y stock
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Imagen del producto</h4>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="font-medium">Imagen (URL o archivo) *</label>
                        <input
                            type="text"
                            placeholder="http://..."
                            name="Imagen"
                            value={values.Imagen}
                            onChange={handleChanges}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                ${submitted && !values.Imagen.trim() ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full h-10 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                            disabled={isSubmitting}
                        />
                        <div className="min-h-[20px] mt-0.5">
                            {(!values.Imagen.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Seleccione o ingrese una imagen
                                </p>
                            )}
                            {imagenError && (
                                <p className="text-red-500 text-[12px] leading-4">{imagenError}</p>
                            )}
                        </div>
                    </div>

                    {values.Imagen && (
                        <div className="flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                            <img
                                src={values.Imagen}
                                alt="Vista previa"
                                className="w-[80px] h-[80px] object-cover rounded border border-gray-300"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Precio y categorización</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Precio *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                $
                            </span>
                            <input
                                type="number"
                                placeholder="0.00"
                                name="Precio"
                                value={values.Precio}
                                onChange={handleChanges}
                                min="0"
                                step="0.01"
                                className={`w-full h-10 pl-8 pr-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
        ${submitted && (!values.Precio || parseFloat(values.Precio) <= 0) ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="min-h-[20px] mt-0.5">
                            {submitted && (!values.Precio || parseFloat(values.Precio) <= 0) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Ingrese un precio válido (mayor a 0)
                                </p>
                            )}
                            {values.Precio && parseFloat(values.Precio) > 0 && (
                                <p className="text-green-600 text-[12px] leading-4">
                                    ${parseFloat(values.Precio).toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Descuento (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Ej: 10 (dejar vacío para 0%)"
                                name="Descuento"
                                value={values.Descuento}
                                onChange={handleChanges}
                                min="0"
                                max="100"
                                step="0.01"
                                className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
        ${submitted && values.Descuento !== "" && (parseFloat(values.Descuento) < 0 || parseFloat(values.Descuento) > 100) ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                %
                            </div>
                        </div>
                        <div className="min-h-[20px] mt-0.5">
                            {/* Mensaje de error si hay */}
                            {submitted && values.Descuento !== "" && (parseFloat(values.Descuento) < 0 || parseFloat(values.Descuento) > 100) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    El descuento debe estar entre 0 y 100%
                                </p>
                            )}
                            {/* Mensaje informativo solo si hay descuento */}
                            {values.Descuento !== "" && parseFloat(values.Descuento) > 0 && (
                                <div className="text-green-600 text-[12px] leading-4">
                                    <p> Aplicará un {values.Descuento}% de descuento</p>
                                    {values.Precio && (
                                        <p className="text-gray-600">
                                            Precio final: ${(parseFloat(values.Precio || 0) * (1 - parseFloat(values.Descuento) / 100)).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            )}
                            {/* Si está vacío, muestra mensaje sutil */}
                            {values.Descuento === "" && (
                                <p className="text-gray-400 text-[12px] leading-4">
                                    Dejar vacío para 0% de descuento
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Categoría *</label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={abrirModalCategorias}
                                className={`w-full h-10 px-3 border rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors
                  ${submitted && !values.CategoriaId.trim() ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            >
                                <span className={`${values.CategoriaId ? "text-gray-900" : "text-gray-500"}`}>
                                    {values.CategoriaId ? obtenerNombreCategoria(values.CategoriaId) : "Seleccione la categoría"}
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>

                            {values.CategoriaId && (
                                <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span>Seleccionada: {obtenerNombreCategoria(values.CategoriaId)}</span>
                                </div>
                            )}
                        </div>

                        <div className="min-h-[20px] mt-0.5">
                            {(!values.CategoriaId.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Seleccione una categoría
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isSubmitting
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Procesando...
                        </>
                    ) : (
                        buttonLabel
                    )}
                </button>
                <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={goToBackToList}
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};