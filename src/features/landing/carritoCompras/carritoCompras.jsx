import React, { useState, useEffect } from "react";
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
  X
} from "lucide-react";

// Servicio para obtener colores del producto
import { getColoresProducto } from "../../dashboard/productos/services/services.products";

export const CarritoCompras = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart, updateItemColor } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [showModalVaciar, setShowModalVaciar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [editingColorItem, setEditingColorItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [productColors, setProductColors] = useState({}); // {productoId: [colores]}
  const [loadingColors, setLoadingColors] = useState({});

  useEffect(() => {
    // Cargar colores para todos los productos en el carrito que tengan ProductoId
    const loadColorsForProducts = async () => {
      const productIds = cart
        .filter(item => item.ProductoId && !productColors[item.ProductoId])
        .map(item => item.ProductoId);
      
      for (const productId of productIds) {
        if (!loadingColors[productId]) {
          setLoadingColors(prev => ({ ...prev, [productId]: true }));
          try {
            const colors = await getColoresProducto(productId);
            setProductColors(prev => ({ 
              ...prev, 
              [productId]: colors 
            }));
          } catch (error) {
            console.error(`Error cargando colores para producto ${productId}:`, error);
            setProductColors(prev => ({ 
              ...prev, 
              [productId]: [] 
            }));
          } finally {
            setLoadingColors(prev => ({ ...prev, [productId]: false }));
          }
        }
      }
    };

    if (cart.length > 0) {
      loadColorsForProducts();
    }
  }, [cart, productColors, loadingColors]);

  const handleCheckout = () => {
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

  const handleIncrease = (item) => {
    const stock = item.Stock ?? item.stock ?? null;
    if (stock !== null && item.quantity + 1 > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
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
    const stock = item?.Stock ?? item?.stock ?? null;
    
    if (stock !== null && newQuantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
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
    
    updateItemColor(editingColorItem.id, color.Nombre);
    setEditingColorItem(null);
    toast.success(`Color cambiado a ${color.Nombre}`);
  };

  const getItemType = (item) => {
    if (item.ProductoId) return "producto";
    if (item.ServicioId) return "servicio";
    if (item.EsPersonalizado) return "servicio personalizado";
    return "item";
  };

  const getColorName = (item) => {
    if (item.customization?.color) return item.customization.color;
    if (item.color) return item.color;
    return null;
  };

  const formatPrice = (precio) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const calculateItemTotal = (item) => {
    const price = Number(item.Precio) || 0;
    const quantity = item.quantity || 1;
    return price * quantity;
  };

  const total = getTotal();

  // Filtrar productos y servicios para mostrar por separado
  const productos = cart.filter(item => item.ProductoId || (!item.ServicioId && !item.EsPersonalizado));
  const servicios = cart.filter(item => item.ServicioId || item.EsPersonalizado);

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
                    const currentColor = getColorName(item);
                    
                    return (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                        <div className="flex gap-4">
                          {/* Imagen */}
                          <div className="relative">
                            <img
                              src={item.UrlImagen || item.Imagen || "https://via.placeholder.com/200"}
                              alt={item.Nombre}
                              className="w-24 h-24 object-cover rounded-lg"
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
                              {currentColor ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Palette className="h-4 w-4 text-slate-500" />
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded-full border border-slate-300"
                                        style={{ 
                                          backgroundColor: colors.find(c => c.Nombre === currentColor)?.Hex || '#ccc'
                                        }}
                                      />
                                      <span className="text-sm font-medium text-slate-700">
                                        Color: {currentColor}
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

                            {/* Stock disponible */}
                            <div className="flex items-center gap-4 mt-3">
                              <div className="text-sm text-slate-600">
                                Stock disponible: <span className="font-semibold">{item.Stock || item.stock || "∞"}</span>
                              </div>
                              
                              {/* Contador de cantidad */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDecrease(item)}
                                  className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                
                                {editingStock === item.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="1"
                                      max={item.Stock || item.stock || 999}
                                      value={newQuantity}
                                      onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                                    />
                                    <button
                                      onClick={() => saveStockEdit(item.id)}
                                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={cancelStockEdit}
                                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                    >
                                      ✗
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => handleEditStock(item)}
                                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                    >
                                      <Edit2 className="h-3 w-3" /> Editar
                                    </button>
                                  </>
                                )}
                                
                                <button
                                  onClick={() => handleIncrease(item)}
                                  className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-full hover:bg-slate-100"
                                  disabled={item.Stock && item.quantity >= item.Stock}
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
                  {servicios.map((item) => (
                    <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                      <div className="flex gap-4">
                        {/* Imagen */}
                        <div className="relative">
                          <img
                            src={item.UrlImagen || item.Imagen || "https://via.placeholder.com/200"}
                            alt={item.Nombre}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                            {item.EsPersonalizado ? "Personalizado" : "Servicio"}
                          </span>
                        </div>

                        {/* Información */}
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{item.Nombre}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{item.Descripcion}</p>
                          
                          {/* Detalles de personalización */}
                          {item.customization && (
                            <div className="mt-3 space-y-1">
                              <h4 className="text-sm font-semibold text-slate-700">Detalles de personalización:</h4>
                              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                                {item.customization.Nombre && (
                                  <p className="mb-1"><span className="font-medium">Proyecto:</span> {item.customization.Nombre}</p>
                                )}
                                {item.customization.Tamaño && (
                                  <p className="mb-1"><span className="font-medium">Tamaño:</span> {item.customization.Tamaño}</p>
                                )}
                                {item.customization.ColorPreferido && (
                                  <p className="mb-1"><span className="font-medium">Color:</span> {item.customization.ColorPreferido}</p>
                                )}
                                {item.customization.Cantidad && (
                                  <p className="mb-1"><span className="font-medium">Cantidad:</span> {item.customization.Cantidad}</p>
                                )}
                                {item.customization.FechaEntrega && (
                                  <p className="mb-1"><span className="font-medium">Entrega:</span> {item.customization.FechaEntrega}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Precio y acciones */}
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
                  ))}
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
                      {getColorName(item) && (
                        <span className="text-slate-500 ml-1">({getColorName(item)})</span>
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
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                    total === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
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

              {/* Información adicional */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-slate-800 mb-2">🎁 Beneficios:</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Envío gratis en pedidos mayores a $100.000</li>
                  <li>• Pago seguro con múltiples métodos</li>
                  <li>• Soporte 24/7 para tus consultas</li>
                  <li>• Garantía de satisfacción</li>
                </ul>
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
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Cambiar color</h2>
                <p className="text-sm text-slate-600">
                  {editingColorItem.Nombre}
                </p>
              </div>
              <button
                onClick={() => setEditingColorItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-5 w-5 text-slate-500" />
                <span className="font-medium text-slate-700">
                  Color actual: {getColorName(editingColorItem) || "No seleccionado"}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 mb-4">
                Selecciona un nuevo color para este producto:
              </p>
            </div>

            {loadingColors[editingColorItem.ProductoId] ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-2">Cargando colores...</p>
              </div>
            ) : (
              <>
                {productColors[editingColorItem.ProductoId]?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    {productColors[editingColorItem.ProductoId].map((color) => (
                      <button
                        key={color.ColorId}
                        onClick={() => handleSelectColor(color)}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                          getColorName(editingColorItem) === color.Nombre
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full border border-slate-300 mb-2"
                          style={{ backgroundColor: color.Hex || '#ccc' }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {color.Nombre}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <Palette className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No hay colores disponibles para este producto</p>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  updateItemColor(editingColorItem.id, null);
                  setEditingColorItem(null);
                  toast.success("Color eliminado");
                }}
                className="flex-1 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                disabled={!getColorName(editingColorItem)}
              >
                Eliminar color
              </button>
              <button
                onClick={() => setEditingColorItem(null)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
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