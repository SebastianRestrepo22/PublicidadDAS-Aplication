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

  const addToCart = (product, options = {}, quantity = 1) => {
    const stock = product.Stock ?? product.stock ?? null;

    const itemId =
      product.ProductoServicioId ?? product.ServiceId ?? product.id ?? null;

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

      // Validación de stock solo para productos
      if (
        typeof stock === "number" &&
        stock > 0 &&
        product.Tipo === "Producto" &&
        newQuantity > stock
      ) {
        toast.error(`Solo hay ${stock} unidades disponibles`);
        return;
      }

      updateQuantity(existingLine.id, newQuantity);
      toast.success(`${product.Nombre} actualizado en el carrito`);
      return;
    }

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
      Stock: stock,
      Tipo: product.Tipo || "Producto",
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

    // Validación de stock inicial solo para productos
    if (
      typeof stock === "number" &&
      stock > 0 &&
      product.Tipo === "Producto" &&
      cartLine.quantity > stock
    ) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    setCart((prev) => [...prev, cartLine]);
  };

  //  ELIMINAR ITEM DEL CARRITO
  const removeFromCart = (lineId) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  const updateQuantity = (lineId, newQuantity) => {
    setCart((prev) =>
      prev.map((l) => {
        const stock = l.Stock ?? null;

        // Validación de stock solo para productos
        if (
          typeof stock === "number" &&
          stock > 0 &&
          l.Tipo === "Producto" &&
          newQuantity > stock
        ) {
          toast.error(`Solo hay ${stock} unidades disponibles`);
          return l;
        }

        return { ...l, quantity: Math.max(1, newQuantity) };
      })
    );
  };

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

  const clearCart = () => setCart([]);

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
