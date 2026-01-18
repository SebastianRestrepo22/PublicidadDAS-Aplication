import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import {
  Heart,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetDataservicios } from "../../dashboard/servicios/services/services.servicios";
import { getAllCategorias } from "../../dashboard/categoriadediseño/services/services.categoria";
import { useCart } from "../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Servicios = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviciosRes, categoriasRes] = await Promise.all([
          GetDataservicios(),
          getAllCategorias(),
        ]);

        const serviciosSolo = serviciosRes.data.filter((s) => s.Tipo === "servicio");
        setServicios(serviciosSolo);

        if (categoriasRes?.data) {
          setCategorias(categoriasRes.data);
        }
      } catch (err) {
        toast.error("Error al cargar servicios o categorías");
      }
    };
    fetchData();
  }, []);

  // ✅ Máximo 6 servicios destacados
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

  const handleAddClick = (servicio) => {
    navigate("/carritoproducto", {
      state: { item: servicio, from: "/servicios" },
    });
  };

  const toggleFavorite = (id) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <header className="bg-white border-b border-slate-200 sticky top-[56px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                Nuestros Servicios
              </h1>
              <p className="text-slate-600 mt-2">
                Servicios profesionales para llevar tus ideas al siguiente nivel.
              </p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar servicio..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            {/* Carrusel */}
            {featuredServices.length > 0 && (
              <section>
                {/* ✅ Subtítulo bajado con mb-8 */}
                <h2 className="text-2xl font-bold mt-10 text-slate-800">Servicios Destacados</h2>
                <div className="relative overflow-hidden mt-5 rounded-2xl bg-white shadow-lg">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredServices.map((servicio) => (
                      <div key={servicio.ProductoServicioId} className="min-w-full">
                        <div className="relative h-64 md:h-[320px]"> {/* ✅ Más pequeño */}
                          {servicio.UrlImagen ? (
                            <img
                              src={servicio.UrlImagen}
                              alt={servicio.Nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="max-w-2xl">
                              <h3 className="text-xl md:text-2xl font-bold mb-2">
                                {servicio.Nombre}
                              </h3>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-lg md:text-xl font-bold">
                                  {formatPrice(
                                    servicio.Precio -
                                      (servicio.Precio * servicio.Descuento) / 100
                                  )}
                                </span>
                                {servicio.Descuento > 0 && (
                                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                                    -{servicio.Descuento}%
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddClick(servicio)}
                                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1 inline" />
                                  Personalizar Servicio
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
                        className={`h-1.5 rounded-full transition-all ${
                          currentSlide === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Listado de servicios */}
            <section>
              <div className="flex items-center justify-between mb-4">
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
                      key={servicio.ProductoServicioId}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200"
                    >
                      <div className="relative h-64 overflow-hidden">
                        {/* ✅ Sin animación de zoom */}
                        <img
                          src={servicio.UrlImagen || "/multimedia/placeholder.jpg"}
                          alt={servicio.Nombre}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/multimedia/placeholder.jpg")
                          }
                        />
                        {/* ✅ Botones estáticos (siempre visibles) */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => toggleFavorite(servicio.ProductoServicioId)}
                            className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                favorites.includes(servicio.ProductoServicioId)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                          </button>
                          <button
                            onClick={() => handleAddClick(servicio)}
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
                            className={`text-lg font-bold ${
                              servicio.Descuento > 0 ? "text-red-600 line-through" : "text-blue-600"
                            }`}
                          >
                            {formatPrice(servicio.Precio)}
                          </span>
                          {servicio.Descuento > 0 && (
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(
                                servicio.Precio -
                                  (servicio.Precio * servicio.Descuento) / 100
                              )}
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
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                      selectedCategory === "all"
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
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                        selectedCategory === String(cat.CategoriaId)
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

              <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2">¡Paquetes Especiales!</h3>
                <p className="text-sm opacity-90 mb-4">
                  Combina servicios y obtén hasta 25% de descuento en tu proyecto.
                </p>
                <button className="w-full bg-white text-green-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                  Ver Paquetes
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      {/* ✅ Alertas más abajo */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};