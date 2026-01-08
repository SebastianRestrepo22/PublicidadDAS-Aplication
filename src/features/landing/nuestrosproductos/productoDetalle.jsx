import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Heart, Star, Ruler, Palette, Package, Truck, Shield } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";

export const ProductoDetalle = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  // Obtener producto desde el estado de navegación
  const [producto, setProducto] = useState(location.state?.producto || null);
  const [cantidad, setCantidad] = useState(1);
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [dimensiones, setDimensiones] = useState({ alto: "", ancho: "" });
  const [isFavorite, setIsFavorite] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);

  useEffect(() => {
    // Si no hay producto en el estado, podrías hacer una llamada a la API aquí
    if (!producto && id) {
      // Ejemplo: GetProductoById(id).then(res => setProducto(res.data))
      toast.error("Producto no encontrado");
      navigate("/productos");
    }
  }, [id, producto, navigate]);

  useEffect(() => {
    // Scroll al inicio cuando se carga el componente
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

  const precioFinal = producto.Descuento > 0
    ? producto.Precio - (producto.Precio * producto.Descuento) / 100
    : producto.Precio;

  const handleAddToCart = () => {
    // Validaciones para productos personalizados
    if (producto.EsPersonalizado) {
      if (!dimensiones.alto || !dimensiones.ancho) {
        toast.error("Por favor ingresa las dimensiones del producto");
        return;
      }
      if (!colorSeleccionado) {
        toast.error("Por favor selecciona un color");
        return;
      }
    }

    // Validar stock
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

    // Agregar al carrito
    const customizacion = producto.EsPersonalizado
      ? {
        color: colorSeleccionado,
        alto: dimensiones.alto,
        ancho: dimensiones.ancho
      }
      : {};

    addToCart(producto, customizacion, cantidad);
    toast.success(`${cantidad} ${producto.Nombre} agregado${cantidad > 1 ? 's' : ''} al carrito`);
  };

  const coloresDisponibles = [
    { nombre: "Blanco", hex: "#FFFFFF", border: true },
    { nombre: "Negro", hex: "#000000" },
    { nombre: "Azul", hex: "#3B82F6" },
    { nombre: "Rojo", hex: "#EF4444" },
    { nombre: "Verde", hex: "#10B981" },
    { nombre: "Amarillo", hex: "#F59E0B" },
    { nombre: "Rosa", hex: "#EC4899" },
    { nombre: "Morado", hex: "#8B5CF6" },
  ];

  // Simular galería de imágenes (puedes adaptarlo a múltiples imágenes reales)
  const imagenesGaleria = [
    producto.UrlImagen,
    producto.UrlImagen,
    producto.UrlImagen,
    producto.UrlImagen,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition group"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Volver a productos</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Columna Izquierda - Imagen del Producto */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
                <img
                  src={imagenesGaleria[imagenSeleccionada] || "/multimedia/placeholder.jpg"}
                  alt={producto.Nombre}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = "/multimedia/placeholder.jpg")}
                />
                {producto.Descuento > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                    -{producto.Descuento}% OFF
                  </div>
                )}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition"
                >
                  <Heart
                    className={`h-6 w-6 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                  />
                </button>
              </div>

              {/* Mini galería */}
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
            </div>

            {/* Columna Derecha - Información del Producto */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-3">
                  {producto.Nombre}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-slate-600 text-sm">(4.8 - 124 reseñas)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  {producto.Descuento > 0 && (
                    <span className="text-2xl text-slate-400 line-through">
                      {formatPrice(producto.Precio)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(precioFinal)}
                  </span>
                </div>

                {producto.Stock && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <Package className="h-4 w-4" />
                    <span>En stock: {producto.Stock} unidades</span>
                  </div>
                )}
              </div>

              {/* Dimensiones - Solo lectura */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                  <Ruler className="h-5 w-5 text-blue-600" />
                  Dimensiones
                </h3>
                <div className="text-slate-700 space-y-1">
                  <p><strong>Alto:</strong> {producto.Alto ? `${producto.Alto} cm` : 'No especificado'}</p>
                  <p><strong>Ancho:</strong> {producto.Ancho ? `${producto.Ancho} cm` : 'No especificado'}</p>
                </div>
              </div>

              {/* Colores disponibles */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-blue-600" />
                  Colores Disponibles
                  {producto.EsPersonalizado && <span className="text-red-500 text-sm">*</span>}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color.nombre}
                      onClick={() => setColorSeleccionado(color.nombre)}
                      className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${colorSeleccionado === color.nombre
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full shadow-sm ${color.border ? "border-2 border-slate-300" : ""
                          }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {color.nombre}
                      </span>
                      {colorSeleccionado === color.nombre && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantidad */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="font-semibold text-slate-800 mb-3 text-lg">
                  Cantidad
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-slate-300 rounded-lg">
                    <button
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="px-5 py-3 hover:bg-slate-100 transition font-bold text-slate-700 text-xl"
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
                      className="w-20 text-center py-3 border-x-2 border-slate-300 focus:outline-none font-semibold text-lg"
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
                      className="px-5 py-3 hover:bg-slate-100 transition font-bold text-slate-700 text-xl"
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

              {/* Botón Agregar al Carrito */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-slate-800 text-white py-5 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ShoppingCart className="h-6 w-6" />
                Agregar al Carrito - {formatPrice(precioFinal * cantidad)}
              </button>

              {/* Info adicional */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1">Envío Gratis</p>
                  <p className="font-semibold text-slate-800 text-sm">Desde $100.000</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <Shield className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1">Garantía</p>
                  <p className="font-semibold text-slate-800 text-sm">30 días</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                  <Package className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1">Entrega</p>
                  <p className="font-semibold text-slate-800 text-sm">3-5 días</p>
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