import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import {
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetDataservicios } from "../../dashboard/servicios/services/services.servicios";
import { getAllCategorias } from "../../dashboard/categoriadediseño/services/services.categoria";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Servicios = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showOfertasModal, setShowOfertasModal] = useState(false);
  const [serviciosOferta, setServiciosOferta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Preparar servicios en oferta
  const prepararServiciosOferta = useCallback((serviciosData) => {
    const serviciosConDescuento = serviciosData.filter(s => s.Descuento > 0);
    const ofertasAleatorias = [...serviciosConDescuento]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setServiciosOferta(ofertasAleatorias);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [serviciosRes, categoriasRes] = await Promise.all([
          GetDataservicios(),
          getAllCategorias(),
        ]);

        if (!isMounted) return;

        setServicios(Array.isArray(serviciosRes.data) ? serviciosRes.data : []);

        if (Array.isArray(categoriasRes.data)) {
          setCategorias(categoriasRes.data);
        }

        prepararServiciosOferta(serviciosRes.data || []);
      } catch (err) {
        console.error("Error al cargar servicios:", err);
        toast.error("Error al cargar servicios o categorías");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [prepararServiciosOferta]);

  // Máximo 6 servicios destacados
  const featuredServices = servicios
    .filter((s) => s.Descuento > 0)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  const filteredServices = servicios.filter((servicio) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(servicio.CategoriaId) === selectedCategory;
    const matchesSearch = servicio.Nombre.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    return matchesCategory && matchesSearch;
  });

  // Función para navegar al detalle del servicio
  const handleViewDetails = (servicioId, e) => {
    if (e) e.stopPropagation();
    navigate(`/servicios/${servicioId}`);
  };

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredServices.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredServices.length) % featuredServices.length
    );
  };

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const calcularPrecioConDescuento = (precio, descuento) => {
    return precio - (precio * descuento) / 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Cargando servicios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <header className="bg-white border-b border-slate-200 sticky top-[56px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
            <div className="relative w-full md:w-[500px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar servicio..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-[80px]">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8 mt-8">
            {/* Carrusel de servicios destacados */}
            {featuredServices.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Servicios Destacados</h2>
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredServices.map((servicio) => (
                      <div key={servicio.ServicioId} className="min-w-full">
                        <div className="relative h-64 md:h-[320px]">
                          <img
                            src={servicio.Imagen || "/multimedia/placeholder.jpg"}
                            alt={servicio.Nombre}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="max-w-2xl">
                              <h3 className="text-xl md:text-2xl font-bold mb-2">
                                {servicio.Nombre}
                              </h3>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-lg md:text-xl font-bold">
                                  {formatPrice(calcularPrecioConDescuento(servicio.Precio, servicio.Descuento))}
                                </span>
                                {servicio.Descuento > 0 && (
                                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                                    -{servicio.Descuento}%
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => handleViewDetails(servicio.ServicioId, e)}
                                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1 inline" />
                                  Ver Detalles
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {featuredServices.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {featuredServices.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all ${currentSlide === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                              }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Listado de servicios */}
            <section>
              <div className="flex items-center justify-center mb-7">
                <h2 className="text-2xl font-bold text-slate-800">
                  Todos los Servicios
                  {selectedCategory !== "all" && (
                    <span className="text-slate-600 ml-2">
                      ({filteredServices.length})
                    </span>
                  )}
                </h2>
              </div>

              {filteredServices.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  No se encontraron servicios que coincidan con tu búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredServices.map((servicio) => (
                    <div
                      key={servicio.ServicioId}
                      onClick={(e) => handleViewDetails(servicio.ServicioId, e)}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={servicio.Imagen || "/multimedia/placeholder.jpg"}
                          alt={servicio.Nombre}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/multimedia/placeholder.jpg")
                          }
                        />
                        {/* Botones estáticos (siempre visibles) */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={(e) => handleViewDetails(servicio.ServicioId, e)}
                            className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg"
                          >
                            <ShoppingCart className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-1 text-slate-800">
                          {servicio.Nombre}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {servicio.Descripcion}
                        </p>
                        <div className="flex items-center justify-between">
                          {servicio.Descuento > 0 && (
                            <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                              -{servicio.Descuento}%
                            </span>
                          )}
                          <span
                            className={`text-lg font-bold ${servicio.Descuento > 0 ? "text-red-600 line-through" : "text-blue-600"
                              }`}
                          >
                            {formatPrice(servicio.Precio)}
                          </span>
                          {servicio.Descuento > 0 && (
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(calcularPrecioConDescuento(servicio.Precio, servicio.Descuento))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Categorías</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${selectedCategory === "all"
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    <span className="font-medium">Todos los Servicios</span>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                      {servicios.length}
                    </span>
                  </button>
                  {categorias.map((cat) => (
                    <button
                      key={cat.CategoriaId}
                      onClick={() => setSelectedCategory(String(cat.CategoriaId))}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition ${selectedCategory === String(cat.CategoriaId)
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <span className="font-medium">{cat.Nombre}</span>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        {
                          servicios.filter(
                            (s) => String(s.CategoriaId) === String(cat.CategoriaId)
                          ).length
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Oferta especial para servicios */}
              <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2">¡Oferta Especial en Servicios!</h3>
                <p className="text-sm opacity-90 mb-4">
                  Obtén descuentos en varios de los servicios que ofrecemos
                </p>
                <button
                  onClick={() => setShowOfertasModal(true)}
                  className="w-full bg-white text-green-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Ver Ofertas
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Ofertas para Servicios */}
      {showOfertasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Encabezado del Modal */}
            <div className="shrink-0 bg-gradient-to-r from-green-600 to-teal-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-6 w-6" />
                  <div>
                    <h2 className="text-2xl font-bold">Ofertas Especiales en Servicios</h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowOfertasModal(false)}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {serviciosOferta.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg">No hay ofertas disponibles en este momento</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {serviciosOferta.map((servicio) => (
                        <div
                          key={servicio.ServicioId}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                          <div className="relative h-48">
                            <img
                              src={servicio.Imagen || "/multimedia/placeholder.jpg"}
                              alt={servicio.Nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                            />
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md font-bold text-sm">
                              -{servicio.Descuento}%
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(servicio.ServicioId, e);
                                setShowOfertasModal(false);
                              }}
                              className="absolute bottom-3 right-3 bg-green-600 text-white rounded-full p-2 hover:bg-green-700 shadow-lg"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-800 mb-2 line-clamp-1">
                              {servicio.Nombre}
                            </h3>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {servicio.Descripcion}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-500 line-through">
                                  {formatPrice(servicio.Precio)}
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  {formatPrice(calcularPrecioConDescuento(servicio.Precio, servicio.Descuento))}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowOfertasModal(false);
                                  handleViewDetails(servicio.ServicioId, e);
                                }}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Ver detalles →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Información adicional */}
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-100 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Tag className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 mb-2">¿Cómo funciona la oferta?</h3>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• Aplica para servicios personalizados</li>
                            <li>• El descuento se aplica automáticamente al contratar</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pie del Modal - Siempre visible */}
            <div className="shrink-0 border-t border-slate-200 p-4 bg-slate-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowOfertasModal(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};