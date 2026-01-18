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
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4">
            <div className="relative w-full md:w-[500px]">
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
          <div className="flex-1 space-y-8 mt-8">
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
                      key={servicio.ProductoServicioId}
                      onClick={() => navigate(`/servicios/${servicio.ProductoServicioId}`)}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
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
                              className={`h-5 w-5 ${favorites.includes(servicio.ProductoServicioId)
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
                            className={`text-lg font-bold ${servicio.Descuento > 0 ? "text-red-600 line-through" : "text-blue-600"
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