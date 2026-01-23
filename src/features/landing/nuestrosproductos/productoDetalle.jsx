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
    producto?.UrlImagen || "/multimedia/placeholder.jpg",
    producto?.UrlImagen2 || producto?.UrlImagen || "/multimedia/placeholder.jpg",
    producto?.UrlImagen3 || producto?.UrlImagen || "/multimedia/placeholder.jpg",
    producto?.UrlImagen4 || producto?.UrlImagen || "/multimedia/placeholder.jpg",
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

  const handleAddToCart = () => {
    // Productos personalizados requieren color
    if (producto.EsPersonalizado) {
      if (!colorSeleccionado) {
        toast.error("Por favor selecciona un color");
        return;
      }
    }
    
    // Productos con colores (no personalizados) también requieren selección de color
    if (tieneColores && !producto.EsPersonalizado && !colorSeleccionado) {
      toast.error("Por favor selecciona un color antes de agregar al carrito");
      return;
    }

    const stock = producto.Stock ?? producto.stock ?? null;
    const existing = cart.find(
      (item) => item.ProductoServicioId === producto.ProductoServicioId
    );
    const currentQuantity = existing ? existing.quantity : 0;
    const newQuantity = currentQuantity + cantidad;

    if (stock !== null && newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    // Incluir color en la personalización si existe
    const customizacion = {};
    if (producto.EsPersonalizado || colorSeleccionado) {
      customizacion.color = colorSeleccionado;
    }

    addToCart(producto, customizacion, cantidad);
    toast.success(
      `${cantidad} ${producto.Nombre}${colorSeleccionado ? ` (${colorSeleccionado})` : ''} agregado${cantidad > 1 ? "s" : ""} al carrito`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full ">
        <div className="max-w-7xl mx-auto px-4 py-10 ">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover mb-6 transition group font-medium rounded-full bg-blue-100 "
          >
            <ArrowLeft className="h-12 w-12" />
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

                {imagenesGaleria.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imagenesGaleria.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImagenSeleccionada(i)}
                        className={`aspect-square rounded-lg bg-slate-100 border-2 transition overflow-hidden ${imagenSeleccionada === i
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-transparent hover:border-slate-300"
                          }`}
                      >
                        <img
                          src={img || "/multimedia/placeholder.jpg"}
                          alt={`Vista ${i + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                        />
                      </button>
                    ))}
                  </div>
                )}
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
                    <div className="flex flex-wrap gap-3">
                      {coloresProducto.map((color) => (
                        <button
                          key={color.ColorId}
                          onClick={() => setColorSeleccionado(color.Nombre)}
                          className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${colorSeleccionado === color.Nombre
                            ? "border-blue-600 bg-blue-50 shadow-md"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            }`}
                          style={{ backgroundColor: color.Hex }}
                        >
                          <span className="text-sm font-medium text-slate-700">{color.Nombre}</span>
                          {colorSeleccionado === color.Nombre && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
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
                        max={producto.Stock || 999}
                        value={cantidad}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          const maxStock = producto.Stock || 999;
                          setCantidad(Math.max(1, Math.min(val, maxStock)));
                        }}
                        className="w-16 text-center py-2.5 border-x-2 border-slate-300 focus:outline-none font-semibold"
                      />
                      <button
                        onClick={() => {
                          const maxStock = producto.Stock || 999;
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
                    {producto.Stock && (
                      <span className="text-sm text-slate-600">
                        Disponible: <span className="font-semibold text-slate-800">{producto.Stock}</span>
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