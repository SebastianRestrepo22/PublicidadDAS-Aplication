import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Cargar carrito al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.error("Error leyendo carrito de localStorage", e);
    }
  }, []);

  // Guardar carrito cuando cambia
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error guardando carrito en localStorage", e);
    }
  }, [cart]);

  // ➕ AGREGAR PRODUCTO AL CARRITO
  const addToCart = (product, options = {}, quantity = 1) => {
    const discount = product.Descuento || product.descuento || 0;
    const originalPrice = product.Precio || product.precio || 0;

    const finalPrice =
      discount > 0 ? originalPrice - (originalPrice * discount) / 100 : originalPrice;

    const cartLine = {
      id: uuidv4(),
      ProductoServicioId:
        product.ProductoServicioId ??
        product.ServiceId ??
        product.id ??
        null,
      Nombre: product.Nombre ?? product.name ?? "Producto",
      Precio: finalPrice,
      UrlImagen: options.urlImagen || product.UrlImagen || product.Url || "",
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      options: {
        alto: options.alto || null,
        ancho: options.ancho || null,
        descripcion: options.descripcion || "",
        ...options,
      },
    };

    setCart((prev) => [...prev, cartLine]);
  };

  //  ELIMINAR ITEM DEL CARRITO
  const removeFromCart = (lineId) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  //  ACTUALIZAR SOLO LA CANTIDAD
  const updateQuantity = (lineId, newQuantity) => {
    setCart((prev) =>
      prev.map((l) =>
        l.id === lineId ? { ...l, quantity: Math.max(1, newQuantity) } : l
      )
    );
  };

  // ✏️ **ACTUALIZAR ITEM COMPLETO (USADO EN EDITAR PRODUCTO)**
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

  // 🧹 VACIAR CARRITO
  const clearCart = () => setCart([]);

  // 💰 TOTAL
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
