import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";

// Obtener todas las ventas
export const getAllVentasModel = async () => {
  try {
    const [rows] = await dbPool.query(`
      SELECT 
        v.VentaId,
        v.Origen,
        v.PedidoClienteId,
        v.ClienteId,
        v.ClienteNombre,
        v.ClienteTelefono,
        v.ClienteCorreo,
        v.UsuarioVendedorId,
        u.NombreCompleto AS UsuarioVendedorNombre,
        v.FechaVenta,
        v.Subtotal,
        v.IVA,
        v.Total,
        v.Estado
      FROM ventas v
      LEFT JOIN usuarios u ON v.UsuarioVendedorId = u.CedulaId
      ORDER BY v.FechaVenta DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error en getAllVentasModel:", error);
    throw error;
  }
};

// Obtener venta por ID
export const getVentaByIdModel = async (ventaId) => {
  try {
    const [rows] = await dbPool.query(
      `SELECT 
        v.*,
        u.NombreCompleto AS UsuarioVendedorNombre,
        u.Telefono AS UsuarioTelefono,
        u.CorreoElectronico AS UsuarioCorreo,
        pc.FechaRegistro AS FechaPedido,
        pc.Estado AS EstadoPedido
      FROM ventas v
      LEFT JOIN usuarios u ON v.UsuarioVendedorId = u.CedulaId
      LEFT JOIN pedidosclientes pc ON v.PedidoClienteId = pc.PedidoClienteId
      WHERE v.VentaId = ?`,
      [ventaId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error en getVentaByIdModel:", error);
    throw error;
  }
};

// Crear venta desde pedido
export const createVentaFromPedidoModel = async (pedidoData, usuarioVendedorId) => {
  const connection = await dbPool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar si ya existe venta para este pedido
    const [ventaExistente] = await connection.query(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [pedidoData.PedidoClienteId]
    );
    
    if (ventaExistente.length > 0) {
      await connection.rollback();
      console.log("Ya existe venta para este pedido:", ventaExistente[0].VentaId);
      return { 
        success: false, 
        alreadyExists: true, 
        VentaId: ventaExistente[0].VentaId 
      };
    }
    
    const VentaId = uuidv4();
    
    // 🔥 SOLUCIÓN: Limpiar y formatear correctamente el Total
    let subtotal = pedidoData.Total || 0;
    
    // Si es string, limpiar formato
    if (typeof subtotal === 'string') {
      // Eliminar puntos de miles y convertir coma a punto si es necesario
      subtotal = subtotal.replace(/\./g, '').replace(',', '.');
    }
    
    // Convertir a número y redondear a 2 decimales
    subtotal = parseFloat(subtotal).toFixed(2);
    subtotal = parseFloat(subtotal); // Volver a número para cálculos
    
    // Calcular IVA (19%) con 2 decimales
    const IVA = parseFloat((subtotal * 0.19).toFixed(2));
    
    // Total final con 2 decimales
    const total = parseFloat((subtotal + IVA).toFixed(2));
    
    console.log('Valores formateados:', {
      subtotalOriginal: pedidoData.Total,
      subtotalLimpio: subtotal,
      IVA,
      total
    });
    
    // Determinar datos del cliente según el tipo
    let clienteId = null;
    let clienteNombre = null;
    let clienteTelefono = null;
    let clienteCorreo = null;
    
    if (pedidoData.TipoCliente === 'registrado' && pedidoData.ClienteId) {
      clienteId = pedidoData.ClienteId;
      // Obtener datos del cliente registrado
      const [clienteRows] = await connection.query(
        "SELECT NombreCompleto, Telefono, CorreoElectronico FROM usuarios WHERE CedulaId = ?",
        [pedidoData.ClienteId]
      );
      if (clienteRows.length > 0) {
        clienteNombre = clienteRows[0].NombreCompleto;
        clienteTelefono = clienteRows[0].Telefono;
        clienteCorreo = clienteRows[0].CorreoElectronico;
      }
    } else {
      // Cliente walk-in
      clienteNombre = pedidoData.ClienteNombre || null;
      clienteTelefono = pedidoData.ClienteTelefono || null;
      clienteCorreo = pedidoData.ClienteCorreo || null;
    }
    
    // Crear la venta principal
    await connection.query(
      `INSERT INTO ventas (
        VentaId, Origen, PedidoClienteId, ClienteId, ClienteNombre, 
        ClienteTelefono, ClienteCorreo, UsuarioVendedorId, FechaVenta, 
        Subtotal, IVA, Total, Estado
      ) VALUES (?, 'pedido', ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 'pagado')`,
      [
        VentaId, 
        pedidoData.PedidoClienteId, 
        clienteId, 
        clienteNombre, 
        clienteTelefono, 
        clienteCorreo, 
        usuarioVendedorId || null, 
        subtotal,  // ✅ Valor limpio
        IVA,       // ✅ Valor limpio
        total      // ✅ Valor limpio
      ]
    );
    
    await connection.commit();
    
    return {
      success: true,
      VentaId: VentaId,
      alreadyExists: false
    };
    
  } catch (error) {
    await connection.rollback();
    console.error("Error en createVentaFromPedidoModel:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Crear venta manual
export const createVentaManualModel = async (ventaData, connection) => {
  // Si no recibimos connection, significa que es llamado desde fuera
  // y debemos manejar la transacción aquí
  const usarConnection = connection || await dbPool.getConnection();
  const liberarConnection = !connection; // Solo liberar si creamos la conexión
  
  try {
    const VentaId = uuidv4();
    let {
      ClienteId,
      ClienteNombre,
      ClienteTelefono,
      ClienteCorreo,
      UsuarioVendedorId,
      Subtotal,
      IVA,
      Total,
      Estado = 'pagado'
    } = ventaData;
    
    // Limpiar y formatear valores numéricos
    const limpiarNumero = (valor) => {
      if (typeof valor === 'string') {
        valor = valor.replace(/\./g, '').replace(',', '.');
      }
      return parseFloat(parseFloat(valor).toFixed(2));
    };
    
    Subtotal = limpiarNumero(Subtotal || 0);
    IVA = limpiarNumero(IVA || (Subtotal * 0.19));
    Total = limpiarNumero(Total || (Subtotal + IVA));
    
    // Insertar venta
    await usarConnection.query(
      `INSERT INTO ventas (
        VentaId, Origen, ClienteId, ClienteNombre, ClienteTelefono, 
        ClienteCorreo, UsuarioVendedorId, FechaVenta, Subtotal, IVA, Total, Estado
      ) VALUES (?, 'manual', ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        VentaId, 
        ClienteId || null, 
        ClienteNombre || null, 
        ClienteTelefono || null, 
        ClienteCorreo || null, 
        UsuarioVendedorId, 
        Subtotal, 
        IVA, 
        Total, 
        Estado
      ]
    );
    
    return VentaId;
    
  } catch (error) {
    throw error;
  } finally {
    if (liberarConnection) {
      usarConnection.release();
    }
  }
};

