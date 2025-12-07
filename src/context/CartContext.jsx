import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar carrito
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error guardando carrito en localStorage", e);
    }
  }, [cart]);

  // Agregar producto al carrito (con stock)
  const addToCart = (product, options = {}, quantity = 1) => {
    const stock = product.Stock ?? product.stock ?? null;

    // Validar stock inicial
    if (stock !== null && stock <= 0) {
      toast.error("Producto sin stock disponible");
      return;
    }

    const itemId =
      product.ProductoServicioId ??
      product.ServiceId ??
      product.id ??
      null;

    // Nueva lógica para encontrar líneas existentes
    const existingLine = cart.find((l) => {
      if (l.ProductoServicioId !== itemId) return false;

      if (!l.EsPersonalizado) return true;

      return (
        l.options?.alto === options.alto &&
        l.options?.ancho === options.ancho &&
        l.options?.descripcion === options.descripcion
      );
    });

    if (existingLine) {
      const newQuantity = existingLine.quantity + quantity;

      if (stock !== null && newQuantity > stock) {
        toast.error(`Solo hay ${stock} unidades disponibles`);
        return;
      }

      updateQuantity(existingLine.id, newQuantity);
      toast.success(`${product.Nombre} actualizado en el carrito`);
      return;
    }

    // Calcular precio con descuento
    const discount = product.Descuento || product.descuento || 0;
    const originalPrice = product.Precio || product.precio || 0;

    const finalPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;

    // Crear línea nueva
    const cartLine = {
      id: uuidv4(),
      ProductoServicioId: itemId,
      Nombre: product.Nombre || "Producto",
      Precio: finalPrice,
      UrlImagen:
        options.urlImagen || product.UrlImagen || product.Url || "",
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      Stock: stock,
      EsPersonalizado:
        product.EsPersonalizado ??
        product.esPersonalizado ??
        product.Customizable ??
        options.EsPersonalizado ??
        false,
      options: {
        alto: options.alto || null,
        ancho: options.ancho || null,
        descripcion: options.descripcion || "",
        ...options,
      },
    };

    // Verificación de stock inicial
    if (stock !== null && cartLine.quantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    setCart((prev) => [...prev, cartLine]);
    toast.success(`${product.Nombre} agregado al carrito`);
  };

  // Eliminar item
  const removeFromCart = (lineId) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  // Actualizar cantidad (con stock)
  const updateQuantity = (lineId, newQuantity) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;

        const stock = l.Stock ?? null;

        if (stock !== null && newQuantity > stock) {
          toast.error(`Solo hay ${stock} unidades disponibles`);
          return l;
        }

        return { ...l, quantity: Math.max(1, newQuantity) };
      })
    );
  };

  // Actualizar item completo
  const updateItem = (lineId, changes) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === lineId
          ? {
              ...item,
              ...changes,
              options: { ...item.options, ...(changes.options || {}) },
            }
          : item
      )
    );
  };

  // Vaciar carrito
  const clearCart = () => setCart([]);

  // Total
  const getTotal = () =>
    cart.reduce(
      (sum, l) => sum + (Number(l.Precio) || 0) * (l.quantity || 1),
      0
    );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItem,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
