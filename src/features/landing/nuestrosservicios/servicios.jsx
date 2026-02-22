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
  Layers,
  Ruler,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetDataservicios, getTamanosByServicio } from "../../dashboard/servicios/services/services.servicios";
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
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [serviciosOferta, setServiciosOferta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tamanosMap, setTamanosMap] = useState({});

  // Función para obtener información de tamaños
  const getTamanosInfo = async (servicioId) => {
    try {
      const tamanos = await getTamanosByServicio(servicioId);
      if (tamanos && tamanos.length > 0) {
        const precios = tamanos.map(t => t.Precio);
        return {
          minPrecio: Math.min(...precios),
          maxPrecio: Math.max(...precios),
          cantidad: tamanos.length,
          tamanos: tamanos.sort((a, b) => a.Precio - b.Precio)
        };
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo tamaños:", error);
      return null;
    }
  };

  // Cargar tamaños para servicios POR_TAMANO
  useEffect(() => {
    const cargarTamanosParaServicios = async () => {
      const serviciosPorTamano = servicios.filter(s => s.TipoPrecio === 'POR_TAMANO');
      const nuevoMap = { ...tamanosMap };

      for (const servicio of serviciosPorTamano) {
        try {
          const info = await getTamanosInfo(servicio.ServicioId);
          if (info) {
            nuevoMap[servicio.ServicioId] = info;
          }
        } catch (error) {
          console.error(`Error cargando tamaños para servicio ${servicio.ServicioId}:`, error);
        }
      }

      setTamanosMap(nuevoMap);
    };

    if (servicios.length > 0) {
      cargarTamanosParaServicios();
    }
  }, [servicios]);

  // Preparar servicios en oferta (solo activos)
  const prepararServiciosOferta = useCallback((serviciosData) => {
    const serviciosActivos = serviciosData.filter(s => s.Estado === "Activo");
    const serviciosConDescuento = serviciosActivos.filter(s => s.Descuento > 0);
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

        // Filtrar solo servicios ACTIVOS
        const serviciosActivos = Array.isArray(serviciosRes.data)
          ? serviciosRes.data.filter(s => s.Estado === "Activo")
          : [];

        setServicios(serviciosActivos);

        if (Array.isArray(categoriasRes.data)) {
          setCategorias(categoriasRes.data);
        }

        prepararServiciosOferta(serviciosActivos);
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

  // Servicios destacados (solo activos)
  const featuredServices = servicios
    .filter((s) => s.Descuento > 0)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  // Filtrar servicios activos
  const filteredServices = servicios.filter((servicio) => {
    // Solo mostrar servicios activos (ya filtrados arriba, pero por seguridad)
    if (servicio.Estado !== "Activo") return false;

    // Si seleccionó "ofertas", mostrar solo servicios con descuento
    if (selectedCategory === "ofertas") {
      return servicio.Descuento > 0;
    }

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
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const calcularPrecioConDescuento = (precio, descuento) => {
    return precio - (precio * descuento) / 100;
  };

  // Componente para precios ÚNICOS - altura fija y diseño consistente
  const PrecioUnico = ({ servicio, formatPrice, calcularPrecioConDescuento }) => {
    const tieneDescuento = servicio.Descuento > 0;

    return (
      <div className="h-[64px] flex flex-col justify-center">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${tieneDescuento
          ? 'bg-red-50 border-red-200'
          : 'bg-blue-50 border-blue-200'
          }`}>
          {tieneDescuento ? (
            <>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(servicio.Precio)}
              </span>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(calcularPrecioConDescuento(servicio.Precio, servicio.Descuento))}
              </span>
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                -{servicio.Descuento}%
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(servicio.Precio)}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Componente para mostrar precios de servicios POR TAMAÑO - AHORA SOLO 2 PRECIOS
  const PrecioPorTamano = ({ servicio, tamanosInfo, formatPrice, calcularPrecioConDescuento }) => {
    // Loading state con misma altura
    if (!tamanosInfo) {
      return (
        <div className="h-[64px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-300 border-t-blue-600"></div>
            <span>Cargando precios...</span>
          </div>
        </div>
      );
    }

    const tieneDescuento = servicio.Descuento > 0;
    const minPrecio = tieneDescuento
      ? calcularPrecioConDescuento(tamanosInfo.minPrecio, servicio.Descuento)
      : tamanosInfo.minPrecio;

    return (
      <div className="h-[64px] flex flex-col justify-center">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${tieneDescuento
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
          }`}>
          <Ruler className={`w-4 h-4 ${tieneDescuento ? 'text-red-600' : 'text-blue-600'}`} />

          <div className="flex items-baseline gap-2">
            {tieneDescuento && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(tamanosInfo.minPrecio)}
              </span>
            )}
            <span className={`text-lg font-bold ${tieneDescuento ? 'text-red-600' : 'text-blue-600'}`}>
              {formatPrice(minPrecio)}
            </span>
            <span className={`text-xs ${tieneDescuento ? 'text-red-600' : 'text-blue-600'} font-medium`}>
              desde
            </span>
          </div>

          {tieneDescuento && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              -{servicio.Descuento}%
            </span>
          )}
        </div>

        {/* Badge de tamaños - fuera del contenedor principal para no afectar altura */}
        <div className="mt-1 pl-1">
          <span className="text-[10px] text-gray-500">
            {tamanosInfo.cantidad} tamaño{tamanosInfo.cantidad > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  };

  const handleCategorySelect = useCallback((categoriaId) => {
    setSelectedCategory(String(categoriaId));
    setShowCategoriasModal(false);
  }, []);

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
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-200px)]">
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
                        <div className="relative h-48 overflow-hidden flex-shrink-0 group">
                          {/* Imagen con z-index base */}
                          <img
                            src={servicio.Imagen || "/multimedia/placeholder.jpg"}
                            alt={servicio.Nombre}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            style={{ zIndex: 1 }}
                            onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                          />

                          {/* Overlay oscuro sutil al hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" style={{ zIndex: 2 }} />

                          {/* Badges - posicionados con más margen y z-index alto */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                            {(servicio.Descuento > 0 || servicio.TipoPrecio === 'POR_TAMANO') && (
                              <div className="flex flex-col gap-1">
                                {servicio.Descuento > 0 && (
                                  <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                    -{servicio.Descuento}%
                                  </span>
                                )}
                                {servicio.TipoPrecio === 'POR_TAMANO' && !servicio.Descuento && (
                                  <span className="bg-blue-500/95 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    Por tamaño
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Botón de carrito - solo visible al hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(servicio.ServicioId, e);
                              }}
                              className="bg-white/95 hover:bg-white text-black rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedCategory === "all" && "Todos los Servicios"}
                  {selectedCategory === "ofertas" && "Servicios en Oferta"}
                  {selectedCategory !== "all" && selectedCategory !== "ofertas" && (
                    <>
                      {categorias.find(c => String(c.CategoriaId) === selectedCategory)?.Nombre || "Categoría"}
                    </>
                  )}
                  <span className="text-slate-600 ml-2">
                    ({filteredServices.length})
                  </span>
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
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col h-full"
                    >
                      {/* Imagen */}
                      <div className="relative h-48 overflow-hidden flex-shrink-0">
                        <img
                          src={servicio.Imagen || "/multimedia/placeholder.jpg"}
                          alt={servicio.Nombre}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={{ zIndex: 1 }}
                          onError={(e) => {
                            console.warn(`Error cargando: ${servicio.Imagen}`);
                            e.currentTarget.src = "/multimedia/placeholder.jpg";
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>

                      {/* Contenido - AGREGAR min-h-0 para que flex funcione */}
                      <div className="p-5 flex-1 flex flex-col min-h-0">
                        <h3 className="font-bold text-lg mb-2 text-slate-800 line-clamp-1">
                          {servicio.Nombre}
                        </h3>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {servicio.Descripcion}
                        </p>

                        {/* Empujar precio al fondo con mt-auto en lugar de flex-1 vacío */}
                        <div className="mt-auto">
                          {servicio.TipoPrecio === 'UNICO' ? (
                            <PrecioUnico servicio={servicio} formatPrice={formatPrice} calcularPrecioConDescuento={calcularPrecioConDescuento} />
                          ) : (
                            <PrecioPorTamano
                              servicio={servicio}
                              tamanosInfo={tamanosMap[servicio.ServicioId]}
                              formatPrice={formatPrice}
                              calcularPrecioConDescuento={calcularPrecioConDescuento}
                            />
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
            <div className="sticky top-[120px] space-y-4 py-[60px]">
              <button
                onClick={() => setShowCategoriasModal(true)}
                className="w-full bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition">
                      <Layers className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-slate-800">Categorías</h3>
                      <p className="text-xs text-slate-500">
                        {selectedCategory === "all" ? "Todas las categorías" :
                          selectedCategory === "ofertas" ? "Ofertas" :
                            categorias.find(c => String(c.CategoriaId) === selectedCategory)?.Nombre || "Seleccionar"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition" />
                </div>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory("ofertas");
                  setShowOfertasModal(true);
                }}
                className="w-full bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-md p-4 hover:shadow-lg transition-all group border border-red-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition">
                      <Tag className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-red-700">Ofertas Especiales</h3>
                      <p className="text-xs text-red-600">
                        {servicios.filter(s => s.Descuento > 0).length} servicios con descuento
                      </p>
                    </div>
                  </div>
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {servicios.filter(s => s.Descuento > 0).length}
                  </div>
                </div>
              </button>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-md p-4">
                <h3 className="font-bold text-base mb-1">¡Encuentra lo que buscas!</h3>
                <p className="text-xs opacity-90">
                  Usa los botones para explorar categorías y ofertas
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modales */}
      {showCategoriasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="shrink-0 bg-blue-800 text-white p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-700 p-2 rounded-lg">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Categorías</h2>
                    <p className="text-sm text-blue-100">
                      {categorias.length} categorías • {servicios.length} servicios activos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoriasModal(false)}
                  className="bg-blue-700 hover:bg-blue-600 rounded-full p-2 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4">
                <button
                  onClick={() => handleCategorySelect("all")}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition border ${selectedCategory === "all"
                    ? "bg-blue-800 text-white border-blue-800"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`h-5 w-5 ${selectedCategory === "all" ? "text-white" : "text-blue-800"}`} />
                    <span className="font-medium">Todos los Servicios</span>
                  </div>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${selectedCategory === "all"
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-700"
                    }`}>
                    {servicios.length}
                  </span>
                </button>
              </div>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-medium text-gray-500">
                    Categorías
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorias.map((cat) => {
                  const serviceCount = servicios.filter(
                    (s) => String(s.CategoriaId) === String(cat.CategoriaId)
                  ).length;

                  return (
                    <button
                      key={cat.CategoriaId}
                      onClick={() => handleCategorySelect(cat.CategoriaId)}
                      className={`flex items-center justify-between p-3 rounded-lg transition border ${selectedCategory === String(cat.CategoriaId)
                        ? "bg-blue-800 text-white border-blue-800"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === String(cat.CategoriaId)
                          ? "bg-white"
                          : "bg-blue-800"
                          }`} />
                        <span className="font-medium text-sm">{cat.Nombre}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === String(cat.CategoriaId)
                        ? "bg-blue-700 text-white"
                        : "bg-gray-100 text-gray-700"
                        }`}>
                        {serviceCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCategoriasModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowCategoriasModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-800 text-white hover:bg-blue-700"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOfertasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="shrink-0 bg-gradient-to-r from-red-800 to-red-900 text-white p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-700/50 p-2 rounded-lg">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Ofertas Especiales</h2>
                    <p className="text-sm text-red-100">
                      {servicios.filter(s => s.Descuento > 0).length} servicios con descuento
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOfertasModal(false);
                    setSelectedCategory("all");
                  }}
                  className="bg-red-700/50 hover:bg-red-700 rounded-full p-2 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {serviciosOferta.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {serviciosOferta.map((servicio) => (
                    <div
                      key={servicio.ServicioId}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group"
                    >
                      <div className="relative h-40">
                        <img
                          src={servicio.Imagen || "/multimedia/placeholder.jpg"}
                          alt={servicio.Nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                        />
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-800 to-red-900 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
                          -{servicio.Descuento}%
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(servicio.ServicioId, e);
                            setShowOfertasModal(false);
                          }}
                          className="absolute bottom-2 right-2 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-full p-1.5 hover:from-red-700 hover:to-red-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1 text-gray-800">
                          {servicio.Nombre}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {servicio.Descripcion}
                        </p>
                        <div className="flex items-center justify-between">
                          {servicio.TipoPrecio === 'UNICO' ? (
                            <div>
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(servicio.Precio)}
                              </span>
                              <span className="text-sm font-bold text-red-800 ml-1">
                                {formatPrice(calcularPrecioConDescuento(servicio.Precio, servicio.Descuento))}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                Por tamaño
                              </span>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowOfertasModal(false);
                              handleViewDetails(servicio.ServicioId, e);
                            }}
                            className="text-red-800 hover:text-red-600 text-xs font-medium"
                          >
                            Ver detalles →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowOfertasModal(false);
                    setSelectedCategory("all");
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-800 to-red-900 text-white hover:from-red-700 hover:to-red-800 shadow-md"
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