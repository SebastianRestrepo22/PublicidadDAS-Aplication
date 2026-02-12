import React, { useState, useEffect } from "react";
import {
  FileText,
  ImageIcon,
  Upload,
  X,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/footer";
import { useCart } from "../../../../context/CartContext";

export const EditarCarritoServicio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, updateItem } = useCart();
  
  const { item } = location.state || {};
  
  const [descripcion, setDescripcion] = useState("");
  const [tamano, setTamano] = useState("Mediana");
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [imagenPreview, setImagenPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicioOriginal, setServicioOriginal] = useState(null);

  useEffect(() => {
    if (!item) {
      toast.error("No se encontró el servicio para editar");
      navigate("/carritodecompras");
      return;
    }

    // Buscar el item actual en el carrito para obtener la información más reciente
    const currentItem = cart.find(cartItem => cartItem.id === item.id);
    if (!currentItem) {
      toast.error("El servicio ya no está en el carrito");
      navigate("/carritodecompras");
      return;
    }

    setServicioOriginal(currentItem);
    
    // Cargar datos existentes
    const customization = currentItem.customization || {};
    
    setDescripcion(customization.Descripcion || customization.descripcion || "");
    setTamano(customization.Tamaño || customization.tamaño || "Mediana");
    setImagenPreview(customization.UrlImagen || currentItem.Imagen || currentItem.UrlImagen || "");
    
    // Cargar archivos adjuntos si existen - Asegurar que sea un array
    if (customization.archivosAdjuntos) {
      // Verificar si ya es un array, si no, convertirlo
      const archivos = Array.isArray(customization.archivosAdjuntos) 
        ? customization.archivosAdjuntos 
        : [];
      setArchivosAdjuntos(archivos);
    }
  }, [item, cart, navigate]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      url: URL.createObjectURL(file),
      file: file // Guardar el archivo original
    }));

    setArchivosAdjuntos((prev) => [...prev, ...nuevosArchivos]);

    // Si se sube una imagen, actualizar el preview
    const imagen = files.find((f) => f.type.startsWith("image/"));
    if (imagen) {
      setImagenPreview(URL.createObjectURL(imagen));
    }
  };

  const eliminarArchivo = (archivoId) => {
    setArchivosAdjuntos((prev) =>
      prev.filter((a) => a.id !== archivoId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!descripcion.trim()) {
      toast.error("Por favor, describe lo que necesitas");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Preparar los cambios para actualizar en el carrito
      const cambios = {
        // Actualizar la descripción principal del item
        Descripcion: descripcion,
        
        // Actualizar la imagen
        Imagen: imagenPreview || servicioOriginal.Imagen,
        UrlImagen: imagenPreview || servicioOriginal.UrlImagen,
        
        // Actualizar la personalización completa
        customization: {
          ...servicioOriginal.customization,
          Descripcion: descripcion,
          Tamaño: tamano,
          UrlImagen: imagenPreview,
          // Solo guardar información básica de archivos (sin el objeto File)
          archivosAdjuntos: archivosAdjuntos.map(f => ({
            id: f.id,
            nombre: f.nombre,
            tipo: f.tipo,
            tamaño: f.tamaño,
            url: f.url || null // Solo guardar si es una URL local
          }))
        }
      };

      console.log("Actualizando servicio con cambios:", cambios);
      
      // Actualizar el item en el carrito
      updateItem(servicioOriginal.id, cambios);
      
      toast.success("Servicio actualizado correctamente");
      
      // Redirigir inmediatamente al carrito
      navigate("/carritodecompras");

    } catch (error) {
      console.error("Error al actualizar el servicio:", error);
      toast.error("Error al actualizar el servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio || 0);
  };

  if (!servicioOriginal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Cargando servicio...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const precioConDescuento = servicioOriginal.Descuento > 0
    ? servicioOriginal.Precio * (1 - servicioOriginal.Descuento / 100)
    : servicioOriginal.Precio;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-[80px]">
        <button
          onClick={() => navigate("/carritodecompras")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="h-6 w-6 mr-2" />
          Volver al Carrito
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Editar Servicio: {servicioOriginal.Nombre}
            </h1>
            <p className="text-purple-100 mt-2">
              Modifica los detalles de personalización según tus necesidades
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Columna Izquierda - Formulario de edición */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Editar Personalización</h2>

              {/* Vista previa actual */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-700 mb-2">Configuración actual:</h3>
                {servicioOriginal.customization?.Descripcion && (
                  <p className="text-sm text-slate-600 mb-2">
                    <span className="font-medium">Descripción:</span> {servicioOriginal.customization.Descripcion}
                  </p>
                )}
                {servicioOriginal.customization?.Tamaño && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Tamaño:</span> {servicioOriginal.customization.Tamaño}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nueva descripción del servicio *
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe en detalle lo que necesitas. Ej: Necesito un diseño moderno para un restaurante de comida italiana, con colores rojo y blanco..."
                  rows="5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tamaño
                </label>
                <select
                  value={tamano}
                  onChange={(e) => setTamano(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="Pequeña">Pequeña (hasta A5)</option>
                  <option value="Mediana">Mediana (A4)</option>
                  <option value="Grande">Grande (A3 o mayor)</option>
                  <option value="Personalizado">Personalizado</option>
                </select>
              </div>

              {/* Imagen actual */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Imagen de referencia
                </label>
                {imagenPreview && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-2">Imagen actual:</p>
                    <div className="relative inline-block">
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setImagenPreview("")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 mb-1">
                    {imagenPreview ? "Cambiar imagen" : "Subir imagen de referencia"}
                  </span>
                  <span className="text-xs text-slate-500">
                    JPG, PNG, GIF (Max 5MB)
                  </span>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type.startsWith("image/")) {
                        setImagenPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                </label>
              </div>

              {/* Adjuntar archivos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Archivos de Referencia
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  {archivosAdjuntos.length > 0 
                    ? `Tienes ${archivosAdjuntos.length} archivo(s) adjunto(s)`
                    : "Sube imágenes, logos o documentos de referencia para tu proyecto."
                  }
                </p>
                
                {archivosAdjuntos.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {archivosAdjuntos.map((archivo) => (
                      <div
                        key={archivo.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center space-x-3">
                          {archivo.tipo && archivo.tipo.startsWith("image/") ? (
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800">{archivo.nombre}</p>
                            {archivo.tamaño && (
                              <p className="text-xs text-slate-500">
                                {(archivo.tamaño / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarArchivo(archivo.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          disabled={isSubmitting}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <label className="flex flex-col items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600">
                    {archivosAdjuntos.length > 0 ? "Agregar más archivos" : "Seleccionar archivos"}
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>

            {/* Columna Derecha - Resumen y Precio */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <h3 className="font-bold text-purple-900 text-xl mb-4">Resumen del Servicio</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Servicio Base</h4>
                    <p className="text-slate-800 font-medium">{servicioOriginal.Nombre}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {servicioOriginal.customization?.Descripcion || "Servicio personalizado"}
                    </p>
                  </div>

                  <div className="border-t border-purple-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Detalles de Precio</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Precio base:</span>
                        <span className="font-medium">{formatPrice(servicioOriginal.Precio)}</span>
                      </div>

                      {servicioOriginal.Descuento > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Descuento ({servicioOriginal.Descuento}%):</span>
                            <span className="text-green-600 font-medium">
                              -{formatPrice(servicioOriginal.Precio * (servicioOriginal.Descuento / 100))}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-purple-200">
                            <span className="text-slate-800">Precio final:</span>
                            <span className="text-purple-600">{formatPrice(precioConDescuento)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-purple-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Tu Nueva Personalización</h4>
                    <div className="space-y-2 text-sm">
                      {descripcion && (
                        <div>
                          <span className="font-medium">Descripción:</span>
                          <p className="text-slate-600 mt-1 line-clamp-3">{descripcion}</p>
                        </div>
                      )}
                      <p><span className="font-medium">Tamaño:</span> {tamano}</p>
                      {archivosAdjuntos.length > 0 && (
                        <p><span className="font-medium">Archivos adjuntos:</span> {archivosAdjuntos.length}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-bold text-slate-800 mb-3">¿Qué puedes modificar?</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                      <span>Descripción detallada del proyecto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                      <span>Tamaño y dimensiones requeridas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                      <span>Imágenes y archivos de referencia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                      <span>El precio se mantiene igual</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/carritodecompras")}
                    disabled={isSubmitting}
                    className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !descripcion.trim()}
                    className={`flex-1 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${
                      isSubmitting || !descripcion.trim()
                        ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 text-center mt-3">
                  Los cambios se aplicarán inmediatamente a tu carrito de compras.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};