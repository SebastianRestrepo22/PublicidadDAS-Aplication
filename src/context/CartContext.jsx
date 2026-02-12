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

    // 🔴 CORREGIDO: Manejo consistente del color
    let colorData = null;

    if (customization.color) {
      // Si es un string UUID
      if (typeof customization.color === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(customization.color)) {
          colorData = {
            ColorId: customization.color,
            Nombre: customization.colorName || "Color no definido"
          };
        } else {
          // Si es solo un nombre de color
          colorData = {
            ColorId: null,
            Nombre: customization.color
          };
        }
      }
      // Si es un objeto color completo
      else if (typeof customization.color === 'object') {
        colorData = {
          ColorId: customization.color.ColorId || null,
          Nombre: customization.color.Nombre || "Color no definido",
          Hex: customization.color.Hex || "#ccc"
        };
      }
    }

    // Crear fingerprint usando ColorId si existe
    const itemFingerprint = JSON.stringify({
      productId,
      colorId: colorData?.ColorId || null,
      colorName: colorData?.Nombre || null,
      size: customization.size,
      personalizacion: customization,
    });

    const existingLineIndex = cart.findIndex((l) => {
      if (l.ProductoId !== product.ProductoId &&
        l.ServicioId !== product.ServicioId) {
        return false;
      }

      // Extraer color del item existente
      const existingColor = l.customization?.color;
      const existingColorId = existingColor?.ColorId;
      const existingColorName = existingColor?.Nombre;

      // Comparar colores
      if (colorData) {
        if (colorData.ColorId && existingColorId !== colorData.ColorId) {
          return false;
        }
        if (!colorData.ColorId && colorData.Nombre && existingColorName !== colorData.Nombre) {
          return false;
        }
      } else if (existingColor) {
        return false;
      }

      // Para productos personalizados, comparar toda la customización
      if (product.EsPersonalizado || customization.Nombre) {
        const existingFingerprint = JSON.stringify({
          productId: l.ProductoId || l.ServicioId,
          colorId: existingColorId,
          colorName: existingColorName,
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
      // 🔴 CORREGIDO: Guardar color como objeto consistente
      customization: {
        color: colorData, // Guardar objeto color completo
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
    console.log("🛒 [CART] Producto agregado:", {
      nombre: product.Nombre,
      colorData: colorData,
      customization: cartLine.customization
    });
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

  const updateItemColor = (lineId, colorData) => {
    console.log("🎨 [CART CONTEXT] updateItemColor llamado:", {
      lineId,
      colorData
    });

    setCart(prev => prev.map(item => {
      if (item.id === lineId) {
        let newColorObj = null;

        // Procesar colorData para crear objeto consistente
        if (colorData) {
          if (typeof colorData === 'object' && colorData.ColorId) {
            newColorObj = {
              ColorId: colorData.ColorId,
              Nombre: colorData.Nombre || "Color no definido",
              Hex: colorData.Hex || "#ccc"
            };
          } else if (typeof colorData === 'string') {
            // Verificar si es UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(colorData)) {
              // Es un UUID, buscar el nombre en el catálogo
              const existingColors = productColors[item.ProductoId] || [];
              const foundColor = existingColors.find(c => c.ColorId === colorData);
              newColorObj = {
                ColorId: colorData,
                Nombre: foundColor?.Nombre || "Color no definido",
                Hex: foundColor?.Hex || "#ccc"
              };
            } else {
              // Es solo un nombre de color
              newColorObj = {
                ColorId: null,
                Nombre: colorData,
                Hex: "#ccc"
              };
            }
          }
        }

        console.log("🎨 [CART CONTEXT] Color actualizado a:", newColorObj);

        return {
          ...item,
          customization: {
            ...item.customization,
            color: newColorObj // Guardar objeto completo
          }
        };
      }
      return item;
    }));
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