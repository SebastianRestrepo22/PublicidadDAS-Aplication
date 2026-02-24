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
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { GetDataproductos } from "../../dashboard/productos/services/services.products";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { getAllCategorias } from "../../dashboard/categoria/services/services.categoria";

export const Productos = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showOfertasModal, setShowOfertasModal] = useState(false);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [productosOferta, setProductosOferta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 NUEVA FUNCIÓN: Obtener stock según el tipo de producto
  const obtenerStockProducto = useCallback((producto) => {
    // Si usa colores (UsaColores === 1 o "1")
    if (producto.UsaColores === 1 || producto.UsaColores === "1") {
      // Stock total de todos los colores
      return producto.Colores && Array.isArray(producto.Colores) 
        ? producto.Colores.reduce((sum, color) => sum + (color.Stock || 0), 0)
        : 0;
    } else {
      // Stock general
      return producto.Stock || 0;
    }
  }, []);

  // 🔥 NUEVA FUNCIÓN: Verificar si tiene stock disponible
  const tieneStockDisponible = useCallback((producto) => {
    return obtenerStockProducto(producto) > 0;
  }, [obtenerStockProducto]);

  const prepararProductosOferta = useCallback((productosData) => {
    // SOLO productos activos y con descuento
    const productosActivosConDescuento = productosData.filter(p => 
      p.Estado === 'Activo' && p.Descuento > 0 && tieneStockDisponible(p)
    );
    const ofertasAleatorias = [...productosActivosConDescuento]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setProductosOferta(ofertasAleatorias);
  }, [tieneStockDisponible]);

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

        // Filtrar SOLO productos ACTIVOS
        const productosData = (productosRes.data || []).filter(
          producto => producto.Estado === 'Activo'
        );
        setProductos(productosData);
        setCategorias(categoriasRes.data || []);

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

  // Productos destacados - SOLO activos, con descuento y con stock
  const featuredProducts = useMemo(() => {
    return productos
      .filter((p) => p.Estado === 'Activo' && p.Descuento > 0 && tieneStockDisponible(p))
      .sort(() => 0.5 - Math.random())
      .slice(0, 6);
  }, [productos, tieneStockDisponible]);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return productos.filter((producto) => {
      // Si seleccionó "ofertas", mostrar solo productos con descuento
      if (selectedCategory === "ofertas") {
        return producto.Descuento > 0;
      }

      const matchesCategory =
        selectedCategory === "all" ||
        String(producto.CategoriaId || "") === selectedCategory;

      const matchesSearch = producto.Nombre.toLowerCase().includes(
        searchQuery.toLowerCase()
      );
      return matchesCategory && matchesSearch;
    });
  }, [productos, selectedCategory, searchQuery]);

  const handleAddClick = useCallback((producto) => {
    // Verificar stock según el tipo de producto
    const stockTotal = obtenerStockProducto(producto);
    
    if (stockTotal === 0) {
      toast.error(`Producto ${producto.Nombre} sin stock disponible`);
      return;
    }

    // Si usa colores, redirigir a detalle para seleccionar color
    if (producto.UsaColores === 1 || producto.UsaColores === "1") {
      navigate(`/productos/${producto.ProductoId}`, {
        state: { producto }
      });
      toast.info(`Por favor selecciona un color para ${producto.Nombre}`);
      return;
    }

    // Stock general
    const existing = cart.find(
      (item) => item.ProductoId === producto.ProductoId
    );
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > stockTotal) {
      toast.error(`Solo hay ${stockTotal} unidades disponibles`);
      return;
    }

    addToCart(producto, {}, 1);
    toast.success(`${producto.Nombre} agregado al carrito`);
  }, [obtenerStockProducto, cart, addToCart, navigate]);

  const handleAddFromModal = useCallback((producto) => {
    const stockTotal = obtenerStockProducto(producto);
    
    if (stockTotal === 0) {
      toast.error(`Producto ${producto.Nombre} sin stock disponible`);
      return;
    }

    if (producto.UsaColores === 1 || producto.UsaColores === "1") {
      setShowOfertasModal(false);
      navigate(`/productos/${producto.ProductoId}`, {
        state: { producto }
      });
      toast.info(`Por favor selecciona un color para ${producto.Nombre}`);
      return;
    }

    const existing = cart.find(
      (item) => item.ProductoId === producto.ProductoId
    );
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > stockTotal) {
      toast.error(`Solo hay ${stockTotal} unidades disponibles`);
      return;
    }

    addToCart(producto, {}, 1);
    toast.success(`${producto.Nombre} agregado al carrito desde ofertas`);
  }, [obtenerStockProducto, cart, addToCart, navigate]);

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

  const handleCategorySelect = useCallback((categoriaId) => {
    setSelectedCategory(String(categoriaId));
    setShowCategoriasModal(false);
  }, []);

  // Contar productos con descuento que tienen stock
  const productosConDescuentoCount = useMemo(() => {
    return productos.filter(p => 
      p.Descuento > 0 && tieneStockDisponible(p)
    ).length;
  }, [productos, tieneStockDisponible]);

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
                  {selectedCategory === "all" && "Todos los Productos"}
                  {selectedCategory === "ofertas" && "Productos en Oferta"}
                  {selectedCategory !== "all" && selectedCategory !== "ofertas" && (
                    <>
                      {categorias.find(c => String(c.CategoriaId) === selectedCategory)?.Nombre || "Categoría"}
                    </>
                  )}
                  <span className="text-slate-600 ml-2">
                    ({filteredProducts.length})
                  </span>
                </h2>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  No se encontraron productos que coincidan con tu búsqueda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((producto) => {
                    const stockTotal = obtenerStockProducto(producto);
                    const sinStock = stockTotal === 0;
                    
                    return (
                      <div
                        key={producto.ProductoId}
                        onClick={() => !sinStock && navigate(`/productos/${producto.ProductoId}`, { state: { producto } })}
                        className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer ${sinStock ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                                if (!sinStock) handleAddClick(producto);
                              }}
                              disabled={sinStock}
                              className={`bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg ${sinStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ShoppingCart className="h-5 w-5" />
                            </button>
                          </div>
                          {sinStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                                AGOTADO
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-1 text-slate-800">
                            {producto.Nombre}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                            {producto.Descripcion}
                          </p>

                          {/* Mostrar stock según tipo */}
                          <div className="mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sinStock
                                ? 'bg-red-100 text-red-800'
                                : stockTotal > 10
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              Stock: {stockTotal} {producto.UsaColores === 1 || producto.UsaColores === "1" ? '(total)' : 'unidades'}
                            </span>
                          </div>

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
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-[120px] space-y-4 py-[60px]">
              {/* Botón de Categorías */}
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

              {/* Botón de Ofertas */}
              <button
                onClick={() => {
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
                        {productosConDescuentoCount} productos con descuento
                      </p>
                    </div>
                  </div>
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {productosConDescuentoCount}
                  </div>
                </div>
              </button>

              {/* Widget informativo */}
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

      {/* Modal de Categorías */}
      {showCategoriasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Encabezado del Modal - Azul oscuro sólido */}
            <div className="shrink-0 bg-blue-800 text-white p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-700 p-2 rounded-lg">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Categorías</h2>
                    <p className="text-sm text-blue-100">
                      {categorias.length} categorías • {productos.length} productos
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

            {/* Contenido del Modal - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Tarjeta de "Todos los Productos" */}
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
                    <span className="font-medium">Todos los Productos</span>
                  </div>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${selectedCategory === "all"
                    ? "bg-blue-700 text-white"
                    : "bg-gray-100 text-gray-700"
                    }`}>
                    {productos.length}
                  </span>
                </button>
              </div>

              {/* Separador simple */}
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

              {/* Grid de Categorías - Más compacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorias.map((cat) => {
                  const productCount = productos.filter(
                    (p) => String(p.CategoriaId) === String(cat.CategoriaId)
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
                        {productCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mensaje cuando no hay categorías */}
              {categorias.length === 0 && (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No hay categorías disponibles</p>
                </div>
              )}
            </div>

            {/* Pie del Modal */}
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

      {/* Modal de Ofertas */}
      {showOfertasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Encabezado del Modal - Rojo elegante (burdeos) */}
            <div className="shrink-0 bg-gradient-to-r from-red-600 to-red-600 text-white p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-700/50 p-2 rounded-lg">
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Ofertas Especiales</h2>
                    <p className="text-sm text-red-100">
                      {productosConDescuentoCount} productos con descuento
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOfertasModal(false)}
                  className="bg-red-700/50 hover:bg-red-700 rounded-full p-2 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5">
              {productosOferta.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No hay ofertas disponibles en este momento</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {productosOferta.map((producto) => {
                    const stockTotal = obtenerStockProducto(producto);
                    const sinStock = stockTotal === 0;
                    
                    return (
                      <div
                        key={producto.ProductoId}
                        className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group ${sinStock ? 'opacity-75' : ''}`}
                      >
                        <div className="relative h-40">
                          <img
                            src={producto.Imagen || "/multimedia/placeholder.jpg"}
                            alt={producto.Nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                          />
                          {/* Badge de descuento en rojo elegante */}
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-800 to-red-900 text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
                            -{producto.Descuento}%
                          </div>
                          {sinStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                AGOTADO
                              </span>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!sinStock) handleAddFromModal(producto);
                            }}
                            disabled={sinStock}
                            className={`absolute bottom-2 right-2 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-full p-1.5 hover:from-red-700 hover:to-red-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity ${sinStock ? 'hidden' : ''}`}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1 text-gray-800">
                            {producto.Nombre}
                          </h3>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {producto.Descripcion}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(producto.Precio)}
                              </span>
                              <span className="text-sm font-bold text-red-800 ml-1">
                                {formatPrice(calcularPrecioConDescuento(producto.Precio, producto.Descuento))}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!sinStock) {
                                  setShowOfertasModal(false);
                                  navigate(`/productos/${producto.ProductoId}`, {
                                    state: { producto }
                                  });
                                }
                              }}
                              disabled={sinStock}
                              className={`text-red-800 hover:text-red-600 text-xs font-medium ${sinStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              Ver detalles →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="shrink-0 border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowOfertasModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-600 to-red-600 text-white hover:from-red-700 hover:to-red-800 shadow-md"
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