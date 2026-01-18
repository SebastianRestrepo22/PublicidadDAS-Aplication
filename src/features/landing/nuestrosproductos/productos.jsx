import React, { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { GetDataproductos } from "../../dashboard/productos/services/services.products";
import { getAllCategorias } from "../../dashboard/categoriadediseño/services/services.categoria";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";

export const Productos = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productosRes, categoriasRes] = await Promise.all([
          GetDataproductos(),
          getAllCategorias(),
        ]);

        const productosSolo = productosRes.data.filter((p) => p.Tipo === "producto");
        setProductos(productosSolo);

        if (categoriasRes?.data) {
          setCategorias(categoriasRes.data);
        }
      } catch (err) {
        toast.error("Error al cargar productos o categorías");
      }
    };
    fetchData();
  }, []);

  const featuredProducts = productos
    .filter((p) => p.Descuento > 0)
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  const filteredProducts = productos.filter((producto) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(producto.CategoriaId) === selectedCategory;
    const matchesSearch = producto.Nombre.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    return matchesCategory && matchesSearch;
  });

  const handleAddClick = (producto) => {
    if (producto.EsPersonalizado) {
      navigate("/carritoproducto", {
        state: { item: producto, from: "/productos" },
      });
      return;
    }

    const stock = producto.Stock ?? producto.stock ?? null;
    const existing = cart.find(
      (item) => item.ProductoServicioId === producto.ProductoServicioId
    );
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (stock !== null && newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    addToCart(producto, {}, 1);
    toast.success(`${producto.Nombre} agregado al carrito`);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
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
                placeholder="Buscar producto..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchkQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            {/* Carrusel */}
            {featuredProducts.length > 0 && (
              <section>
                {/* ✅ Subtítulo bajado más: mb-8 */}
                <h2 className="text-2xl font-bold mt-10 text-slate-800">Productos Destacados</h2>
                <div className="relative overflow-hidden mt-5 rounded-2xl bg-white shadow-lg">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredProducts.map((producto) => (
                      <div key={producto.ProductoServicioId} className="min-w-full">
                        <div className="relative h-64 md:h-[320px]">
                          {producto.UrlImagen ? (
                            <img
                              src={producto.UrlImagen}
                              alt={producto.Nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <div className="max-w-2xl">
                              <h3 className="text-xl md:text-2xl font-bold mb-2">
                                {producto.Nombre}
                              </h3>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-lg md:text-xl font-bold">
                                  {formatPrice(
                                    producto.Precio -
                                    (producto.Precio * producto.Descuento) / 100
                                  )}
                                </span>
                                {producto.Descuento > 0 && (
                                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                                    -{producto.Descuento}%
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddClick(producto)}
                                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1 inline" />
                                  Añadir al Carrito
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
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${currentSlide === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Listado de productos */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">
                  Todos los Productos
                  {selectedCategory !== "all" && (
                    <span className="text-slate-600 ml-2">
                      ({filteredProducts.length})
                    </span>
                  )}
                </h2>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  No se encontraron productos que coincidan con tu búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((producto) => (
                    <div
                      key={producto.ProductoServicioId}
                      onClick={() => navigate(`/productos/${producto.ProductoServicioId}`, { state: { producto } })}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={producto.UrlImagen || "/multimedia/placeholder.jpg"}
                          alt={producto.Nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                        />
                        {/* ✅ Botones estáticos (siempre visibles) */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => toggleFavorite(producto.ProductoServicioId)}
                            className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg"
                          >
                            <Heart
                              className={`h-5 w-5 ${favorites.includes(producto.ProductoServicioId)
                                ? "fill-red-500 text-red-500"
                                : ""
                                }`}
                            />
                          </button>
                          <button
                            onClick={() => handleAddClick(producto)}
                            className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg"
                          >
                            <ShoppingCart className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-1 text-slate-800">
                          {producto.Nombre}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {producto.Descripcion}
                        </p>
                        <div className="flex items-center justify-between">
                          {producto.Descuento > 0 && (
                            <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                              -{producto.Descuento}%
                            </span>
                          )}
                          <span
                            className={`text-lg font-bold ${producto.Descuento > 0 ? "text-red-600 line-through" : "text-blue-600"
                              }`}
                          >
                            {formatPrice(producto.Precio)}
                          </span>
                          {producto.Descuento > 0 && (
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(
                                producto.Precio - (producto.Precio * producto.Descuento) / 100
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
            <div className="sticky top-24 space-y-8">
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
                    <span className="font-medium">Todos los Productos</span>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                      {productos.length}
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
                          productos.filter(
                            (p) => String(p.CategoriaId) === String(cat.CategoriaId)
                          ).length
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2">¡Oferta Especial!</h3>
                <p className="text-sm opacity-90 mb-4">
                  Obtén 20% de descuento en tu primera orden de más de $200
                </p>
                <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                  Ver Ofertas
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
      />
    </div>
  );
};