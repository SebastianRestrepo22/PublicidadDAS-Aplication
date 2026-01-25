import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Heart,
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
  Tag,
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
  const [productosConColores, setProductosConColores] = useState({});
  const [showOfertasModal, setShowOfertasModal] = useState(false);
  const [productosOferta, setProductosOferta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const prepararProductosOferta = useCallback((productosData) => {
    const productosConDescuento = productosData.filter(p => p.Descuento > 0);
    const ofertasAleatorias = [...productosConDescuento]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setProductosOferta(ofertasAleatorias);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productosRes, categoriasRes] = await Promise.all([
          GetDataproductos(),
          getAllCategorias(),
        ]);

        if (!isMounted) return;

        const productosData = productosRes.data || [];
        setProductos(productosData);
        setCategorias(categoriasRes.data || []);

        const coloresMap = {};
        productosData.forEach(producto => {
          const tieneColores = producto.Colores && Array.isArray(producto.Colores) && producto.Colores.length > 0;
          coloresMap[producto.ProductoId] = tieneColores;
        });
        setProductosConColores(coloresMap);

        prepararProductosOferta(productosData);
      } catch (err) {
        console.error("Error al cargar productos o categorías:", err);
        toast.error("Error al cargar productos o categorías");
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
  }, [prepararProductosOferta]);

  const featuredProducts = useMemo(() => {
    return productos
      .filter((p) => p.Descuento > 0)
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  }, [productos]);

  const filteredProducts = productos.filter((producto) => {
    const matchesCategory =
      selectedCategory === "all" ||
      String(producto.CategoriaId || "") === selectedCategory;

    const matchesSearch = producto.Nombre.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    return matchesCategory && matchesSearch;
  });

  const handleAddClick = useCallback((producto) => {
    if (producto.EsPersonalizado) {
      navigate("/carritoproducto", {
        state: { item: producto, from: "/productos" },
      });
      return;
    }

    const tieneColores = productosConColores[producto.ProductoId] || 
                        (producto.Colores && Array.isArray(producto.Colores) && producto.Colores.length > 0);

    if (tieneColores) {
      navigate(`/productos/${producto.ProductoId}`, { 
        state: { producto } 
      });
      toast.info(`Por favor selecciona un color para ${producto.Nombre}`);
      return;
    }

    const stock = producto.Stock ?? producto.stock ?? null;
    const existing = cart.find(
      (item) => item.ProductoId === producto.ProductoId
    );
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (stock !== null && newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    addToCart(producto, {}, 1);
    toast.success(`${producto.Nombre} agregado al carrito`);
  }, [productosConColores, cart, addToCart, navigate]);

  const handleAddFromModal = useCallback((producto) => {
    const tieneColores = productosConColores[producto.ProductoId] || 
                        (producto.Colores && Array.isArray(producto.Colores) && producto.Colores.length > 0);

    if (tieneColores) {
      setShowOfertasModal(false);
      navigate(`/productos/${producto.ProductoId}`, { 
        state: { producto } 
      });
      toast.info(`Por favor selecciona un color para ${producto.Nombre}`);
      return;
    }

    const stock = producto.Stock ?? producto.stock ?? null;
    const existing = cart.find(
      (item) => item.ProductoId === producto.ProductoId
    );
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (stock !== null && newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    addToCart(producto, {}, 1);
    toast.success(`${producto.Nombre} agregado al carrito desde ofertas`);
  }, [productosConColores, cart, addToCart, navigate]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  }, [featuredProducts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
    );
  }, [featuredProducts.length]);

  const formatPrice = useCallback((precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  }, []);

  const calcularPrecioConDescuento = useCallback((precio, descuento) => {
    return precio - (precio * descuento) / 100;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Cargando productos...</p>
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
                placeholder="Buscar producto..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-[80px]">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            {/* Carrusel */}
            {featuredProducts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mt-10 text-slate-800">Productos Destacados</h2>
                <div className="relative overflow-hidden mt-5 rounded-2xl bg-white shadow-lg">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {featuredProducts.map((producto) => (
                      <div key={producto.ProductoId} className="min-w-full">
                        <div className="relative h-64 md:h-[320px]">
                          {producto.Imagen ? (
                            <img
                              src={producto.Imagen}
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
                                    calcularPrecioConDescuento(producto.Precio, producto.Descuento)
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddClick(producto);
                                  }}
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
                      key={producto.ProductoId}
                      onClick={() => navigate(`/productos/${producto.ProductoId}`, { state: { producto } })}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={producto.Imagen || "/multimedia/placeholder.jpg"}
                          alt={producto.Nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddClick(producto);
                            }}
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
                              {formatPrice(calcularPrecioConDescuento(producto.Precio, producto.Descuento))}
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
                  Obtén descuentos en los productos que ofrecemos
                </p>
                <button 
                  onClick={() => setShowOfertasModal(true)}
                  className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  Ver Ofertas
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal de Ofertas - ESTRUCTURA CORREGIDA */}
      {showOfertasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Encabezado del Modal - Siempre visible */}
            <div className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="h-6 w-6" />
                  <div>
                    <h2 className="text-2xl font-bold">Ofertas Especiales</h2>
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
                {productosOferta.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg">No hay ofertas disponibles en este momento</p>
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {productosOferta.map((producto) => (
                        <div
                          key={producto.ProductoId}
                          className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
                        >
                          <div className="relative h-48">
                            <img
                              src={producto.Imagen || "/multimedia/placeholder.jpg"}
                              alt={producto.Nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                            />
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md font-bold text-sm">
                              -{producto.Descuento}%
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddFromModal(producto);
                              }}
                              className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow-lg"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-800 mb-2 line-clamp-1">
                              {producto.Nombre}
                            </h3>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {producto.Descripcion}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-500 line-through">
                                  {formatPrice(producto.Precio)}
                                </span>
                                <span className="text-lg font-bold text-blue-600">
                                  {formatPrice(calcularPrecioConDescuento(producto.Precio, producto.Descuento))}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowOfertasModal(false);
                                  navigate(`/productos/${producto.ProductoId}`, { 
                                    state: { producto } 
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Ver detalles →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Información adicional */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Tag className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 mb-2">¿Cómo funciona la oferta?</h3>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• Aplica para todos los productos que tengan un descuento</li>
                            <li>• El descuento se aplica automáticamente al finalizar la compra</li>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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