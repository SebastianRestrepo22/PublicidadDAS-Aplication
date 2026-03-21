import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";
import { useCart } from "../../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Edit2,
  Trash2,
  Plus,
  Minus,
  Palette,
  ChevronLeft,
  ImageIcon,
  CheckCircle,
  FileText,
  X
} from "lucide-react";

// Servicio para obtener colores del producto
import { getColoresProducto } from "../../dashboard/productos/services/services.products";

export const CarritoCompras = () => {
  const [editingQuantity, setEditingQuantity] = useState({});

  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart, updateItemColor } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [showModalVaciar, setShowModalVaciar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [editingColorItem, setEditingColorItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [productColors, setProductColors] = useState({});
  const [loadingColors, setLoadingColors] = useState({});
  const [colorsLoaded, setColorsLoaded] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Función para cargar colores - MEMOIZADA
  const loadColorsForProducts = useCallback(async () => {
    const productIds = cart
      .filter(item => item.ProductoId && !productColors[item.ProductoId])
      .map(item => item.ProductoId);

    if (productIds.length === 0) {
      setColorsLoaded(true);
      return;
    }

    const newLoading = { ...loadingColors };
    const newColors = { ...productColors };

    for (const productId of productIds) {
      if (!newLoading[productId]) {
        newLoading[productId] = true;
        try {
          const colors = await getColoresProducto(productId);
          newColors[productId] = colors || [];
        } catch (error) {
          console.error(`Error cargando colores para producto ${productId}:`, error);
          newColors[productId] = [];
        } finally {
          newLoading[productId] = false;
        }
      }
    }

    setLoadingColors(newLoading);
    setProductColors(newColors);
    setColorsLoaded(true);
  }, [cart, productColors, loadingColors]);

  // Efecto para cargar colores - SOLO cuando cambia el carrito
  useEffect(() => {
    setColorsLoaded(false);
    loadColorsForProducts();
  }, [cart, loadColorsForProducts]);

  // Efecto para verificar stocks cuando cambian los colores cargados
  useEffect(() => {
    if (!colorsLoaded || cart.length === 0) return;

    // Verificar cada item del carrito
    cart.forEach(item => {
      if (item.ProductoId && item.customization?.color?.ColorId) {
        const colors = productColors[item.ProductoId] || [];
        const colorSeleccionado = colors.find(c => c.ColorId === item.customization.color.ColorId);

        if (colorSeleccionado) {
          // Si el stock actual es menor que la cantidad en carrito
          if (colorSeleccionado.Stock < item.quantity) {
            console.warn(`⚠️ Stock insuficiente para ${item.Nombre} - ${item.customization.color.Nombre}`);
            toast.warning(
              `El stock de ${item.customization.color.Nombre} ha cambiado. ` +
              `Ahora solo hay ${colorSeleccionado.Stock} unidades disponibles.`,
              { autoClose: 5000 }
            );
          }
        }
      }
    });
  }, [colorsLoaded, productColors, cart]);

  // Función para obtener el stock disponible según el color
  const getStockDisponible = (item) => {
    // Si es un producto
    if (item.ProductoId) {
      // Si tiene color seleccionado, el stock ya debería estar en item.Stock
      if (item.customization?.color?.ColorId) {
        // El stock del color ya lo guardamos en item.Stock cuando agregamos al carrito
        return item.Stock || 0;
      }

      // Si no tiene color, usar stock general del producto
      return item.Stock || 0;
    }

    // Si es servicio, no hay stock
    return null;
  };

  const handleIncrease = (item) => {
    const stockDisponible = getStockDisponible(item);

    // Si el stock es null/undefined, significa que no hay límite de stock
    if (stockDisponible === null || stockDisponible === undefined) {
      updateQuantity(item.id, item.quantity + 1);
      return;
    }

    // Verificar si hay stock suficiente
    if (item.quantity + 1 > stockDisponible) {
      // Mensaje específico según si tiene color o no
      if (item.customization?.color?.ColorId) {
        const colorName = item.customization.color.Nombre || 'seleccionado';
        toast.warning(`⚠️ Límite de stock alcanzado\nSolo hay ${stockDisponible} unidades disponibles para el color ${colorName}`, {
          icon: "📦",
          autoClose: 4000,
        });
      } else {
        toast.warning(`⚠️ Límite de stock alcanzado\nSolo hay ${stockDisponible} unidades disponibles de este producto`, {
          icon: "📦",
          autoClose: 4000,
        });
      }
      return;
    }

    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      setConfirmDelete(item.id);
      return;
    }
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleEditStock = (item) => {
    setEditingStock(item.id);
    setNewQuantity(item.quantity);
  };

  const saveStockEdit = (itemId) => {
    const item = cart.find(item => item.id === itemId);
    const stockDisponible = getStockDisponible(item);

    if (stockDisponible !== null && stockDisponible !== undefined && newQuantity > stockDisponible) {
      if (item.customization?.color?.ColorId) {
        const colorName = item.customization.color.Nombre || 'seleccionado';
        toast.error(`Solo hay ${stockDisponible} unidades disponibles para el color ${colorName}`);
      } else {
        toast.error(`Solo hay ${stockDisponible} unidades disponibles`);
      }
      return;
    }

    if (newQuantity < 1) {
      toast.error("La cantidad debe ser al menos 1");
      return;
    }

    updateQuantity(itemId, newQuantity);
    setEditingStock(null);
    toast.success("Cantidad actualizada");
  };

  const cancelStockEdit = () => {
    setEditingStock(null);
    setNewQuantity(1);
  };

  const handleEditColor = (item) => {
    setEditingColorItem(item);
  };

  const handleSelectColor = (color) => {
    if (!editingColorItem) return;

    console.log("🎨 [CARRITO] Guardando ColorId UUID:", color.ColorId);

    if (color.Stock === 0) {
      toast.error(`El color ${color.Nombre} no tiene stock disponible`);
      return;
    }

    // Verificar que la cantidad actual no exceda el stock del nuevo color
    if (editingColorItem.quantity > color.Stock) {
      toast.warning(
        `La cantidad actual (${editingColorItem.quantity}) excede el stock del nuevo color (${color.Stock}). ` +
        `Se ajustará automáticamente al máximo disponible.`
      );

      // Actualizar la cantidad al máximo disponible del nuevo color
      updateQuantity(editingColorItem.id, color.Stock);
    }

    // Actualizar el color
    updateItemColor(editingColorItem.id, color);

    setEditingColorItem(null);
    toast.success(`Color cambiado a ${color.Nombre}`);
  };

  const getColorDisplay = (item) => {
    if (!item?.customization?.color) return null;

    if (typeof item.customization.color === 'string') {
      const colors = productColors[item.ProductoId] || [];
      const colorObj = colors.find(c => c.ColorId === item.customization.color);
      return colorObj?.Nombre || item.customization.color;
    }

    return item.customization.color?.Nombre || null;
  };

  const getItemType = (item) => {
    if (item.ProductoId) return "producto";
    if (item.ServicioId) return "servicio";
    if (item.EsPersonalizado) return "servicio personalizado";
    return "item";
  };

  const formatPrice = (precio) => {
    const formateado = new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);

    return `COP ${formateado}`;
  };

  const calculateItemTotal = (item) => {
    const price = Number(item.Precio) || 0;
    const quantity = item.quantity || 1;
    return price * quantity;
  };

  const verificarDatosCarrito = () => {
    console.log("=== VERIFICACIÓN DE DATOS DEL CARRITO ===");
    cart.forEach((item, index) => {
      console.log(`Item ${index + 1}: ${item.Nombre}`);
      console.log("  - ProductoId:", item.ProductoId);
      console.log("  - Customization:", item.customization);
      console.log("  - Color Object:", item.customization?.color);
      console.log("  - ColorId:", item.customization?.color?.ColorId);
      console.log("  - Tiene ColorId?:", !!item.customization?.color?.ColorId);
    });
  };

  const handleCheckout = () => {
    verificarDatosCarrito();
    const total = getTotal();
    if (total === 0) {
      toast.error("No puedes finalizar una compra con valor $0");
      return;
    }
    if (!user) {
      setShowModal(true);
      return;
    }
    navigate("/checkout");
  };

  const total = getTotal();

  // Filtrar productos y servicios
  const productos = cart.filter(item => item.ProductoId || (!item.ServicioId && !item.EsPersonalizado));
  const servicios = cart.filter(item => item.ServicioId || item.EsPersonalizado);

  // Si no ha terminado de cargar, mostrar loader
  if (!colorsLoaded && cart.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="from-slate-50 to-blue-50 pt-6 sm:pt-12 m-4 sm:m-10 p-4 sm:p-10 flex-1">
        <div className="pt-10">
          <h1 className="font-bold text-2xl sm:text-3xl text-slate-800">Mi Carrito de Compras</h1>
          <p className="text-slate-600 mt-2">
            Revisa y gestiona los productos y servicios que has seleccionado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-10">
          {/* Lista de productos y servicios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos */}
            {productos.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">
                  🛍️ Productos ({productos.length})
                </h2>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {productos.map((item) => {
                    const colors = productColors[item.ProductoId] || [];
                    const currentColorName = getColorDisplay(item);
                    const currentColorObj = colors.find(col => col.ColorId === item.customization?.color?.ColorId);

                    return (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                        <div className="flex gap-4">
                          {/* Imagen */}
                          <div className="relative">
                            <img
                              src={item.UrlImagen || item.Imagen || "https://via.placeholder.com/200"}
                              alt={item.Nombre}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/200";
                              }}
                            />
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              Producto
                            </span>
                          </div>

                          {/* Información */}
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{item.Nombre}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2">{item.Descripcion}</p>

                            {/* Color si tiene */}
                            <div className="mt-2">
                              {currentColorName ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-slate-500" />
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-4 h-4 rounded-full border border-slate-300"
                                        style={{
                                          backgroundColor: currentColorObj?.Hex || '#ccc'
                                        }}
                                      />
                                      <span className="text-sm font-medium text-slate-700">
                                        Color: {currentColorName}
                                      </span>
                                    </div>
                                  </div>
                                  {colors.length > 0 && (
                                    <button
                                      onClick={() => handleEditColor(item)}
                                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                    >
                                      <Edit2 className="h-3 w-3" /> Cambiar
                                    </button>
                                  )}
                                </div>
                              ) : colors.length > 0 ? (
                                <button
                                  onClick={() => handleEditColor(item)}
                                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                >
                                  <Palette className="h-3 w-3" /> Seleccionar color
                                </button>
                              ) : null}
                            </div>

                            {/* Stock disponible - AHORA USA getStockDisponible */}
                            <div className="flex items-center gap-4 mt-3">
                              <div className="text-sm text-slate-600">
                                {item.customization?.color?.ColorId ? (
                                  <>
                                    Stock del color <span className="font-semibold">{item.customization.color.Nombre || 'seleccionado'}</span>: {' '}
                                    <span className={`font-semibold ${getStockDisponible(item) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {getStockDisponible(item) ?? "∞"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    Stock disponible: {' '}
                                    <span className="font-semibold">{getStockDisponible(item) ?? "∞"}</span>
                                  </>
                                )}
                              </div>

                              {/* Contador de cantidad */}
                              <div className="flex items-center gap-2">
                                {/* Botón restar */}
                                <button
                                  onClick={() => handleDecrease(item)}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>

                                {/* Input con estado local para edición */}
                                <input
                                  type="number"
                                  min="1"
                                  max={getStockDisponible(item) || 999}
                                  // Usar valor del estado local si existe, sino el del carrito
                                  value={editingQuantity[item.id] ?? item.quantity}
                                  onChange={(e) => {
                                    const rawValue = e.target.value;
                                    // Guardar en estado local lo que el usuario escribe (incluyendo vacío)
                                    setEditingQuantity(prev => ({ ...prev, [item.id]: rawValue }));
                                  }}
                                  onBlur={(e) => {
                                    const rawValue = e.target.value;
                                    const stockDisp = getStockDisponible(item);

                                    // Si está vacío o es inválido, restaurar a 1 o al mínimo válido
                                    let finalValue = 1;

                                    if (rawValue !== '' && !isNaN(parseInt(rawValue))) {
                                      finalValue = parseInt(rawValue);
                                      // Validar límites
                                      if (finalValue < 1) finalValue = 1;
                                      if (stockDisp !== null && finalValue > stockDisp) {
                                        toast.warning(`Máximo ${stockDisp} unidades`);
                                        finalValue = stockDisp;
                                      }
                                    }

                                    // Actualizar el carrito con el valor validado
                                    updateQuantity(item.id, finalValue);

                                    // Limpiar estado local para este item
                                    setEditingQuantity(prev => {
                                      const nuevo = { ...prev };
                                      delete nuevo[item.id];
                                      return nuevo;
                                    });
                                  }}
                                  onKeyDown={(e) => {
                                    // Si presiona Enter, validar y actualizar inmediatamente
                                    if (e.key === 'Enter') {
                                      e.target.blur(); // Disparar onBlur para validar
                                    }
                                  }}
                                  className="w-16 text-center py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                />

                                {/* Botón sumar */}
                                <button
                                  onClick={() => handleIncrease(item)}
                                  disabled={getStockDisponible(item) !== null && item.quantity >= getStockDisponible(item)}
                                  className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${getStockDisponible(item) !== null && item.quantity >= getStockDisponible(item)
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                    : 'border-blue-300 bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Precio y acciones */}
                          <div className="flex flex-col items-end justify-between">
                            <div className="text-right">
                              <div className="font-bold text-lg text-blue-600">
                                {formatPrice(calculateItemTotal(item))}
                              </div>
                              <div className="text-sm text-slate-500">
                                {formatPrice(item.Precio)} c/u
                              </div>
                              {item.Descuento > 0 && (
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1">
                                  -{item.Descuento}% de descuento
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setConfirmDelete(item.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition"
                            >
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Servicios */}

            {servicios.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">
                  🎨 Servicios ({servicios.length})
                </h2>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {servicios.map((item) => {
                    const imagenAdjunta = item.customization?.archivosAdjuntos?.find(
                      f => f.esImagen && f.url
                    );

                    const imagenSrc = imagenAdjunta?.url
                      ? `${API_URL}${imagenAdjunta.url}`
                      : item.UrlImagen || item.Imagen || "https://via.placeholder.com/200";
                    return (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                        <div className="flex gap-4">
                          <div className="relative">
                            <img
                              src={imagenSrc}
                              alt={item.Nombre}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/200";
                              }}
                            />
                            <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                              {item.EsPersonalizado ? "Personalizado" : "Servicio"}
                            </span>
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{item.Nombre}</h3>
                            <p className="text-sm text-slate-600 line-clamp-2">{item.Descripcion}</p>

                            {item.customization && (
                              <div className="mt-3 space-y-1">
                                <h4 className="text-sm font-semibold text-slate-700">Detalles de personalización:</h4>
                                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                                  {item.customization.Descripcion && (
                                    <p className="mb-1"><span className="font-medium">Descripción:</span> {item.customization.Descripcion}</p>
                                  )}
                                  {item.customization.Tamaño && (
                                    <p className="mb-1"><span className="font-medium">Tamaño:</span> {item.customization.Tamaño}</p>
                                  )}
                                  {item.customization.archivosAdjuntos && item.customization.archivosAdjuntos.length > 0 && (
                                    <div className="mb-1">
                                      <span className="font-medium">Archivos adjuntos:</span>
                                      <div className="grid grid-cols-3 gap-2 mt-2">
                                        {item.customization.archivosAdjuntos.map((archivo, idx) => (
                                          <div
                                            key={idx}
                                            className="border border-slate-200 rounded-lg p-1 hover:border-blue-300 transition-all group relative cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();

                                              if (!archivo.url) return;

                                              const url = `${API_URL}${archivo.url}`;

                                              if (archivo.esImagen) {
                                                setImagenAmpliada(url);
                                              } else {
                                                window.open(url, "_blank");
                                              }
                                            }}
                                          >
                                            {archivo.esImagen ? (
                                              <div className="relative">
                                                <img
                                                  src={`${API_URL}${archivo.url}`}
                                                  alt={archivo.nombre}
                                                  className="w-full h-16 object-cover rounded"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                  👁️
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded h-16">
                                                <FileText className="h-6 w-6 text-red-500" />
                                                <span className="text-[10px] mt-1">
                                                  {archivo.nombre?.split(".").pop()?.toUpperCase() || "FILE"}
                                                </span>
                                              </div>
                                            )}
                                            <p className="text-[10px] truncate mt-1 text-center">{archivo.nombre}</p>
                                            {archivo.pendiente && (
                                              <span className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] px-1 rounded-bl">!</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end justify-between">
                            <div className="text-right">
                              <div className="font-bold text-lg text-purple-600">
                                {formatPrice(calculateItemTotal(item))}
                              </div>
                              <div className="text-sm text-slate-500">
                                {formatPrice(item.Precio)} c/u
                              </div>
                              {item.Descuento > 0 && (
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1">
                                  -{item.Descuento}% de descuento
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate("/editarcarritoservicio", { state: { item } })}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                              >
                                <Edit2 className="h-4 w-4" /> Editar
                              </button>
                              <button
                                onClick={() => setConfirmDelete(item.id)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium transition"
                              >
                                <Trash2 className="h-4 w-4" /> Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Agrega este modal al final del componente, justo antes de cerrar el div principal */}
            {imagenAmpliada && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setImagenAmpliada(null)}
              >
                <div className="relative max-w-4xl max-h-[90vh]">
                  <img
                    src={imagenAmpliada}
                    alt="Imagen ampliada"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => setImagenAmpliada(null)}
                    className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Carrito vacío */}
            {cart.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-slate-800">Tu carrito está vacío</h3>
                <p className="text-slate-600 mt-2 mb-6">
                  Agrega productos o servicios para comenzar a comprar
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    to="/productos"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Ver Productos
                  </Link>
                  <Link
                    to="/servicios"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                  >
                    Ver Servicios
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 sticky top-24">
              <h2 className="font-bold text-xl text-slate-800 mb-6 border-b pb-3">
                Resumen del Pedido
              </h2>

              {/* Resumen de items */}
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="truncate">
                      <span className="font-medium">{item.quantity}x</span> {item.Nombre}
                      {getColorDisplay(item) && (
                        <span className="text-slate-500 ml-1">({getColorDisplay(item)})</span>
                      )}
                    </div>
                    <span className="font-medium">
                      {formatPrice(calculateItemTotal(item))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="space-y-4 mb-6 border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal productos:</span>
                  <span className="font-medium">
                    {formatPrice(productos.reduce((sum, item) => sum + calculateItemTotal(item), 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal servicios:</span>
                  <span className="font-medium">
                    {formatPrice(servicios.reduce((sum, item) => sum + calculateItemTotal(item), 0))}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={total === 0}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${total === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                    }`}
                >
                  Proceder al Pago
                </button>

                <button
                  onClick={() => setShowModalVaciar(true)}
                  className="w-full py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                  disabled={cart.length === 0}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LOGIN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Necesitas una cuenta</h2>
            <p className="mt-2 text-slate-600">
              Para continuar con la compra, inicia sesión o regístrate.
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <Link
                to="/login"
                className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Iniciar Sesión o crear Cuenta
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-slate-500 hover:text-slate-700 mt-2"
              >
                Continuar sin cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VACÍAR CARRITO */}
      {showModalVaciar && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Vaciar carrito</h2>
            <p className="mt-2 text-slate-600">
              ¿Estás seguro de que deseas vaciar todo el carrito? Esta acción no se puede deshacer.
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <button
                className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                onClick={() => {
                  clearCart();
                  setShowModalVaciar(false);
                  toast.success("Carrito vaciado");
                }}
              >
                Sí, vaciar carrito
              </button>
              <button
                className="w-full py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                onClick={() => setShowModalVaciar(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR PRODUCTO */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Confirmar eliminación</h2>
            <p className="mt-2 text-slate-600">
              ¿Deseas eliminar este {getItemType(cart.find(item => item.id === confirmDelete))} del carrito?
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <button
                className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                onClick={() => {
                  removeFromCart(confirmDelete);
                  setConfirmDelete(null);
                  toast.success("Elemento eliminado del carrito");
                }}
              >
                Sí, eliminar
              </button>
              <button
                className="w-full py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR COLOR */}
      {editingColorItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

            {/* Header del Modal - Fijo */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Cambiar color</h2>
                    <p className="text-xs text-blue-100">{editingColorItem.Nombre}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingColorItem(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal - Scrollable */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">

              {/* Información del color actual */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Color actual:</span>
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    {getColorDisplay(editingColorItem) ? (
                      <>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: editingColorItem.customization?.color?.Hex || '#ccc' }}
                        />
                        {getColorDisplay(editingColorItem)}
                      </>
                    ) : (
                      "No seleccionado"
                    )}
                  </span>
                </div>
              </div>

              {/* Información de cantidad actual - Integrada mejor */}
              {editingColorItem.quantity > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 rounded-full p-1 mt-0.5">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Cantidad actual: {editingColorItem.quantity} unidades
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Al cambiar de color, la cantidad se ajustará automáticamente si el nuevo color tiene menos stock.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Título de selección */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Selecciona un nuevo color:
                </h3>
              </div>

              {/* Grid de colores */}
              {loadingColors[editingColorItem.ProductoId] ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-500 text-sm mt-2">Cargando colores...</p>
                </div>
              ) : (
                <>
                  {productColors[editingColorItem.ProductoId]?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {productColors[editingColorItem.ProductoId].map((color) => {
                        const currentColorObj = editingColorItem.customization?.color;
                        const isCurrentColor = currentColorObj?.ColorId === color.ColorId;
                        const excedeStock = editingColorItem.quantity > color.Stock;
                        const sinStock = color.Stock === 0;

                        return (
                          <button
                            key={color.ColorId}
                            onClick={() => handleSelectColor(color)}
                            disabled={sinStock}
                            className={`
                        relative p-3 rounded-xl border-2 transition-all
                        ${isCurrentColor
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                                : sinStock
                                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                  : excedeStock
                                    ? 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100'
                                    : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                              }
                      `}
                          >
                            {/* Badge de advertencia */}
                            {excedeStock && !isCurrentColor && (
                              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg z-10">
                                ⚠️
                              </span>
                            )}

                            {/* Círculo de color */}
                            <div className="flex justify-center mb-2">
                              <div
                                className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: color.Hex || '#ccc' }}
                              />
                            </div>

                            {/* Nombre del color */}
                            <p className="text-sm font-medium text-slate-700 text-center truncate">
                              {color.Nombre}
                            </p>

                            {/* Stock */}
                            <p className={`text-xs text-center mt-1 font-medium ${sinStock
                              ? 'text-red-600'
                              : excedeStock
                                ? 'text-yellow-600'
                                : 'text-green-600'
                              }`}>
                              {sinStock
                                ? 'Agotado'
                                : excedeStock
                                  ? `${color.Stock} disp.`
                                  : `${color.Stock} uds`
                              }
                            </p>

                            {/* Indicador de selección actual */}
                            {isCurrentColor && (
                              <div className="absolute top-2 left-2 bg-blue-600 rounded-full p-0.5">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                      <Palette className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-slate-600 text-sm">No hay colores disponibles</p>
                      <p className="text-xs text-slate-400 mt-1">para este producto</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer del Modal - Botones */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3">
              <button
                onClick={() => setEditingColorItem(null)}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="colored"
      />
    </div>
  );
};