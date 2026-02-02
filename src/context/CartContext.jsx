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

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error guardando carrito en localStorage", e);
    }
  }, [cart]);

  const addToCart = (product, customization = {}, quantity = 1) => {
    const stock = product.Stock ?? product.stock ?? null;
    const productId = product.ProductoId || product.ServicioId || product.id;
    
    // 🔴 CORREGIDO: Manejo correcto de UUID de color
    let colorId = null;
    if (customization.color) {
      // Si el color es un objeto, extraer el UUID
      if (typeof customization.color === 'object' && customization.color.ColorId) {
        colorId = customization.color.ColorId;
      } 
      // Si es un string, verificar si es UUID
      else if (typeof customization.color === 'string') {
        // Verificar si es un UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(customization.color)) {
          colorId = customization.color;
        }
      }
    }

    // Crear fingerprint considerando el UUID del color
    const itemFingerprint = JSON.stringify({
      productId,
      colorId, // 🔴 Usar el UUID en lugar del objeto completo
      size: customization.size,
      personalizacion: customization,
    });

    const existingLineIndex = cart.findIndex((l) => {
      if (l.ProductoId !== product.ProductoId && 
          l.ServicioId !== product.ServicioId) {
        return false;
      }
      
      // Comparar UUIDs de color
      const existingColorId = l.customization?.colorId || 
                              (typeof l.customization?.color === 'object' ? l.customization.color.ColorId : l.customization?.color);
      
      if (colorId && existingColorId !== colorId) {
        return false;
      }
      
      if (product.EsPersonalizado || customization.Nombre) {
        const existingFingerprint = JSON.stringify({
          productId: l.ProductoId || l.ServicioId,
          colorId: existingColorId,
          size: l.customization?.size,
          personalizacion: l.customization
        });
        return existingFingerprint === itemFingerprint;
      }
      
      return true;
    });

    if (existingLineIndex !== -1) {
      const existingLine = cart[existingLineIndex];
      const newQuantity = existingLine.quantity + quantity;

      if (stock !== null && newQuantity > stock) {
        toast.error(`Solo hay ${stock} unidades disponibles`);
        return;
      }

      const updatedCart = [...cart];
      updatedCart[existingLineIndex] = {
        ...existingLine,
        quantity: newQuantity
      };
      setCart(updatedCart);
      
      toast.success(`${product.Nombre} actualizado en el carrito`);
      return;
    }

    const discount = product.Descuento || product.descuento || 0;
    const originalPrice = product.Precio || product.precio || 0;
    const finalPrice = discount > 0 ? originalPrice - (originalPrice * discount) / 100 : originalPrice;
    const itemType = product.ServicioId || product.EsPersonalizado ? "servicio" : "producto";

    const cartLine = {
      id: uuidv4(),
      ProductoId: product.ProductoId || null,
      ServicioId: product.ServicioId || null,
      Nombre: product.Nombre || "Producto",
      Descripcion: product.Descripcion || "",
      Precio: finalPrice,
      Descuento: discount,
      UrlImagen: product.UrlImagen || product.Imagen || product.Url || "",
      Imagen: product.Imagen || product.UrlImagen || "",
      Stock: stock,
      stock: stock,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      Tipo: itemType,
      EsPersonalizado: product.EsPersonalizado || false,
      // 🔴 CORREGIDO: Guardar el UUID del color en lugar del objeto completo
      customization: {
        colorId: colorId, // UUID del color
        colorName: customization.color?.Nombre || 
                   (typeof customization.color === 'string' && !colorId ? customization.color : null),
        size: customization.size || null,
        ...customization
      },
      CategoriaId: product.CategoriaId,
      createdAt: new Date().toISOString()
    };

    if (stock !== null && cartLine.quantity > stock) {
      toast.error(`Solo hay ${stock} unidades disponibles`);
      return;
    }

    setCart((prev) => [...prev, cartLine]);
    toast.success(`${product.Nombre} agregado al carrito`);
  };

  const removeFromCart = (lineId) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  const updateQuantity = (lineId, newQuantity) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        
        const stock = l.Stock ?? null;
        const validatedQuantity = Math.max(1, newQuantity);

        if (stock !== null && validatedQuantity > stock) {
          toast.error(`Solo hay ${stock} unidades disponibles`);
          return { ...l, quantity: stock };
        }

        return { ...l, quantity: validatedQuantity };
      })
    );
  };

  // 🔴 FUNCIÓN CORREGIDA PARA ACTUALIZAR COLOR
  const updateItemColor = (lineId, colorData) => {
    console.log("🎨 [CART CONTEXT] updateItemColor llamado:", {
      lineId,
      colorData
    });
    
    const updatedCart = cart.map((item) => {
      if (item.id === lineId) {
        // Extraer UUID del color
        let colorId = null;
        let colorName = null;
        
        if (colorData) {
          if (typeof colorData === 'object' && colorData.ColorId) {
            colorId = colorData.ColorId;
            colorName = colorData.Nombre;
          } else if (typeof colorData === 'string') {
            // Verificar si es UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(colorData)) {
              colorId = colorData;
            } else {
              colorName = colorData;
            }
          }
        }
        
        return {
          ...item,
          customization: {
            ...item.customization,
            colorId: colorId, // Guardar UUID
            colorName: colorName, // Guardar nombre para display
            color: colorId || colorName // Mantener compatibilidad
          }
        };
      }
      return item;
    });
    
    setCart(updatedCart);
    console.log("📦 [CART CONTEXT] Carrito actualizado:", updatedCart);
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
        updateItemColor,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);