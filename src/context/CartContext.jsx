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
    
    // Crear un ID único para este item específico basado en el producto y personalización
    const productId = product.ProductoId || product.ServicioId || product.id;
    
    // Crear un "fingerprint" único que considere producto + personalización
    const itemFingerprint = JSON.stringify({
      productId,
      color: customization.color,
      size: customization.size,
      personalizacion: customization,
      // Incluir otros campos de personalización únicos
      ...customization
    });

    // Buscar si ya existe un item IDÉNTICO (mismo producto + misma personalización)
    const existingLineIndex = cart.findIndex((l) => {
      // Primero verificar si es el mismo producto
      if (l.ProductoId !== product.ProductoId && 
          l.ServicioId !== product.ServicioId) {
        return false;
      }
      
      // Para productos con color, verificar que el color sea el mismo
      if (customization.color && l.customization?.color !== customization.color) {
        return false;
      }
      
      // Para servicios personalizados, comparar toda la personalización
      if (product.EsPersonalizado || customization.Nombre) {
        const existingFingerprint = JSON.stringify({
          productId: l.ProductoId || l.ServicioId,
          color: l.customization?.color,
          size: l.customization?.size,
          personalizacion: l.customization
        });
        return existingFingerprint === itemFingerprint;
      }
      
      // Para productos sin personalización, son iguales si son el mismo producto
      return true;
    });

    if (existingLineIndex !== -1) {
      // Producto IDÉNTICO encontrado, actualizar cantidad
      const existingLine = cart[existingLineIndex];
      const newQuantity = existingLine.quantity + quantity;

      // Validación de stock solo para productos
      if (stock !== null && newQuantity > stock) {
        toast.error(`Solo hay ${stock} unidades disponibles`);
        return;
      }

      // Actualizar cantidad del item existente
      const updatedCart = [...cart];
      updatedCart[existingLineIndex] = {
        ...existingLine,
        quantity: newQuantity
      };
      setCart(updatedCart);
      
      toast.success(`${product.Nombre} actualizado en el carrito`);
      return;
    }

    // PRODUCTO NUEVO O CON PERSONALIZACIÓN DIFERENTE - agregar como nuevo item
    const discount = product.Descuento || product.descuento || 0;
    const originalPrice = product.Precio || product.precio || 0;

    const finalPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;

    // Determinar el tipo
    const itemType = product.ServicioId || product.EsPersonalizado ? "servicio" : "producto";

    const cartLine = {
      id: uuidv4(),
      // IDs del producto/servicio
      ProductoId: product.ProductoId || null,
      ServicioId: product.ServicioId || null,
      // Información básica
      Nombre: product.Nombre || "Producto",
      Descripcion: product.Descripcion || "",
      Precio: finalPrice,
      Descuento: discount,
      // Imágenes
      UrlImagen: product.UrlImagen || product.Imagen || product.Url || "",
      Imagen: product.Imagen || product.UrlImagen || "",
      // Stock y cantidad
      Stock: stock,
      stock: stock, // Duplicado para compatibilidad
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      // Tipo y personalización
      Tipo: itemType,
      EsPersonalizado: product.EsPersonalizado || false,
      // Personalización completa
      customization: {
        color: customization.color || null,
        size: customization.size || null,
        ...customization
      },
      // Información adicional del producto/servicio
      CategoriaId: product.CategoriaId,
      createdAt: new Date().toISOString()
    };

    // Validación de stock inicial solo para productos
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

        // Validación de stock solo para productos
        if (stock !== null && validatedQuantity > stock) {
          toast.error(`Solo hay ${stock} unidades disponibles`);
          return { ...l, quantity: stock }; // Establecer al máximo disponible
        }

        return { ...l, quantity: validatedQuantity };
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
              customization: { 
                ...item.customization, 
                ...(changes.customization || {}) 
              },
              options: { 
                ...item.options, 
                ...(changes.options || {}) 
              }
            }
          : item
      )
    );
  };

  // Función especial para actualizar color
  const updateItemColor = (lineId, color) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === lineId
          ? {
              ...item,
              customization: { 
                ...item.customization, 
                color: color 
              }
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