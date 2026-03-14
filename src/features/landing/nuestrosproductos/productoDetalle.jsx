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
  const [coloresSeleccionados, setColoresSeleccionados] = useState([]);

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
    // Validaciones según tipo de stock
    if (tipoStock === "colores") {
      // Verificar si hay colores seleccionados
      if (coloresSeleccionados.length === 0) {
        toast.error("Por favor selecciona al menos un color");
        return;
      }

      // Verificar que todas las cantidades sean válidas
      for (const item of coloresSeleccionados) {
        if (item.cantidad <= 0) {
          toast.error(`La cantidad para ${item.nombre} debe ser mayor a 0`);
          return;
        }

        const colorOriginal = coloresProducto.find(c => c.ColorId === item.colorId);
        if (!colorOriginal) {
          toast.error(`Color ${item.nombre} no válido`);
          return;
        }

        // Verificar stock en carrito
        const existingInCart = cart.filter(cartItem =>
          cartItem.ProductoId === producto.ProductoId &&
          cartItem.customization?.color?.ColorId === item.colorId
        );
        const currentQuantityInCart = existingInCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
        const newTotalQuantity = currentQuantityInCart + item.cantidad;

        if (newTotalQuantity > colorOriginal.Stock) {
          toast.error(
            `Solo hay ${colorOriginal.Stock} unidades disponibles de ${item.nombre} ` +
            `(ya tienes ${currentQuantityInCart} en carrito)`
          );
          return;
        }
      }

      // Agregar cada color seleccionado al carrito
      coloresSeleccionados.forEach(item => {
        const colorOriginal = coloresProducto.find(c => c.ColorId === item.colorId);

        const customizacion = {
          color: {
            ColorId: colorOriginal.ColorId,
            Nombre: colorOriginal.Nombre,
            Hex: colorOriginal.Hex,
            Stock: colorOriginal.Stock
          }
        };

        addToCart(producto, customizacion, item.cantidad);
      });

      // Resetear selección después de agregar
      setColoresSeleccionados([]);

      toast.success(`${coloresSeleccionados.length} color(es) agregado(s) al carrito`);

    } else {
      // Stock general (comportamiento actual)
      const cantidadNum = parseInt(cantidad) || 1;

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

  const handleColorSelection = (color, checked) => {
    if (checked) {
      // Agregar color a la selección
      setColoresSeleccionados([
        ...coloresSeleccionados,
        {
          colorId: color.ColorId,
          nombre: color.Nombre,
          hex: color.Hex,
          stock: color.Stock,
          cantidad: 1
        }
      ]);
    } else {
      // Quitar color de la selección
      setColoresSeleccionados(coloresSeleccionados.filter(c => c.colorId !== color.ColorId));
    }
  };

  const handleColorQuantityChange = (colorId, valor, esInputDirecto = false) => {
    const colorOriginal = coloresProducto.find(c => c.ColorId === colorId);

    if (esInputDirecto) {
      // Para input directo: permitir vacío
      if (valor === "") {
        setColoresSeleccionados(coloresSeleccionados.map(item =>
          item.colorId === colorId
            ? { ...item, cantidad: "" }
            : item
        ));
        return;
      }

      // Solo números
      if (!/^\d*$/.test(valor)) return;
    }

    let nuevaCantidad = esInputDirecto ? parseInt(valor) || 0 : valor;

    if (nuevaCantidad < 1) nuevaCantidad = 1;
    if (nuevaCantidad > colorOriginal.Stock) {
      toast.warning(`Cantidad máxima para este color: ${colorOriginal.Stock}`);
      nuevaCantidad = colorOriginal.Stock;
    }

    setColoresSeleccionados(coloresSeleccionados.map(item =>
      item.colorId === colorId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const handleColorQuantityBlur = (colorId) => {
    setColoresSeleccionados(coloresSeleccionados.map(item => {
      if (item.colorId === colorId) {
        // Si está vacío o es 0, poner 1
        if (item.cantidad === "" || item.cantidad === 0) {
          return { ...item, cantidad: 1 };
        }
      }
      return item;
    }));
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

                    {/* Grid de colores con checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coloresProducto.map((color) => {
                        const seleccionado = coloresSeleccionados.find(c => c.colorId === color.ColorId);
                        const sinStock = color.Stock === 0;

                        return (
                          <div
                            key={color.ColorId}
                            className={`border rounded-lg p-4 ${sinStock
                              ? 'bg-gray-50 border-gray-200 opacity-60'
                              : seleccionado
                                ? 'bg-blue-50 border-blue-500 shadow-md'
                                : 'border-slate-200 hover:border-blue-300'
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Checkbox */}
                              <input
                                type="checkbox"
                                checked={!!seleccionado}
                                onChange={(e) => handleColorSelection(color, e.target.checked)}
                                disabled={sinStock}
                                className="mt-1 h-5 w-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                              />

                              {/* Color info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                                    style={{ backgroundColor: color.Hex }}
                                  />
                                  <div>
                                    <span className="font-medium text-slate-800">{color.Nombre}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${color.Stock === 0
                                        ? 'bg-red-100 text-red-700'
                                        : color.Stock < 5
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-green-100 text-green-700'
                                        }`}>
                                        {color.Stock === 0 ? 'Agotado' : `${color.Stock} disponibles`}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Selector de cantidad (solo si está seleccionado) */}
                                {/* Selector de cantidad (solo si está seleccionado) */}
                                {seleccionado && !sinStock && (
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                      Cantidad para {color.Nombre}:
                                    </label>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center border-2 border-slate-300 rounded-lg">
                                        <button
                                          onClick={() => handleColorQuantityChange(
                                            color.ColorId,
                                            seleccionado.cantidad - 1,
                                            false
                                          )}
                                          className="px-3 py-1.5 hover:bg-slate-100 transition font-bold text-slate-700"
                                        >
                                          −
                                        </button>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          value={seleccionado.cantidad}
                                          onChange={(e) => handleColorQuantityChange(
                                            color.ColorId,
                                            e.target.value,
                                            true
                                          )}
                                          onBlur={() => handleColorQuantityBlur(color.ColorId)}
                                          className="w-16 text-center py-1.5 border-x-2 border-slate-300 focus:outline-none font-semibold"
                                        />
                                        <button
                                          onClick={() => handleColorQuantityChange(
                                            color.ColorId,
                                            seleccionado.cantidad + 1,
                                            false
                                          )}
                                          className="px-3 py-1.5 hover:bg-slate-100 transition font-bold text-slate-700"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <span className="text-sm font-medium text-blue-600">
                                        {formatPrice(seleccionado.cantidad * precioFinal)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumen de selección */}
                    {coloresSeleccionados.length > 0 && (
                      <div className="mt-4 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
                        <div className="bg-blue-100 px-4 py-2 flex justify-between items-center">
                          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Selección ({coloresSeleccionados.length})</span>
                          </h4>
                          <span className="text-sm font-bold text-blue-700">
                            Total: {formatPrice(coloresSeleccionados.reduce(
                              (sum, item) => sum + (precioFinal * item.cantidad), 0
                            ))}
                          </span>
                        </div>

                        <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                          {coloresSeleccionados.map(item => (
                            <div key={item.colorId} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: item.hex }}
                                />
                                <span className="font-medium text-sm truncate">{item.nombre}</span>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                                <span className="text-sm text-slate-600">×{item.cantidad}</span>
                                <span className="font-semibold text-sm text-blue-600 w-20 text-right">
                                  {formatPrice(precioFinal * item.cantidad)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {coloresSeleccionados.length === 0 && coloresProducto.some(c => c.Stock > 0) && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                        <span className="text-lg">✓</span> Selecciona los colores que deseas comprar
                      </p>
                    )}

                    {coloresProducto.every(c => c.Stock === 0) && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <span className="text-lg">❌</span> No hay stock disponible en ningún color
                      </p>
                    )}
                  </div>
                )}
                {tipoStock !== "colores" && (

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
                )}

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-slate-800 text-white py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={
                    (tipoStock === "colores" && coloresSeleccionados.length === 0) ||
                    (tipoStock === "general" && stockDisponible === 0) ||
                    cantidad === "" ||
                    parseInt(cantidad) === 0
                  }
                >
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  {tipoStock === "colores" ? (
                    coloresSeleccionados.length === 0
                      ? "Selecciona colores"
                      : `Agregar ${coloresSeleccionados.length} color(es) al carrito`
                  ) : stockDisponible === 0 ? (
                    "Producto agotado"
                  ) : cantidad === "" || parseInt(cantidad) === 0 ? (
                    "Ingresa una cantidad"
                  ) : `Agregar al Carrito - ${formatPrice(precioFinal * parseInt(cantidad))}`}
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