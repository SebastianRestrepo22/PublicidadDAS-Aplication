import React, { useState, useEffect, useCallback } from "react";
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
  const [cantidad, setCantidad] = useState("1"); // Cambiado a string para poder borrar
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [tipoStock, setTipoStock] = useState("general");
  const [stockDisponible, setStockDisponible] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);

  const imagenesGaleria = [
    producto?.Imagen || "/multimedia/placeholder.jpg",
  ].filter(img => img);

  // Calcular stocks según el tipo
  const calcularStocks = useCallback((prod, colores) => {
    const usaColores = prod.UsaColores === 1 || prod.UsaColores === "1";
    setTipoStock(usaColores ? "colores" : "general");

    if (usaColores) {
      const coloresConStock = colores && colores.length > 0 ? colores : [];
      setColoresProducto(coloresConStock);
      
      const total = coloresConStock.reduce((sum, color) => sum + (color.Stock || 0), 0);
      setStockTotal(total);
      
      if (coloresConStock.length === 1 && coloresConStock[0].Stock > 0) {
        setColorSeleccionado(coloresConStock[0].Nombre);
        setStockDisponible(coloresConStock[0].Stock || 0);
      } else {
        setStockDisponible(0);
      }
    } else {
      setStockTotal(prod.Stock || 0);
      setStockDisponible(prod.Stock || 0);
      setColoresProducto([]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let prod = producto;
        let colores = [];

        if (!prod) {
          prod = await getProductoByIdService(id);
          setProducto(prod);
        }

        colores = await getColoresProducto(id);
        calcularStocks(prod, colores);

      } catch (err) {
        console.error("Error cargando producto:", err);
        toast.error("Producto no encontrado");
        navigate("/productos");
      }
    };

    fetchData();
  }, [id, navigate, producto, calcularStocks]);

  // Actualizar stock disponible cuando cambia el color seleccionado
  useEffect(() => {
    if (tipoStock === "colores" && colorSeleccionado) {
      const color = coloresProducto.find(c => c.Nombre === colorSeleccionado);
      setStockDisponible(color?.Stock || 0);
      
      // Resetear cantidad si excede el nuevo stock
      const cantidadNum = parseInt(cantidad) || 1;
      setCantidad(Math.min(cantidadNum, color?.Stock || 0).toString());
    }
  }, [colorSeleccionado, coloresProducto, tipoStock]);

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

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    
    // Permitir vacío para poder borrar
    if (value === "") {
      setCantidad("");
      return;
    }

    // Solo permitir números
    if (!/^\d*$/.test(value)) return;

    const numValue = parseInt(value, 10);
    
    // No permitir 0
    if (numValue === 0) return;

    // Validar contra stock disponible
    if (numValue > stockDisponible) {
      toast.warning(`Cantidad máxima: ${stockDisponible}`);
      setCantidad(stockDisponible.toString());
      return;
    }

    setCantidad(value);
  };

  const handleQuantityBlur = () => {
    // Si está vacío, poner 1
    if (cantidad === "") {
      setCantidad("1");
    }
  };

  const handleAddToCart = () => {
    const cantidadNum = parseInt(cantidad) || 1;

    // Validaciones según tipo de stock
    if (tipoStock === "colores") {
      if (!colorSeleccionado) {
        toast.error("Por favor selecciona un color");
        return;
      }

      const colorSeleccionadoObj = coloresProducto.find(c => c.Nombre === colorSeleccionado);
      
      if (!colorSeleccionadoObj) {
        toast.error("Color no válido");
        return;
      }

      if (colorSeleccionadoObj.Stock === 0) {
        toast.error(`El color ${colorSeleccionado} no tiene stock disponible`);
        return;
      }

      // Verificar stock en carrito
      const existingInCart = cart.filter(item =>
        item.ProductoId === producto.ProductoId &&
        item.customization?.color?.ColorId === colorSeleccionadoObj.ColorId
      );
      const currentQuantityInCart = existingInCart.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalQuantity = currentQuantityInCart + cantidadNum;

      if (newTotalQuantity > colorSeleccionadoObj.Stock) {
        toast.error(`Solo hay ${colorSeleccionadoObj.Stock} unidades disponibles del color ${colorSeleccionado}`);
        return;
      }

      // Agregar con color
      const customizacion = {
        color: {
          ColorId: colorSeleccionadoObj.ColorId,
          Nombre: colorSeleccionadoObj.Nombre,
          Hex: colorSeleccionadoObj.Hex,
          Stock: colorSeleccionadoObj.Stock
        }
      };

      addToCart(producto, customizacion, cantidadNum);
      toast.success(
        `${cantidadNum} ${producto.Nombre} (${colorSeleccionado}) agregado${cantidadNum > 1 ? "s" : ""} al carrito`
      );
    } else {
      // Stock general
      if (stockDisponible === 0) {
        toast.error("Producto sin stock disponible");
        return;
      }

      const existing = cart.find(
        (item) => item.ProductoId === producto.ProductoId
      );
      const currentQuantity = existing ? existing.quantity : 0;
      const newQuantity = currentQuantity + cantidadNum;

      if (newQuantity > stockDisponible) {
        toast.error(`Solo hay ${stockDisponible} unidades disponibles`);
        return;
      }

      addToCart(producto, {}, cantidadNum);
      toast.success(`${cantidadNum} ${producto.Nombre} agregado${cantidadNum > 1 ? "s" : ""} al carrito`);
    }
  };

  // Determinar si el input debe estar deshabilitado
  const isQuantityDisabled = tipoStock === "colores" && !colorSeleccionado;

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

                  {/* Stock info según tipo */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <Package className="h-4 w-4" />
                    {tipoStock === "colores" ? (
                      <span>Stock total: {stockTotal} unidades (en {coloresProducto.length} colores)</span>
                    ) : (
                      <span>En stock: {stockDisponible} unidades</span>
                    )}
                  </div>
                </div>

                {/* Sección de colores - SOLO si el producto usa colores */}
                {tipoStock === "colores" && coloresProducto.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-blue-600" />
                      Colores Disponibles
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
                          className={`group relative p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            colorSeleccionado === color.Nombre
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
                            <span className={`text-xs ${
                              color.Stock === 0
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
                        </button>
                      ))}
                    </div>
                    {tipoStock === "colores" && !colorSeleccionado && coloresProducto.some(c => c.Stock > 0) && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ Por favor selecciona un color antes de agregar al carrito
                      </p>
                    )}
                    {tipoStock === "colores" && coloresProducto.every(c => c.Stock === 0) && (
                      <p className="text-sm text-red-600 mt-2">
                        ❌ No hay stock disponible en ningún color
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
                        onClick={() => {
                          const currentValue = parseInt(cantidad) || 1;
                          if (currentValue > 1) {
                            setCantidad((currentValue - 1).toString());
                          }
                        }}
                        disabled={isQuantityDisabled || (parseInt(cantidad) || 1) <= 1}
                        className="px-4 py-2.5 hover:bg-slate-100 transition font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cantidad}
                        onChange={handleQuantityChange}
                        onBlur={handleQuantityBlur}
                        disabled={isQuantityDisabled}
                        className="w-16 text-center py-2.5 border-x-2 border-slate-300 focus:outline-none font-semibold disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <button
                        onClick={() => {
                          const currentValue = parseInt(cantidad) || 1;
                          if (currentValue < stockDisponible) {
                            setCantidad((currentValue + 1).toString());
                          } else {
                            toast.warning(`Cantidad máxima: ${stockDisponible}`);
                          }
                        }}
                        disabled={isQuantityDisabled || (parseInt(cantidad) || 1) >= stockDisponible}
                        className="px-4 py-2.5 hover:bg-slate-100 transition font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {/* Stock según tipo */}
                    {tipoStock === "colores" && colorSeleccionado ? (
                      <span className="text-sm text-slate-600">
                        Stock del color: <span className="font-semibold text-slate-800">
                          {stockDisponible}
                        </span>
                      </span>
                    ) : tipoStock === "colores" ? (
                      <span className="text-sm text-slate-600">
                        Stock total: <span className="font-semibold text-slate-800">
                          {stockTotal}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-slate-600">
                        Stock disponible: <span className="font-semibold text-slate-800">
                          {stockDisponible}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-slate-800 text-white py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={
                    (tipoStock === "colores" && (!colorSeleccionado || stockDisponible === 0)) ||
                    (tipoStock === "general" && stockDisponible === 0) ||
                    cantidad === "" ||
                    parseInt(cantidad) === 0
                  }
                >
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  {tipoStock === "colores" && !colorSeleccionado
                    ? "Selecciona un color"
                    : stockDisponible === 0
                      ? "Producto agotado"
                      : cantidad === "" || parseInt(cantidad) === 0
                        ? "Ingresa una cantidad"
                        : `Agregar al Carrito - ${formatPrice(precioFinal * parseInt(cantidad))}`}
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