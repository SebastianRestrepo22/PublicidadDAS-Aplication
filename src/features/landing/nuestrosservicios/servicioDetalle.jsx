import React, { useState, useEffect } from "react";
import {
  FileText,
  ImageIcon,
  Upload,
  X,
  ArrowLeft,
  Save,
  Edit2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { GetDataservicios } from "../../dashboard/servicios/services/services.servicios";
import { toast } from "react-toastify";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useCart } from "../../../context/CartContext";

export const ServicioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [servicio, setServicio] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [tamano, setTamano] = useState("Mediana");
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [imagenPreview, setImagenPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const res = await GetDataservicios();
        const servicioEncontrado = res.data.find(
          (s) => s.ServicioId === id
        );

        if (!servicioEncontrado) {
          toast.error("Servicio no encontrado");
          navigate("/servicios");
          return;
        }

        setServicio(servicioEncontrado);
        setTamano(servicioEncontrado.Tamano || "Mediana");
        setImagenPreview(servicioEncontrado.Imagen || servicioEncontrado.UrlImagen || "");
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el servicio");
        navigate("/servicios");
      }
    };

    if (id) fetchServicio();
  }, [id, navigate]);

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
    
    setIsSubmitting(true);

    try {
      // Calcular precio con descuento
      const precioConDescuento = servicio.Descuento > 0
        ? servicio.Precio * (1 - servicio.Descuento / 100)
        : servicio.Precio;

      // Preparar objeto de servicio para agregar al carrito
      // Usando EXACTAMENTE los campos que se guardan en DetallePedidosClientes
      const servicioParaCarrito = {
        ServicioId: servicio.ServicioId,
        ProductoId: null, // Para servicios, ProductoId es null
        Nombre: servicio.Nombre,
        Descripcion: descripcion || "Servicio personalizado", // Descripción del usuario
        Precio: precioConDescuento,
        Descuento: servicio.Descuento || 0,
        Imagen: imagenPreview || servicio.Imagen || servicio.UrlImagen || "",
        Tamaño: tamano, // Tamaño seleccionado por el usuario
        // Campos que se guardan en DetallePedidosClientes
        customization: {
          Descripcion: descripcion, // Se guarda en campo Descripcion
          Tamaño: tamano, // Se guarda en campo Tamaño
          UrlImagen: imagenPreview, // Se guarda en campo UrlImagen
          archivosAdjuntos: archivosAdjuntos.map(f => ({
            nombre: f.nombre,
            tipo: f.tipo,
            tamaño: f.tamaño
          })),
          // Información del servicio base
          ServicioBase: {
            Nombre: servicio.Nombre,
            PrecioOriginal: servicio.Precio,
            Descuento: servicio.Descuento
          }
        },
        // Estos campos son para el frontend
        EsPersonalizado: true,
        CategoriaId: servicio.CategoriaId
      };

      // AGREGAR AL CARRITO
      // Pasar solo los campos que realmente se guardarán
      addToCart(servicioParaCarrito, {
        // SOLO los campos que van a DetallePedidosClientes
        Descripcion: descripcion, // → campo Descripcion en DB
        Tamaño: tamano, // → campo Tamaño en DB
        UrlImagen: imagenPreview, // → campo UrlImagen en DB
        // Estos van como metadata adicional
        archivosAdjuntos: archivosAdjuntos.length,
        tipo: "servicio"
      }, 1);

      toast.success(`"${servicio.Nombre}" agregado al carrito`);
      
      // Redirigir al carrito de compras
      setTimeout(() => {
        navigate("/carritodecompras");
      }, 1000);

    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error("Error al agregar el servicio al carrito");
    } finally {
      setIsSubmitting(false);
    }
  };

  const precioConDescuento =
    servicio?.Descuento > 0
      ? servicio.Precio * (1 - servicio.Descuento / 100)
      : servicio?.Precio || 0;

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  if (!servicio) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Cargando servicio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/servicios")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="h-6 w-6 mr-2" />
          Volver a Servicios
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Personaliza tu Servicio: {servicio.Nombre}
            </h1>
            <p className="text-blue-100 mt-2">
              Describe lo que necesitas y sube imágenes de referencia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Columna Izquierda - Formulario de personalización */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Detalles de Personalización</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción del servicio *
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
                </select>
              </div>

              {/* Adjuntar archivos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adjuntar Archivos de Referencia
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Sube imágenes, logos, documentos o cualquier archivo que sirva como referencia para tu proyecto.
                </p>
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-sm text-slate-600 mb-1">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </span>
                  <span className="text-xs text-slate-500">
                    Imágenes, PDF, Word, PowerPoint (Max 10MB por archivo)
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

              {archivosAdjuntos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-700">
                    Archivos adjuntos ({archivosAdjuntos.length}):
                  </h3>
                  {archivosAdjuntos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center space-x-3">
                        {archivo.tipo.startsWith("image/") ? (
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800">{archivo.nombre}</p>
                          <p className="text-xs text-slate-500">
                            {(archivo.tamaño / 1024).toFixed(2)} KB
                          </p>
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
            </div>

            {/* Columna Derecha - Resumen y Precio */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 text-xl mb-4">Resumen del Servicio</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Servicio Base</h4>
                    <p className="text-slate-800 font-medium">{servicio.Nombre}</p>
                    <p className="text-sm text-slate-600 mt-1">{servicio.Descripcion}</p>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Detalles de Precio</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Precio base:</span>
                        <span className="font-medium">{formatPrice(servicio.Precio)}</span>
                      </div>

                      {servicio.Descuento > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Descuento ({servicio.Descuento}%):</span>
                            <span className="text-green-600 font-medium">
                              -{formatPrice(servicio.Precio * (servicio.Descuento / 100))}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                            <span className="text-slate-800">Precio final:</span>
                            <span className="text-blue-600">{formatPrice(precioConDescuento)}</span>
                          </div>
                          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            ¡Estás ahorrando {formatPrice(servicio.Precio - precioConDescuento)}!
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Tu Personalización</h4>
                    <div className="space-y-2 text-sm">
                      {descripcion && (
                        <div>
                          <span className="font-medium">Descripción:</span>
                          <p className="text-slate-600 mt-1">{descripcion}</p>
                        </div>
                      )}
                      <p><span className="font-medium">Tamaño:</span> {tamano}</p>
                      {archivosAdjuntos.length > 0 && (
                        <p><span className="font-medium">Archivos adjuntos:</span> {archivosAdjuntos.length}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-bold text-slate-800 mb-3">¿Qué incluye?</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Diseño personalizado según tus especificaciones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Revisiones hasta que quedes satisfecho</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Archivos en formatos editables y listos para imprimir</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Soporte y asesoría durante el proceso</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !descripcion.trim()}
                  className={`w-full mt-6 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${
                    isSubmitting || !descripcion.trim()
                      ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Agregar al Carrito - {formatPrice(precioConDescuento)}
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center mt-3">
                  Al continuar, aceptas nuestros términos y condiciones. El pago se realizará al confirmar el carrito.
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