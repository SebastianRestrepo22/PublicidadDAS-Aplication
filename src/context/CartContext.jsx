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

  // Obtener stock según el tipo de producto
  const obtenerStockProducto = (producto) => {
    // Si usa colores (UsaColores === 1 o "1")
    if (producto.UsaColores === 1 || producto.UsaColores === "1") {
      // Stock total de todos los colores
      return producto.Colores && Array.isArray(producto.Colores) 
        ? producto.Colores.reduce((sum, color) => sum + (color.Stock || 0), 0)
        : 0;
    } else {
      // Stock general
      return producto.Stock || 0;
    }
  };

  // Validar stock de color específico
  const validarStockColor = (producto, colorId, cantidadSolicitada, cantidadEnCarrito = 0) => {
    if (!producto.Colores || !Array.isArray(producto.Colores)) {
      return { valido: false, mensaje: "Producto sin colores disponibles" };
    }

    const colorSeleccionado = producto.Colores.find(c => c.ColorId === colorId);
    if (!colorSeleccionado) {
      return { valido: false, mensaje: "Color no válido" };
    }

    const stockDisponible = colorSeleccionado.Stock || 0;
    const nuevaCantidadTotal = cantidadEnCarrito + cantidadSolicitada;

    if (stockDisponible === 0) {
      return { 
        valido: false, 
        mensaje: `El color ${colorSeleccionado.Nombre} no tiene stock disponible` 
      };
    }

    if (nuevaCantidadTotal > stockDisponible) {
      return { 
        valido: false, 
        mensaje: `Solo hay ${stockDisponible} unidades disponibles del color ${colorSeleccionado.Nombre}` 
      };
    }

    return { valido: true, color: colorSeleccionado };
  };

  // Validar stock general
  const validarStockGeneral = (producto, cantidadSolicitada, cantidadEnCarrito = 0) => {
    const stockDisponible = producto.Stock || 0;
    const nuevaCantidadTotal = cantidadEnCarrito + cantidadSolicitada;

    if (stockDisponible === 0) {
      return { valido: false, mensaje: "Producto sin stock disponible" };
    }

    if (nuevaCantidadTotal > stockDisponible) {
      return { 
        valido: false, 
        mensaje: `Solo hay ${stockDisponible} unidades disponibles` 
      };
    }

    return { valido: true };
  };

  const addToCart = (product, customization = {}, quantity = 1) => {
    // CORREGIDO: Identificar si es servicio (tiene ServicioId)
    const isServicio = !!product.ServicioId;
    const productId = product.ProductoId || product.ServicioId || product.id;
    const usaColores = !isServicio && (product.UsaColores === 1 || product.UsaColores === "1");
    
    console.log("🛒 [CART] Agregando item:", {
      productId,
      isServicio,
      usaColores,
      customization
    });

    // Procesar color de manera consistente (solo para productos)
    let colorData = null;
    let colorIdSeleccionado = null;

    if (!isServicio && customization.color) {
      // Si es un string (puede ser UUID o nombre)
      if (typeof customization.color === 'string') {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidRegex.test(customization.color)) {
          // Es un UUID
          colorIdSeleccionado = customization.color;
          // Buscar el color en el producto si existe
          if (product.Colores && Array.isArray(product.Colores)) {
            const foundColor = product.Colores.find(c => c.ColorId === customization.color);
            if (foundColor) {
              colorData = {
                ColorId: foundColor.ColorId,
                Nombre: foundColor.Nombre,
                Hex: foundColor.Hex
              };
            } else {
              colorData = {
                ColorId: customization.color,
                Nombre: "Color no definido",
                Hex: "#ccc"
              };
            }
          }
        } else {
          // Es solo un nombre de color
          colorData = {
            ColorId: null,
            Nombre: customization.color,
            Hex: "#ccc"
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
        colorIdSeleccionado = colorData.ColorId;
      }
    }

    // Buscar item existente en el carrito
    const existingItemIndex = cart.findIndex(item => {
      // Para servicios, comparar por ServicioId
      if (isServicio) {
        if (item.ServicioId !== product.ServicioId) return false;
        // Si es servicio personalizado, comparar toda la personalización
        return JSON.stringify(item.customization) === JSON.stringify(customization);
      }
      
      // Para productos
      if (item.ProductoId !== product.ProductoId) return false;

      // Si el producto usa colores, verificar el color
      if (usaColores) {
        const itemColorId = item.customization?.color?.ColorId;
        if (colorIdSeleccionado) {
          return itemColorId === colorIdSeleccionado;
        }
        return false;
      }

      // Stock general, cualquier item sin color
      return !item.customization?.color;
    });

    // Validar stock antes de agregar (solo para productos)
    if (!isServicio) {
      const cantidadExistente = existingItemIndex !== -1 ? cart[existingItemIndex].quantity : 0;

      if (usaColores && colorIdSeleccionado) {
        const validacion = validarStockColor(product, colorIdSeleccionado, quantity, cantidadExistente);
        if (!validacion.valido) {
          toast.error(validacion.mensaje);
          return;
        }
      } else if (!usaColores) {
        const validacion = validarStockGeneral(product, quantity, cantidadExistente);
        if (!validacion.valido) {
          toast.error(validacion.mensaje);
          return;
        }
      } else if (usaColores && !colorIdSeleccionado) {
        toast.error("Por favor selecciona un color");
        return;
      }
    }

    // Si existe, actualizar cantidad
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + quantity
      };
      setCart(updatedCart);
      toast.success(`${product.Nombre} actualizado en el carrito`);
      return;
    }

    // Si no existe, crear nuevo item
    const discount = product.Descuento || product.descuento || 0;
    const originalPrice = product.Precio || product.precio || 0;
    
    // CORREGIDO: Para servicios, usar el precio base o el del tamaño seleccionado
    let finalPrice = originalPrice;
    if (isServicio) {
      // Si viene un precio en la personalización (para servicios por tamaño), usarlo
      if (customization.precioSeleccionado) {
        finalPrice = customization.precioSeleccionado;
      }
      // Aplicar descuento si existe
      if (discount > 0) {
        finalPrice = finalPrice * (1 - discount / 100);
      }
    } else {
      finalPrice = discount > 0 ? originalPrice - (originalPrice * discount) / 100 : originalPrice;
    }

    const itemType = isServicio ? "servicio" : "producto";

    const cartLine = {
      id: uuidv4(),
      ProductoId: !isServicio ? product.ProductoId : null,
      ServicioId: isServicio ? product.ServicioId : null,
      Nombre: product.Nombre || "Producto",
      Descripcion: product.Descripcion || "",
      Precio: finalPrice,
      PrecioOriginal: originalPrice,
      Descuento: discount,
      UrlImagen: product.UrlImagen || product.Imagen || product.Url || "",
      Imagen: product.Imagen || product.UrlImagen || "",
      Stock: !isServicio ? (product.Stock || 0) : null,
      UsaColores: !isServicio && usaColores ? 1 : 0,
      quantity: quantity,
      Tipo: itemType,
      EsPersonalizado: product.EsPersonalizado || false,
      customization: {
        ...customization
      },
      CategoriaId: product.CategoriaId,
      createdAt: new Date().toISOString()
    };

    setCart((prev) => [...prev, cartLine]);
    console.log("🛒 [CART] Item agregado exitosamente:", cartLine);
    toast.success(`${product.Nombre} agregado al carrito`);
  };

  const removeFromCart = (lineId) => {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  };

  const updateQuantity = (lineId, newQuantity) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;

        // Validar stock según el tipo (solo para productos)
        const validatedQuantity = Math.max(1, newQuantity);
        const usaColores = l.UsaColores === 1;

        if (l.Tipo === 'producto') {
          if (usaColores && l.customization?.color?.ColorId) {
            // Crear un objeto producto simulado para la validación
            const productoSimulado = {
              UsaColores: 1,
              Colores: [{
                ColorId: l.customization.color.ColorId,
                Nombre: l.customization.color.Nombre,
                Stock: l.customization.color.Stock || 0
              }]
            };
            
            const validacion = validarStockColor(
              productoSimulado, 
              l.customization.color.ColorId, 
              validatedQuantity,
              0
            );

            if (!validacion.valido) {
              toast.error(validacion.mensaje);
              return l;
            }
          } else if (!usaColores) {
            const productoSimulado = { Stock: l.Stock };
            const validacion = validarStockGeneral(productoSimulado, validatedQuantity, 0);
            if (!validacion.valido) {
              toast.error(validacion.mensaje);
              return l;
            }
          }
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

        if (colorData) {
          if (typeof colorData === 'object' && colorData.ColorId) {
            newColorObj = {
              ColorId: colorData.ColorId,
              Nombre: colorData.Nombre || "Color no definido",
              Hex: colorData.Hex || "#ccc",
              Stock: colorData.Stock || 0
            };
          } else if (typeof colorData === 'string') {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(colorData)) {
              newColorObj = {
                ColorId: colorData,
                Nombre: "Color no definido",
                Hex: "#ccc",
                Stock: 0
              };
            } else {
              newColorObj = {
                ColorId: null,
                Nombre: colorData,
                Hex: "#ccc",
                Stock: 0
              };
            }
          }
        }

        return {
          ...item,
          customization: {
            ...item.customization,
            color: newColorObj
          }
        };
      }
      return item;
    }));
  };

  const updateItem = (lineId, updatedData) => {
    setCart(prev => prev.map(item => 
      item.id === lineId ? { ...item, ...updatedData } : item
    ));
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