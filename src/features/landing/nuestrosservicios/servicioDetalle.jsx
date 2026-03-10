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
import { useParams, useNavigate } from "react-router-dom";
import { GetDataservicios, getTamanosByServicio } from "../../dashboard/servicios/services/services.servicios";
import { toast } from "react-toastify";
import { useCart } from "../../../context/CartContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";

export const ServicioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [servicio, setServicio] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [tamano, setTamano] = useState("");
  const [tamanosDisponibles, setTamanosDisponibles] = useState([]);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);
  const [imagenPreview, setImagenPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [precioSeleccionado, setPrecioSeleccionado] = useState(0);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

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
        setImagenPreview(servicioEncontrado.Imagen || servicioEncontrado.UrlImagen || "");

        if (servicioEncontrado.TipoPrecio === 'POR_TAMANO') {
          try {
            const tamanos = await getTamanosByServicio(id);
            if (tamanos && tamanos.length > 0) {
              setTamanosDisponibles(tamanos);
              setTamano(tamanos[0].NombreTamano);
              setPrecioSeleccionado(tamanos[0].Precio);
            }
          } catch (error) {
            console.error("Error cargando tamaños:", error);
            toast.error("Error al cargar los tamaños disponibles");
          }
        } else {
          setPrecioSeleccionado(servicioEncontrado.Precio);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el servicio");
        navigate("/servicios");
      }
    };

    if (id) fetchServicio();
  }, [id, navigate]);

  const subirArchivo = async (file) => {
    const formData = new FormData();
    formData.append("archivo", file);

    const res = await fetch("http://localhost:3000/api/upload-temp", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.ok) {
      throw new Error("Error subiendo archivo");
    }

    return data.url;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const urlServidor = await subirArchivo(file);

        const nuevoArchivo = {
          id: Math.random().toString(36).substr(2, 9),
          nombre: file.name,
          tipo: file.type,
          tamaño: file.size,
          url: urlServidor,
          esImagen: file.type.startsWith("image/")
        };

        setArchivosAdjuntos(prev => [...prev, nuevoArchivo]);

        if (file.type.startsWith("image/") && !imagenPreview) {
          setImagenPreview(urlServidor);
        }

      } catch (error) {
        console.error(error);
        toast.error("Error subiendo archivo");
      }
    }
  };

  const eliminarArchivo = (archivoId) => {
    setArchivosAdjuntos((prev) =>
      prev.filter((a) => a.id !== archivoId)
    );
  };

  const verImagenCompleta = (archivo, e) => {
    e.stopPropagation();
    if (archivo.url) {
      setImagenAmpliada(archivo.url);
    }
  };

  const cerrarImagenAmpliada = (e) => {
    e.stopPropagation();
    setImagenAmpliada(null);
  };

  const handleTamanoChange = (e) => {
    const nombreTamano = e.target.value;
    setTamano(nombreTamano);

    const tamanoSeleccionado = tamanosDisponibles.find(t => t.NombreTamano === nombreTamano);
    if (tamanoSeleccionado) {
      setPrecioSeleccionado(tamanoSeleccionado.Precio);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (servicio.TipoPrecio === 'POR_TAMANO' && !tamano) {
      toast.error("Debes seleccionar un tamaño");
      return;
    }

    setIsSubmitting(true);

    try {
      const customizacion = {
        Descripcion: descripcion,
        Tamaño: tamano,
        archivosAdjuntos: archivosAdjuntos.map(f => ({
          nombre: f.nombre,
          url: f.url,
          tipo: f.tipo
        }))
      };

      if (imagenPreview && archivosAdjuntos.length > 0) {
        const imagenPrincipal = archivosAdjuntos.find(f =>
          f.tipo.startsWith("image/") && f.url === imagenPreview
        );
        if (imagenPrincipal) {
          customizacion.UrlImagen = imagenPrincipal.nombre;
          customizacion.imagenPrincipal = imagenPrincipal.archivo;
        }
      }

      if (servicio.TipoPrecio === 'POR_TAMANO' && tamano) {
        customizacion.precioSeleccionado = precioSeleccionado;
        customizacion.tamanoSeleccionado = tamano;
      }

      addToCart(servicio, customizacion, 1);

      toast.success(`"${servicio.Nombre}" agregado al carrito`);

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

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const precioConDescuento = servicio.Descuento > 0
    ? precioSeleccionado * (1 - servicio.Descuento / 100)
    : precioSeleccionado;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-[80px]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="h-6 w-6 mr-2" />
          Volver a servicios
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {servicio.Nombre}
            </h1>
            <p className="text-gray-600 mt-2">
              Personaliza tu servicio según tus necesidades
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">Detalles de Personalización</h2>

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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tamaño {servicio.TipoPrecio === 'POR_TAMANO' && '*'}
                </label>

                {servicio.TipoPrecio === 'POR_TAMANO' ? (
                  <div className="space-y-3">
                    <select
                      value={tamano}
                      onChange={handleTamanoChange}
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
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Tamaño único</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adjuntar Archivos de Referencia
                </label>
                <label className="flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-sm text-slate-600 mb-1">
                    Arrastra archivos aquí o haz clic para seleccionar
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
                  <h3 className="font-semibold text-slate-700">Archivos adjuntos:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {archivosAdjuntos.map((archivo) => (
                      <div
                        key={archivo.id}
                        className="border border-slate-200 rounded-lg p-2 hover:border-blue-300 transition-all group relative"
                      >
                        {archivo.esImagen ? (
                          <div className="relative">
                            <img
                              src={archivo.url}
                              alt={archivo.nombre}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer"
                              onClick={(e) => verImagenCompleta(archivo, e)}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                onClick={(e) => verImagenCompleta(archivo, e)}
                                className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                              >
                                👁️
                              </button>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarArchivo(archivo.id);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{archivo.nombre}</p>
                              <p className="text-xs text-slate-500">
                                {(archivo.tamaño / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarArchivo(archivo.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 text-xl mb-4">Resumen del Servicio</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Servicio Base</h4>
                    <p className="text-slate-800 font-medium">{servicio.Nombre}</p>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3">Detalles de Precio</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Precio base:</span>
                        <span className="font-medium">
                          {servicio.TipoPrecio === 'POR_TAMANO' && tamano
                            ? `${tamano}: ${formatPrice(precioSeleccionado)}`
                            : formatPrice(precioSeleccionado)
                          }
                        </span>
                      </div>

                      {servicio.Descuento > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Descuento ({servicio.Descuento}%):</span>
                            <span className="text-green-600 font-medium">
                              -{formatPrice(precioSeleccionado * (servicio.Descuento / 100))}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                            <span className="text-slate-800">Precio final:</span>
                            <span className="text-blue-600">{formatPrice(precioConDescuento)}</span>
                          </div>
                        </>
                      )}

                      {servicio.Descuento === 0 && (
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
                          <span className="text-slate-800">Precio final:</span>
                          <span className="text-blue-600">{formatPrice(precioSeleccionado)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {descripcion && (
                    <div className="border-t border-blue-200 pt-4">
                      <h4 className="font-semibold text-slate-700 mb-2">Tu Personalización</h4>
                      <p className="text-sm text-slate-600">{descripcion}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !descripcion.trim() ||
                    (servicio.TipoPrecio === 'POR_TAMANO' && !tamano)
                  }
                  className={`w-full mt-6 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${isSubmitting || !descripcion.trim() || (servicio.TipoPrecio === 'POR_TAMANO' && !tamano)
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
              </div>
            </div>
          </form>
        </div>
      </div>

      {imagenAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={cerrarImagenAmpliada}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={imagenAmpliada}
              alt="Imagen ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={cerrarImagenAmpliada}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};