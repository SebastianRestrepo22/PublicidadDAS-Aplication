import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";

export const getDetalleVentaByVentaIdModel = async (ventaId) => {
  try {
    const [rows] = await dbPool.query(
      `SELECT 
        dv.*,
        p.Nombre AS ProductoNombre,
        s.Nombre AS ServicioNombre,
        c.Nombre AS ColorNombre,
        c.Hex AS ColorHex
      FROM detalleventas dv
      LEFT JOIN productos p ON dv.ProductoId = p.ProductoId
      LEFT JOIN servicios s ON dv.ServicioId = s.ServicioId
      LEFT JOIN colores c ON dv.ColorId = c.ColorId
      WHERE dv.VentaId = ?`,
      [ventaId]
    );
    return rows;
  } catch (error) {
    console.error("Error en getDetalleVentaByVentaIdModel:", error);
    throw error;
  }
};

export const createDetallesVentaFromPedidoModel = async (connection, VentaId, detallesPedido) => {
  try {
    const detallesCreados = [];
    
    for (const detalle of detallesPedido) {
      const DetalleVentaId = uuidv4();
      
      let tipoItem = null;
      let productoId = null;
      let servicioId = null;
      let nombreSnapshot = "";
      let descripcionPersonalizada = detalle.Descripcion || null;
      
      if (detalle.ProductoId) {
        tipoItem = 'producto';
        productoId = detalle.ProductoId;
        
        const [productoRows] = await connection.query(
          "SELECT Nombre FROM productos WHERE ProductoId = ?",
          [detalle.ProductoId]
        );
        nombreSnapshot = productoRows.length > 0 ? productoRows[0].Nombre : "Producto";
        
      } else if (detalle.ServicioId) {
        tipoItem = 'servicio';
        servicioId = detalle.ServicioId;
        
        const [servicioRows] = await connection.query(
          "SELECT Nombre FROM servicios WHERE ServicioId = ?",
          [detalle.ServicioId]
        );
        nombreSnapshot = servicioRows.length > 0 ? servicioRows[0].Nombre : "Servicio";
      }
      
      const subtotal = detalle.Cantidad * detalle.Precio;
      
      await connection.query(
        `INSERT INTO detalleventas (
          DetalleVentaId, VentaId, TipoItem, ProductoId, ServicioId,
          NombreSnapshot, Cantidad, PrecioUnitario,
          Descuento, Subtotal, ColorId, DescripcionPersonalizada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DetalleVentaId,
          VentaId,
          tipoItem,
          productoId,
          servicioId,
          nombreSnapshot,
          detalle.Cantidad,
          detalle.Precio,
          detalle.Descuento || 0,
          subtotal,
          detalle.ColorId || null,
          descripcionPersonalizada
        ]
      );
      
      detallesCreados.push(DetalleVentaId);
    }
    
    return detallesCreados;
    
  } catch (error) {
    console.error("Error en createDetallesVentaFromPedidoModel:", error);
    throw error;
  }
};

export const createDetalleVentaManualModel = async (connection, detalleData) => {
  try {
    const DetalleVentaId = uuidv4();
    const {
      VentaId,
      TipoItem,
      ProductoId,
      ServicioId,
      NombreSnapshot,
      Cantidad,
      PrecioUnitario,
      Descuento = 0,
      Subtotal,
      ColorId,
      DescripcionPersonalizada
    } = detalleData;
    
    // ¡CORREGIDO! Ahora hay 12 parámetros para 12 columnas
    await connection.query(
      `INSERT INTO detalleventas (
        DetalleVentaId, VentaId, TipoItem, ProductoId, ServicioId,
        NombreSnapshot, Cantidad, PrecioUnitario,
        Descuento, Subtotal, ColorId, DescripcionPersonalizada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        DetalleVentaId,
        VentaId,
        TipoItem,
        ProductoId || null,
        ServicioId || null,
        NombreSnapshot,
        Cantidad,
        PrecioUnitario,
        Descuento,
        Subtotal,
        ColorId || null,
        DescripcionPersonalizada || null  // ← Este es el parámetro que faltaba
      ]
    );
    
    return DetalleVentaId;
    
  } catch (error) {
    console.error("Error en createDetalleVentaManualModel:", error);
    throw error;
  }
};

export const deleteDetallesByVentaIdModel = async (connection, ventaId) => {
  try {
    const [result] = await connection.query(
      "DELETE FROM detalleventas WHERE VentaId = ?",
      [ventaId]
    );
    return result;
  } catch (error) {
    console.error("Error en deleteDetallesByVentaIdModel:", error);
    throw error;
  }
};