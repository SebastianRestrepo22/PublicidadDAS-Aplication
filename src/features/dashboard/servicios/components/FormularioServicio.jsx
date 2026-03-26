import React, { useState, useRef } from "react";
import { ChevronDown, Link, Upload, X } from "lucide-react";

export const FormularioServicio = ({
    mode,
    values,
    setValues,
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

    // Estado para controlar la pestaña activa de imagen
    const [imagenTab, setImagenTab] = useState("url"); // "url" o "file"
    
    // Estado para errores de imagen
    const [imagenError, setImagenError] = useState("");
    
    // Estado para errores de validación del nombre
    const [nombreFormatoError, setNombreFormatoError] = useState("");
    
    // Referencia para el input de archivo
    const fileInputRef = useRef(null);

    const handleEstadoChange = (e) => setEstadoEdit(e.target.value);

    // Función para validar que el nombre solo contenga caracteres válidos y no exceda 255 caracteres
    const validateNombreFormato = (nombre) => {
        if (!nombre) return "";

        // Validar longitud máxima de 255 caracteres
        if (nombre.length > 255) {
            return "El nombre no puede exceder los 255 caracteres";
        }

        // Expresión regular para caracteres válidos
        const nombreServicioRegex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ0-9\s\-\.\,\(\)]+$/;

        if (!nombreServicioRegex.test(nombre)) {
            return "El nombre solo puede contener letras, números, espacios y los caracteres: - . , ( )";
        }
        return "";
    };

    // Función para validar que la descripción no exceda 255 caracteres
    const validateDescripcionLength = (descripcion) => {
        if (descripcion && descripcion.length > 255) {
            return "La descripción no puede exceder los 255 caracteres";
        }
        return "";
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
    const handleServiceChanges = (e) => {
        const { name, value } = e.target;

        if (name === "Nombre") {
            // Validar formato y longitud
            const formatoError = validateNombreFormato(value);
            setNombreFormatoError(formatoError);

            if (formatoError && handleNombreBlur) {
                const customEvent = {
                    target: e.target,
                    validationError: formatoError
                };
                handleNombreBlur(customEvent);
            }
        }

        if (name === "Imagen" && imagenTab === "url") {
            const urlError = validateImageUrl(value);
            setImagenError(urlError);
        }

        handleChanges(e);
    };

    // Manejar blur del nombre con validación adicional
    const handleServiceNombreBlur = (e) => {
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
        setImagenError(error);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileError = validateImageFile(file);
            if (fileError) {
                setImagenError(fileError);
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
                setImagenError("");
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
        setImagenError("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                    {isEditing ? "Editar Servicio" : "Crear Nuevo Servicio"}
                </h3>
            </div>

            {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Información básica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium">Nombre *</label>
                        <input
                            type="text"
                            placeholder="Ingrese el nombre del servicio"
                            name="Nombre"
                            value={values.Nombre || ""}
                            onChange={handleServiceChanges}
                            onBlur={handleServiceNombreBlur}
                            className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${submitted && !values.Nombre?.trim() ? "border-red-500" :
                                    nombreFormatoError ? "border-red-500" :
                                    nombreError ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                            maxLength={255}
                        />
                        <div className="min-h-[40px] mt-0.5">
                            {(!values.Nombre?.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Ingrese el nombre del servicio
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
                                    {values.Nombre.length}/255 caracteres • 
                                    Puede incluir letras, números y los caracteres: - . , ( )
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="font-medium">Descripción *</label>
                        <textarea
                            placeholder="Ingrese la descripción del servicio"
                            name="Descripcion"
                            value={values.Descripcion || ""}
                            onChange={handleServiceChanges}
                            rows="3"
                            className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${submitted && !values.Descripcion?.trim() ? "border-red-500" : "border-gray-300"}`}
                            disabled={isSubmitting}
                            maxLength={255}
                        />
                        <div className="min-h-[20px] mt-0.5">
                            {(!values.Descripcion?.trim() && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Ingrese la descripción
                                </p>
                            )}
                            {values.Descripcion && (
                                <p className="text-gray-500 text-[11px] leading-4">
                                    {values.Descripcion.length}/255 caracteres
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
                                    ${submitted && !values.CategoriaId ? "border-red-500" : "border-gray-300"}`}
                                disabled={isSubmitting}
                            >
                                <span className={values.CategoriaId ? "text-gray-900" : "text-gray-500"}>
                                    {values.CategoriaId ? obtenerNombreCategoria(values.CategoriaId) : "Seleccione la categoría"}
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="min-h-[20px] mt-0.5">
                            {(!values.CategoriaId && submitted) && (
                                <p className="text-red-500 text-[12px] leading-4">
                                    Seleccione una categoría
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: IMAGEN DEL SERVICIO */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Imagen del servicio</h4>

                {/* Pestañas para elegir método de carga */}
                <div className="flex border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setImagenTab("url")}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                            imagenTab === "url"
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
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                            imagenTab === "file"
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
                                    value={values.Imagen || ""}
                                    onChange={handleServiceChanges}
                                    onBlur={handleImagenBlur}
                                    className={`w-full h-10 px-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                                        ${submitted && !values.Imagen?.trim() ? "border-red-500" :
                                            imagenError ? "border-red-500" : "border-gray-300"}`}
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
                            {(!values.Imagen?.trim() && submitted) && (
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

            {/* SECCIÓN 3: ESTADO (solo en edición) */}
            {isEditing && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Estado del servicio</h4>
                    <div className="max-w-xs">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                        <select
                            value={estadoEdit}
                            onChange={handleEstadoChange}
                            className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        >
                            {estados.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            El estado determina si el servicio es visible para los clientes
                        </p>
                    </div>
                </div>
            )}

            {/* SECCIÓN 4: BOTONES */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        isSubmitting
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
                    ) : buttonLabel}
                </button>
                <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};