// Actualizar estado de venta (solo a ANULADO)
export const anularVentaModel = async (ventaId) => {
  try {
    // Verificar que la venta existe y no está ya anulada
    const [venta] = await dbPool.query(
      "SELECT Estado FROM ventas WHERE VentaId = ?",
      [ventaId]
    );
    
    if (venta.length === 0) {
      return { success: false, message: "Venta no encontrada" };
    }
    
    if (venta[0].Estado === 'anulado') {
      return { success: false, message: "La venta ya está anulada" };
    }
    
    const [result] = await dbPool.query(
      "UPDATE ventas SET Estado = 'anulado' WHERE VentaId = ?",
      [ventaId]
    );
    
    return { 
      success: true, 
      affectedRows: result.affectedRows 
    };
    
  } catch (error) {
    console.error("Error en anularVentaModel:", error);
    throw error;
  }
};

// Verificar si existe venta para un pedido
export const existeVentaParaPedidoModel = async (pedidoClienteId) => {
  try {
    const [rows] = await dbPool.query(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [pedidoClienteId]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Error en existeVentaParaPedidoModel:", error);
    throw error;
  }
};

// Obtener venta por ID de pedido
export const getVentaByPedidoIdModel = async (pedidoClienteId) => {
  try {
    const [rows] = await dbPool.query(
      `SELECT v.*, u.NombreCompleto AS UsuarioVendedorNombre
       FROM ventas v
       LEFT JOIN usuarios u ON v.UsuarioVendedorId = u.CedulaId
       WHERE v.PedidoClienteId = ?`,
      [pedidoClienteId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error en getVentaByPedidoIdModel:", error);
    throw error;
  }
};

// models/venta.models.js
export const validarYDescontarStockModel = async (connection, detalles) => {
  const erroresStock = [];

  for (const detalle of detalles) {
    // Solo procesar productos
    if (detalle.TipoItem !== 'producto' || !detalle.ProductoId) continue;

    // Verificar si el producto usa colores
    const [productoRows] = await connection.query(
      `SELECT ProductoId, Nombre, Stock, UsaColores 
       FROM productos 
       WHERE ProductoId = ? FOR UPDATE`, 
      [detalle.ProductoId]
    );

    if (productoRows.length === 0) {
      erroresStock.push(`Producto no encontrado: ${detalle.ProductoId}`);
      continue;
    }

    const producto = productoRows[0];

    if (producto.UsaColores === 1) {
      // Producto con colores - validar en productocolores_stock
      if (!detalle.ColorId) {
        erroresStock.push(`El producto ${producto.Nombre} requiere seleccionar un color`);
        continue;
      }

      const [colorRows] = await connection.query(
        `SELECT Stock 
         FROM productocolores_stock 
         WHERE ProductoId = ? AND ColorId = ? FOR UPDATE`, // 🔒 BLOQUEO
        [detalle.ProductoId, detalle.ColorId]
      );

      if (colorRows.length === 0) {
        erroresStock.push(`Color no disponible para el producto ${producto.Nombre}`);
        continue;
      }

      const stockDisponible = colorRows[0].Stock;

      if (stockDisponible < detalle.Cantidad) {
        erroresStock.push(
          `Stock insuficiente para ${producto.Nombre} (Color seleccionado). ` +
          `Disponible: ${stockDisponible}, Solicitado: ${detalle.Cantidad}`
        );
        continue;
      }

      // DESCONTAR STOCK
      await connection.query(
        `UPDATE productocolores_stock 
         SET Stock = Stock - ? 
         WHERE ProductoId = ? AND ColorId = ?`,
        [detalle.Cantidad, detalle.ProductoId, detalle.ColorId]
      );

    } else {
      // Producto sin colores - validar stock directo
      if (producto.Stock < detalle.Cantidad) {
        erroresStock.push(
          `Stock insuficiente para ${producto.Nombre}. ` +
          `Disponible: ${producto.Stock}, Solicitado: ${detalle.Cantidad}`
        );
        continue;
      }

      // DESCONTAR STOCK
      await connection.query(
        `UPDATE productos 
         SET Stock = Stock - ? 
         WHERE ProductoId = ?`,
        [detalle.Cantidad, detalle.ProductoId]
      );
    }
  }

  if (erroresStock.length > 0) {
    throw new Error(erroresStock.join(' | '));
  }

  return true;
};

export const revertirStockVentaModel = async (connection, ventaId) => {
  // Obtener los detalles de productos de la venta
  const [detalles] = await connection.query(
    `SELECT dv.ProductoId, dv.Cantidad, dv.ColorId, p.UsaColores
     FROM detalleventas dv
     LEFT JOIN productos p ON dv.ProductoId = p.ProductoId
     WHERE dv.VentaId = ? AND dv.TipoItem = 'producto'`,
    [ventaId]
  );

  for (const detalle of detalles) {
    if (detalle.UsaColores === 1) {
      // Producto con colores - devolver stock
      await connection.query(
        `UPDATE productocolores_stock 
         SET Stock = Stock + ? 
         WHERE ProductoId = ? AND ColorId = ?`,
        [detalle.Cantidad, detalle.ProductoId, detalle.ColorId]
      );
    } else if (detalle.ProductoId) {
      // Producto sin colores - devolver stock
      await connection.query(
        `UPDATE productos 
         SET Stock = Stock + ? 
         WHERE ProductoId = ?`,
        [detalle.Cantidad, detalle.ProductoId]
      );
    }
  }

  return true;
};