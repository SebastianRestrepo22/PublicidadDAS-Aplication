import React, { useState, useEffect } from "react";
import {
  FileText,
  ImageIcon,
  Upload,
  X,
  ArrowLeft,
  Save,
  Package,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/footer";
import { useCart } from "../../../../context/CartContext";
import { getTamanosByServicio } from "../../../dashboard/servicios/services/services.servicios";

export const EditarCarritoServicio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, updateItem } = useCart();
  
  const { item } = location.state || {};
  
  const [descripcion, setDescripcion] = useState("");
  const [tamano, setTamano] = useState("");
  const [tamanosDisponibles, setTamanosDisponibles] = useState([]);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [imagenPreview, setImagenPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [servicioOriginal, setServicioOriginal] = useState(null);
  const [tipoServicio, setTipoServicio] = useState("UNICO");

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
    setTipoServicio(currentItem.TipoPrecio || "UNICO");
    
    // Cargar datos existentes
    const customization = currentItem.customization || {};
    
    setDescripcion(customization.Descripcion || customization.descripcion || "");
    setTamano(customization.Tamaño || customization.tamaño || "");
    setImagenPreview(customization.UrlImagen || currentItem.Imagen || currentItem.UrlImagen || "");
    
    // Cargar archivos adjuntos si existen
    if (customization.archivosAdjuntos) {
      const archivos = Array.isArray(customization.archivosAdjuntos) 
        ? customization.archivosAdjuntos 
        : [];
      setArchivosAdjuntos(archivos);
    }

    // Si es POR_TAMANO, cargar los tamaños disponibles
    if (currentItem.TipoPrecio === 'POR_TAMANO' && currentItem.ServicioId) {
      cargarTamanos(currentItem.ServicioId);
    }
  }, [item, cart, navigate]);

  const cargarTamanos = async (servicioId) => {
    try {
      const tamanos = await getTamanosByServicio(servicioId);
      if (tamanos && tamanos.length > 0) {
        setTamanosDisponibles(tamanos);
      }
    } catch (error) {
      console.error("Error cargando tamaños:", error);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const nuevosArchivos = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size,
      url: URL.createObjectURL(file),
    }));

    setArchivosAdjuntos((prev) => [...prev, ...nuevosArchivos]);
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

    // Validar tamaño si es POR_TAMANO
    if (tipoServicio === 'POR_TAMANO' && !tamano) {
      toast.error("Por favor selecciona un tamaño");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Preparar los cambios para actualizar en el carrito
      const cambios = {
        Descripcion: descripcion,
        Imagen: imagenPreview || servicioOriginal.Imagen,
        UrlImagen: imagenPreview || servicioOriginal.UrlImagen,
        customization: {
          Descripcion: descripcion,
          Tamaño: tamano,
          UrlImagen: imagenPreview,
          archivosAdjuntos: archivosAdjuntos.map(f => ({
            nombre: f.nombre,
            tipo: f.tipo,
            tamaño: f.tamaño
          }))
        }
      };

      console.log("Actualizando servicio con cambios:", cambios);
      
      // Actualizar el item en el carrito
      updateItem(servicioOriginal.id, cambios);
      
      toast.success("Servicio actualizado correctamente");
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
          {/* Encabezado sin degradado */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Editar Servicio: {servicioOriginal.Nombre}
            </h1>
            <p className="text-gray-600 mt-2">
              Modifica los detalles de personalización según tus necesidades
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Columna Izquierda - Formulario de edición */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Editar Personalización</h2>

              {/* Vista previa actual - Solo informativo */}
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
                  Descripción del servicio *
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe en detalle lo que necesitas..."
                  rows="5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Selector de Tamaño - SOLO si el servicio es POR_TAMANO */}
              {tipoServicio === 'POR_TAMANO' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tamaño *
                  </label>
                  <select
                    value={tamano}
                    onChange={(e) => setTamano(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Selecciona un tamaño</option>
                    {tamanosDisponibles.map((t) => (
                      <option key={t.TamanoId || t.NombreTamano} value={t.NombreTamano}>
                        {t.NombreTamano} - {formatPrice(t.Precio)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Adjuntar archivos - IGUAL que en crear */}
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 text-xl mb-4">Resumen del Servicio</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Servicio Base</h4>
                    <p className="text-slate-800 font-medium">{servicioOriginal.Nombre}</p>
                    {tipoServicio === 'POR_TAMANO' && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
                        <Package className="w-3 h-3" />
                        <span>Precio por tamaño</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-blue-200 pt-4">
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
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                            <span className="text-slate-800">Precio final:</span>
                            <span className="text-blue-600">{formatPrice(precioConDescuento)}</span>
                          </div>
                        </>
                      )}

                      {servicioOriginal.Descuento === 0 && (
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                          <span className="text-slate-800">Precio final:</span>
                          <span className="text-blue-600">{formatPrice(servicioOriginal.Precio)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Tu Nueva Personalización</h4>
                    <div className="space-y-2 text-sm">
                      {descripcion && (
                        <div>
                          <span className="font-medium">Descripción:</span>
                          <p className="text-slate-600 mt-1">{descripcion}</p>
                        </div>
                      )}
                      {tamano && tipoServicio === 'POR_TAMANO' && (
                        <p><span className="font-medium">Tamaño:</span> {tamano}</p>
                      )}
                      {archivosAdjuntos.length > 0 && (
                        <p><span className="font-medium">Archivos adjuntos:</span> {archivosAdjuntos.length}</p>
                      )}
                    </div>
                  </div>
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
                    disabled={isSubmitting || !descripcion.trim() || (tipoServicio === 'POR_TAMANO' && !tamano)}
                    className={`flex-1 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${
                      isSubmitting || !descripcion.trim() || (tipoServicio === 'POR_TAMANO' && !tamano)
                        ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};