// ProductoForm.jsx - VERSIÓN CORREGIDA
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, AlertTriangle, Link, Upload, Package } from "lucide-react";
import Modal from "../../components/modals/modal.jsx";

export const ProductoForm = ({
    mode,
    values,
    setValues,
    editData,
    categorias,
    handleSubmit,
    isSubmitting,
    submitted,
    nombreError,
    imagenError,
    handleChanges,
    handleNombreBlur,
    validateImagen,
    goToBackToList,
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

    // Estado para errores de validación del nombre
    const [nombreFormatoError, setNombreFormatoError] = useState("");

    // Referencia para el input de archivo
    const fileInputRef = useRef(null);

    // Estado para controlar la pestaña activa de imagen
    const [imagenTab, setImagenTab] = useState("url"); // "url" o "file"

    // Función para validar que el nombre solo contenga caracteres válidos
    const validateNombreFormato = (nombre) => {
        if (!nombre) return "";
        const nombreProductoRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s\-\.\,\(\)]+$/;
        if (!nombreProductoRegex.test(nombre)) {
            return "El nombre solo puede contener letras, números, espacios y los caracteres: - . , ( )";
        }
        return "";
    };

    const formatPrice = (value) => {
        if (!value) return '$ 0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '$ 0';
        return `$ ${Math.round(num).toLocaleString('es-CO')}`;
    };

    const [displayPrice, setDisplayPrice] = useState(() =>
        values.Precio ? formatCOP(values.Precio) : ''
    );

    // Agrega estas funciones:
    const formatCOP = (value) => {
        if (!value) return '';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '';
        return `$ ${Math.round(num).toLocaleString('es-CO')}`;
    };

    const handlePriceChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, ''); // Solo números
        setDisplayPrice(value);
        handleChanges({
            target: {
                name: 'Precio',
                value: value === '' ? '' : parseInt(value)
            }
        });
    };

    const handlePriceBlur = () => {
        if (values.Precio) {
            setDisplayPrice(formatCOP(values.Precio));
        }
    };

    const handlePriceFocus = () => {
        if (values.Precio) {
            setDisplayPrice(values.Precio.toString());
        }
    };

    // Función para validar URL de imagen
    const validateImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('data:image')) return "";
        try {
            new URL(url);
            return "";
        } catch (e) {
            return "Ingrese una URL válida (http:// o https://)";
        }
    };

    // Función para validar el tamaño y tipo de archivo
    const validateImageFile = (file) => {
        if (!file) return "No se ha seleccionado ningún archivo";

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
            return "Tipo de archivo no permitido. Use: JPG, PNG, GIF, WEBP, SVG o BMP";
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return "El archivo es demasiado grande. Tamaño máximo: 5MB";
        }

        return "";
    };

    // Manejar cambios en inputs con validación
    const handleProductChanges = (e) => {
        const { name, value } = e.target;

        if (name === "Nombre") {
            const formatoError = validateNombreFormato(value);
            setNombreFormatoError(formatoError);
            if (formatoError && handleNombreBlur) {
                const customEvent = {
                    target: e.target,
                    validationError: formatoError
                };
                handleNombreBlur(customEvent);
            } else if (handleNombreBlur) {
                handleNombreBlur(e);
            }
        }

        if (name === "Imagen" && imagenTab === "url") {
            const urlError = validateImageUrl(value);
            if (validateImagen) {
                validateImagen(urlError || value);
            }
        }

        handleChanges(e);
    };

    // Manejar blur del nombre con validación adicional
    const handleProductNombreBlur = (e) => {
        const { value } = e.target;
        const formatoError = validateNombreFormato(value);
        setNombreFormatoError(formatoError);

        if (formatoError && handleNombreBlur) {
            const customEvent = {
                ...e,
                validationError: formatoError
            };
            handleNombreBlur(customEvent);
        } else if (handleNombreBlur) {
            handleNombreBlur(e);
        }
    };

    // Manejar blur de la imagen
    const handleImagenBlur = (e) => {
        const { value } = e.target;
        const error = validateImageUrl(value);
        if (validateImagen) {
            validateImagen(error || value);
        }
    };

    // Manejar cambio en UsaColores (AHORA ES SOLO INFORMATIVO)
    const handleUsaColoresChange = (e) => {
        const nuevoValor = e.target.value;

        // Solo actualizar el valor, sin lógica compleja de stock
        setValues(prev => ({
            ...prev,
            UsaColores: nuevoValor
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileError = validateImageFile(file);
            if (fileError) {
                if (validateImagen) {
                    validateImagen(fileError);
                }
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                handleChanges({
                    target: {
                        name: "Imagen",
                        value: reader.result,
                    },
                });
                if (validateImagen) {
                    validateImagen("");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        handleChanges({
            target: {
                name: "Imagen",
                value: "",
            },
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (validateImagen) {
            validateImagen("");
        }
    };

    return (
        <>
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
                                placeholder="Ingrese el nombre del producto"
                                name="Nombre"
                                value={values.Nombre}
                                onChange={handleProductChanges}
                                onBlur={handleProductNombreBlur}
                                className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${submitted && !values.Nombre.trim() ? "border-red-500" :
                                        nombreFormatoError ? "border-red-500" :
                                            nombreError ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            />
                            <div className="min-h-[40px] mt-0.5">
                                {(!values.Nombre.trim() && submitted) && (
                                    <p className="text-red-500 text-[12px] leading-4">
                                        Ingrese el nombre del producto
                                    </p>
                                )}
                                {nombreFormatoError && (
                                    <p className="text-red-500 text-[12px] leading-4">
                                        {nombreFormatoError}
                                    </p>
                                )}
                                {nombreError && !nombreFormatoError && (
                                    <p className="text-red-500 text-[12px] leading-4">
                                        {nombreError}
                                    </p>
                                )}
                                {values.Nombre && !nombreFormatoError && !nombreError && (
                                    <p className="text-gray-500 text-[11px] leading-4">
                                        {values.Nombre.length} caracteres •
                                        Puede incluir letras, números y los caracteres: - . , ( )
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

                {/* SECCIÓN DE STOCK - AHORA SOLO INFORMATIVA */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                        <Package size={16} />
                        Configuración de stock
                    </h4>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 mb-2">
                            <strong>Importante:</strong> El stock se gestiona automáticamente desde el módulo de compras.
                        </p>
                        <p className="text-xs text-blue-600">
                            • Si el producto usa colores, el stock se asigna por color al realizar compras<br />
                            • Si no usa colores, el stock se asigna de forma general al realizar compras<br />
                            • El stock que ves aquí es solo informativo y refleja el inventario actual
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sistema de colores - SOLO INFORMATIVO */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium">¿Usa sistema de colores?</label>
                            <select
                                name="UsaColores"
                                value={values.UsaColores}
                                onChange={handleUsaColoresChange}
                                className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isEditing || isSubmitting}
                                title={isEditing ? 'Esta opción no se puede cambiar después de crear el producto' : ''}
                            >
                                <option value="0">No - Stock general</option>
                                <option value="1">Sí - Stock por color</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Esta configuración determina cómo se comportará el producto en compras
                            </p>
                        </div>

                        {/* Stock actual - SOLO LECTURA */}
                        <div className="flex flex-col gap-1">
                            <label className="font-medium">Stock actual (informativo)</label>
                            <div className="w-full h-10 px-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center">
                                {parseInt(values.UsaColores) === 0 ? (
                                    <span className="text-gray-700">
                                        {editData?.Stock || 0} unidades en stock general
                                    </span>
                                ) : (
                                    <span className="text-gray-700">
                                        Stock gestionado por color (ver en detalles)
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Este valor se actualiza automáticamente con las compras
                            </p>
                        </div>
                    </div>

                    {/* Mensaje informativo adicional para edición */}
                    {isEditing && editData && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <strong>Nota:</strong> El stock actual de este producto es de <strong>{editData.Stock || 0} unidades</strong>.
                            </p>
                        </div>
                    )}
                </div>

                {/* SECCIÓN DE IMAGEN (sin cambios) */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Imagen del producto</h4>

                    {/* Pestañas para elegir método de carga */}
                    <div className="flex border-b border-gray-200">
                        <button
                            type="button"
                            onClick={() => setImagenTab("url")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${imagenTab === "url"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Link size={16} />
                            URL de imagen
                        </button>
                        <button
                            type="button"
                            onClick={() => setImagenTab("file")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${imagenTab === "file"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Upload size={16} />
                            Subir archivo
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            {imagenTab === "url" ? (
                                <>
                                    <label className="font-medium">URL de la imagen *</label>
                                    <input
                                        type="url"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        name="Imagen"
                                        value={values.Imagen}
                                        onChange={handleProductChanges}
                                        onBlur={handleImagenBlur}
                                        className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                            ${submitted && !values.Imagen.trim() ? "border-red-500" :
                                                imagenError && imagenError.includes("URL") ? "border-red-500" : "border-gray-300"}`}
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Formatos aceptados: JPG, PNG, GIF, WEBP, SVG, BMP
                                    </p>
                                </>
                            ) : (
                                <>
                                    <label className="font-medium">Subir imagen desde dispositivo *</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
                                        onChange={handleFileChange}
                                        className="w-full h-10 px-3 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tamaño máximo: 5MB • Formatos: JPG, PNG, GIF, WEBP, SVG, BMP
                                    </p>
                                </>
                            )}

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
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm text-gray-500">Vista previa:</p>
                                    <button
                                        type="button"
                                        onClick={handleClearImage}
                                        className="text-xs text-red-500 hover:text-red-700"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                                <div className="relative group">
                                    <img
                                        src={values.Imagen}
                                        alt="Vista previa"
                                        className="w-[80px] h-[80px] object-cover rounded border border-gray-300"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/80?text=Error";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECCIÓN DE PRECIO Y CATEGORÍA (sin cambios) */}
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
                                    type="text"
                                    placeholder="0"
                                    name="Precio"
                                    value={displayPrice}
                                    onChange={handlePriceChange}
                                    onBlur={handlePriceBlur}
                                    onFocus={handlePriceFocus}
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
                                {submitted && values.Descuento !== "" && (parseFloat(values.Descuento) < 0 || parseFloat(values.Descuento) > 100) && (
                                    <p className="text-red-500 text-[12px] leading-4">
                                        El descuento debe estar entre 0 y 100%
                                    </p>
                                )}
                                {values.Descuento !== "" && parseFloat(values.Descuento) > 0 && (
                                    <div className="text-green-600 text-[12px] leading-4">
                                        <p>Aplicará un {values.Descuento}% de descuento</p>
                                        {values.Precio && (
                                            <p className="text-gray-600">
                                                Precio final: ${(parseFloat(values.Precio || 0) * (1 - parseFloat(values.Descuento) / 100)).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                )}
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

                {/* BOTONES (sin cambios) */}
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
        </>
    );
};