import React, { useState, useEffect } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Heart,
  Star,
  Ruler,
  Palette,
  Package,
  Truck,
  Shield,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { getColoresProducto, getProductoByIdService } from "../../dashboard/productos/services/services.products";

export const ProductoDetalle = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const [producto, setProducto] = useState(location.state?.producto || null);
  const [coloresProducto, setColoresProducto] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [tieneColores, setTieneColores] = useState(false);

  const imagenesGaleria = [
    producto?.Imagen || "/multimedia/placeholder.jpg",
  ].filter(img => img);

  useEffect(() => {
    const fetchColores = async () => {
      try {
        const colores = await getColoresProducto(id);
        setColoresProducto(colores);

        // Determinar si el producto tiene colores
        const tieneColores = colores && Array.isArray(colores) && colores.length > 0;
        setTieneColores(tieneColores);

        // Si solo hay un color, seleccionarlo automáticamente
        if (tieneColores && colores.length === 1) {
          setColorSeleccionado(colores[0].Nombre);
        }
      } catch (err) {
        toast.error("No se pudieron cargar los colores");
      }
    };

    if (!producto) {
      const fetchProducto = async () => {
        try {
          const productoData = await getProductoByIdService(id);
          setProducto(productoData);

          // Verificar si el producto viene con colores desde la API
          if (productoData.Colores && Array.isArray(productoData.Colores) && productoData.Colores.length > 0) {
            setTieneColores(true);
            setColoresProducto(productoData.Colores);
          }
        } catch (err) {
          toast.error("Producto no encontrado");
          navigate("/productos");
        }
      };
      fetchProducto();
    } else {
      // Si el producto viene por location.state, verificar si tiene colores
      if (producto.Colores && Array.isArray(producto.Colores) && producto.Colores.length > 0) {
        setTieneColores(true);
        setColoresProducto(producto.Colores);
      } else {
        // Si no viene con colores, hacer fetch
        fetchColores();
      }
    }

    // Si el producto existe pero no tiene colores en state, hacer fetch
    if (producto && !producto.Colores) {
      fetchColores();
    }
  }, [id, navigate, producto]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!producto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const precioFinal =
    producto.Descuento > 0
      ? producto.Precio - (producto.Precio * producto.Descuento) / 100
      : producto.Precio;

  // En la función handleAddToCart:
  const handleAddToCart = () => {
    // Productos personalizados requieren color
    if (producto.EsPersonalizado) {
      if (!colorSeleccionado) {
        toast.error("Por favor selecciona un color");
        return;
      }
    }

    // Productos con colores requieren selección de color
    if (tieneColores && !producto.EsPersonalizado && !colorSeleccionado) {
      toast.error("Por favor selecciona un color antes de agregar al carrito");
      return;
    }

    // Encontrar el color seleccionado y su stock
    const colorSeleccionadoObj = coloresProducto.find(color => color.Nombre === colorSeleccionado);

    // Verificar stock del color seleccionado
    if (colorSeleccionadoObj) {
      const stockColor = colorSeleccionadoObj.Stock || 0;

      // Calcular cuántos ya hay en el carrito con este mismo color
      const existingInCart = cart.filter(item =>
        item.ProductoId === producto.ProductoId &&
        item.customization?.color?.ColorId === colorSeleccionadoObj.ColorId
      );
      const currentQuantityInCart = existingInCart.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalQuantity = currentQuantityInCart + cantidad;

      if (stockColor === 0) {
        toast.error(`El color ${colorSeleccionado} no tiene stock disponible`);
        return;
      }

      if (newTotalQuantity > stockColor) {
        toast.error(`Solo hay ${stockColor} unidades disponibles del color ${colorSeleccionado}`);
        return;
      }
    } else if (tieneColores) {
      toast.error("Color no válido seleccionado");
      return;
    }

    // Incluir color en la personalización si existe
    const customizacion = {};
    if (colorSeleccionadoObj) {
      customizacion.color = {
        ColorId: colorSeleccionadoObj.ColorId,
        Nombre: colorSeleccionadoObj.Nombre,
        Hex: colorSeleccionadoObj.Hex,
        Stock: colorSeleccionadoObj.Stock || 0
      };
    } else if (colorSeleccionado) {
      customizacion.color = {
        ColorId: null,
        Nombre: colorSeleccionado,
        Hex: "#ccc",
        Stock: 0
      };
    }

    addToCart(producto, customizacion, cantidad);
    toast.success(
      `${cantidad} ${producto.Nombre}${colorSeleccionado ? ` (${colorSeleccionado})` : ''} agregado${cantidad > 1 ? "s" : ""} al carrito`
    );
  };

  useEffect(() => {
    console.log("🛒 [CARRITO] Estado actual del carrito:", cart);
    cart.forEach((item, index) => {
      console.log(`  - Item ${index + 1}: ${item.Nombre}`, {
        id: item.id,
        color: item.customization?.color,
        colorType: typeof item.customization?.color,
        colorId: item.customization?.color?.ColorId,
        colorName: item.customization?.color?.Nombre
      });
    });
  }, [cart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full ">
        <div className="max-w-7xl mx-auto px-4 py-[80px] ">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
          >
            <ArrowLeft className="h-6 w-6 mr-2" />
            Volver a productos
          </button>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                  <img
                    src={imagenesGaleria[imagenSeleccionada] || "/multimedia/placeholder.jpg"}
                    alt={producto.Nombre}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                  />
                  {producto.Descuento > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg z-10">
                      -{producto.Descuento}% OFF
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                    {producto.Nombre}
                  </h1>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-slate-600 text-sm">(4.8 - 124 reseñas)</span>
                  </div>

                  <div className="flex items-baseline gap-3 mb-2">
                    {producto.Descuento > 0 && (
                      <span className="text-xl md:text-2xl text-slate-400 line-through">
                        {formatPrice(producto.Precio)}
                      </span>
                    )}
                    <span className="text-3xl md:text-4xl font-bold text-blue-600">
                      {formatPrice(precioFinal)}
                    </span>
                  </div>

                  {producto.Stock !== undefined && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      <Package className="h-4 w-4" />
                      <span>En stock: {producto.Stock} unidades</span>
                    </div>
                  )}
                </div>

                {/* Mostrar sección de colores solo si el producto tiene colores */}
                {/* Mostrar sección de colores solo si el producto tiene colores */}
                {tieneColores && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-blue-600" />
                      Colores Disponibles
                      {producto.EsPersonalizado && <span className="text-red-500 text-sm">*</span>}
                      <span className="text-sm text-slate-500 font-normal ml-auto">
                        {coloresProducto.length} opciones
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {coloresProducto.map((color) => (
                        <button
                          key={color.ColorId}
                          onClick={() => setColorSeleccionado(color.Nombre)}
                          disabled={color.Stock === 0}
                          className={`group relative p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${colorSeleccionado === color.Nombre
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : color.Stock === 0
                              ? "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            }`}
                        >
                          <div
                            className="w-12 h-12 rounded-full border border-slate-300 shadow-sm"
                            style={{ backgroundColor: color.Hex }}
                            title={color.Nombre}
                          />
                          <div className="text-center">
                            <span className="text-sm font-medium text-slate-700 block">
                              {color.Nombre}
                            </span>
                            <span className={`text-xs ${color.Stock === 0
                              ? "text-red-600"
                              : color.Stock < 10
                                ? "text-yellow-600"
                                : "text-green-600"
                              }`}>
                              {color.Stock === 0 ? "Agotado" : `${color.Stock} disponibles`}
                            </span>
                          </div>
                          {colorSeleccionado === color.Nombre && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </span>
                          )}
                          {color.Stock === 0 && (
                            <span className="absolute inset-0 bg-gray-200/50 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-700 font-medium">AGOTADO</span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {!colorSeleccionado && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ Por favor selecciona un color antes de agregar al carrito
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-800 mb-3 text-lg">
                    Cantidad
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-slate-300 rounded-lg">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="px-4 py-2.5 hover:bg-slate-100 transition font-bold text-slate-700"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={
                          colorSeleccionado
                            ? coloresProducto.find(c => c.Nombre === colorSeleccionado)?.Stock || 0
                            : coloresProducto.reduce((sum, c) => sum + (c.Stock || 0), 0) || 999
                        }
                        value={cantidad}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const maxStock = colorSeleccionado
                            ? coloresProducto.find(c => c.Nombre === colorSeleccionado)?.Stock || 0
                            : coloresProducto.reduce((sum, c) => sum + (c.Stock || 0), 0) || 999;
                          setCantidad(Math.max(1, Math.min(val, maxStock)));
                        }}
                        className="w-16 text-center py-2.5 border-x-2 border-slate-300 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={() => {
                          const maxStock = colorSeleccionado
                            ? coloresProducto.find(c => c.Nombre === colorSeleccionado)?.Stock || 0
                            : coloresProducto.reduce((sum, c) => sum + (c.Stock || 0), 0) || 999;
                          if (cantidad < maxStock) {
                            setCantidad(cantidad + 1);
                          } else {
                            toast.warning(`Cantidad máxima disponible: ${maxStock}`);
                          }
                        }}
                        className="px-4 py-2.5 hover:bg-slate-100 transition font-bold text-slate-700"
                      >
                        +
                      </button>
                    </div>

                    {/* Mostrar stock según color seleccionado */}
                    {colorSeleccionado ? (
                      <span className="text-sm text-slate-600">
                        Stock del color: <span className="font-semibold text-slate-800">
                          {coloresProducto.find(c => c.Nombre === colorSeleccionado)?.Stock || 0}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-slate-600">
                        Stock total: <span className="font-semibold text-slate-800">
                          {coloresProducto.reduce((sum, c) => sum + (c.Stock || 0), 0)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-slate-800 text-white py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={tieneColores && !colorSeleccionado}
                >
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  {tieneColores && !colorSeleccionado
                    ? "Selecciona un color"
                    : `Agregar al Carrito - ${formatPrice(precioFinal * cantidad)}`}
                </button>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                    <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">Envío Gratis</p>
                    <p className="font-semibold text-slate-800 text-xs">Desde $100.000</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                    <Shield className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">Garantía</p>
                    <p className="font-semibold text-slate-800 text-xs">30 días</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
                    <Package className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-600">Entrega</p>
                    <p className="font-semibold text-slate-800 text-xs">3-5 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};