// models/venta.models.js
import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

const sanitize = (v) => (v === undefined ? null : v);

<<<<<<< Updated upstream
export const createVentaFromPedidoModel = async (pedidoData, detallesPedido) => {
=======
// Obtener todas las ventas
export const getAllVentasModel = async () => {
  const connection = await connectDB();
  try {
    const [rows] = await connection.execute(`
      SELECT 
        v.VentaId,
        v.Origen,
        v.PedidoClienteId,
        v.ClienteId,
        v.ClienteNombre,        v.ClienteTelefono,
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
  } finally {
    connection.release?.();
  }
};

// Obtener venta por ID
export const getVentaByIdModel = async (ventaId) => {
  const connection = await connectDB();
  try {
    const [rows] = await connection.execute(
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
  } finally {
    connection.release?.();
  }
};

// Crear venta desde pedido
export const createVentaFromPedidoModel = async (pedidoData, usuarioVendedorId) => {
>>>>>>> Stashed changes
  const connection = await connectDB();
  
  try {
    // Verificar si ya existe venta para este pedido
    const [ventaExistente] = await connection.execute(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [pedidoData.PedidoClienteId]
    );
    
    if (ventaExistente.length > 0) {
      console.log("⚠️ Ya existe venta para este pedido:", ventaExistente[0].VentaId);
      return ventaExistente[0].VentaId; // Retornar el ID existente
    }
    
    const VentaId = uuidv4();
    const IVA = pedidoData.Total * 0.19; // Calcular IVA (19%)
    
    console.log("🔄 Creando venta desde pedido:", {
      PedidoClienteId: pedidoData.PedidoClienteId,
      Total: pedidoData.Total,
      IVA,
      items: detallesPedido.length
    });
    
    // Crear la venta principal
    await connection.execute(
      `INSERT INTO ventas (VentaId, PedidoClienteId, FechaVenta, Total, IVA, Estado)
       VALUES (?, ?, NOW(), ?, ?, 'Completada')`,
      [VentaId, pedidoData.PedidoClienteId, pedidoData.Total, IVA]
    );
    
    console.log("✅ Venta principal creada:", VentaId);
    
    // Crear detalles de venta
    let detallesCreados = 0;
    for (const detalle of detallesPedido) {
      // Obtener nombre del producto/servicio
      let nombre = "";
      let descripcion = detalle.Descripcion || "";
      
      if (detalle.ProductoId) {
        const [productoRows] = await connection.execute(
          "SELECT Nombre, Descripcion FROM productos WHERE ProductoId = ?",
          [detalle.ProductoId]
        );
        if (productoRows.length > 0) {
          nombre = productoRows[0].Nombre;
          if (!descripcion) descripcion = productoRows[0].Descripcion || "";
        } else {
          nombre = "Producto no encontrado";
        }
      } else if (detalle.ServicioId) {
        const [servicioRows] = await connection.execute(
          "SELECT Nombre, Descripcion FROM servicios WHERE ServicioId = ?",
          [detalle.ServicioId]
        );
        if (servicioRows.length > 0) {
          nombre = servicioRows[0].Nombre;
          if (!descripcion) descripcion = servicioRows[0].Descripcion || "";
        } else {
          nombre = "Servicio no encontrado";
        }
      }
      
      // Calcular subtotal
      const subtotal = detalle.Cantidad * detalle.Precio;
      
      // Crear detalle de venta
      await connection.execute(
        `INSERT INTO detalleventas 
         (DetalleVentaId, VentaId, ProductoId, ServicioId, Nombre, Cantidad, 
          PrecioUnitario, Tamaño, Descripcion, ColorId, Subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          VentaId,
          detalle.ProductoId || null,
          detalle.ServicioId || null,
          nombre,
          detalle.Cantidad,
          detalle.Precio,
          detalle.Tamaño || null,
          descripcion,
          detalle.ColorId || null,
          subtotal
        ]
      );
      
      detallesCreados++;
    }
    
    console.log(`✅ ${detallesCreados} detalles de venta creados`);
    
    return VentaId;
    
  } catch (error) {
    console.error("❌ Error en createVentaFromPedidoModel:", error);
    throw error;
  }
};

// models/detalleVentas.models.js
export const getDetalleVentaByVentaIdModel = async (VentaId) => {
  const connection = await connectDB();
  
  const [rows] = await connection.execute(
    `SELECT dv.*, 
            c.Nombre as ColorNombre,
            c.Hex as ColorHex
     FROM detalleventas dv
     LEFT JOIN colores c ON dv.ColorId = c.ColorId
     WHERE dv.VentaId = ?`,
    [VentaId]
  );
  
  return rows;
};

// Obtener todas las ventas
export const getAllVentasModel = async () => {
  const connection = await connectDB();
  const [rows] = await connection.execute(`
    SELECT 
      v.VentaId,
      v.PedidoClienteId,
      u.NombreCompleto AS NombreCliente,  
      v.FechaVenta,
      v.Total,
      v.IVA,
      v.Estado
    FROM ventas v
    LEFT JOIN pedidosclientes pc ON v.PedidoClienteId = pc.PedidoClienteId
    LEFT JOIN usuarios u ON pc.ClienteId = u.CedulaId
  `);
  return rows;
};

export const getVentaByIdModel = async (ventaId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    `SELECT 
      v.*,
      u.NombreCompleto AS NombreCliente,
      u.Telefono,
      u.CorreoElectronico AS Correo,
      u.Direccion
     FROM ventas v
     LEFT JOIN pedidosclientes pc ON v.PedidoClienteId = pc.PedidoClienteId
     LEFT JOIN usuarios u ON pc.ClienteId = u.CedulaId
     WHERE v.VentaId = ?`,
    [ventaId]
  );
  return rows[0];
};

// Crear una nueva venta desde pedido
export const createDetalleVentaModel = async (detalleData) => {
  const connection = await connectDB();
  const DetalleVentaId = uuidv4();
  
  const query = `
    INSERT INTO detalleventas 
    (DetalleVentaId, VentaId, ProductoId, ServicioId, Nombre, 
     Cantidad, PrecioUnitario, Descuento, Subtotal, Tamaño, 
     Descripcion, ColorId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    DetalleVentaId,
    detalleData.VentaId,
    detalleData.ProductoId || null,
    detalleData.ServicioId || null,
    detalleData.Nombre || "",
    detalleData.Cantidad || 1,
    detalleData.PrecioUnitario || 0,
    detalleData.Descuento || 0,
    detalleData.Subtotal || 0,
    detalleData.Tamaño || 'Mediana',
    detalleData.ServicioId ? (detalleData.Descripcion || "") : null,
    detalleData.ProductoId ? (detalleData.ColorId || null) : null
  ];
  
  await connection.execute(query, values);
  
  return { DetalleVentaId };
};

// Actualizar una venta
// models/venta.models.js - Actualiza updateVentaModel
export const updateVentaModel = async (ventaId, data) => {
  const connection = await connectDB();
  const { Total, IVA, Estado } = data;

  // Validar estado
  const estadosPermitidos = ['pendiente', 'aprobado', 'entregado', 'cancelado'];
  const estadoValidado = estadosPermitidos.includes(Estado) ? Estado : null;

  const [result] = await connection.execute(
    `UPDATE ventas
     SET Total = ?, IVA = ?, Estado = ?
     WHERE VentaId = ?`,
    [sanitize(Total), sanitize(IVA), sanitize(estadoValidado), ventaId]
  );

  return result;
};

// Eliminar una venta
export const deleteVentaModel = async (ventaId) => {
  const connection = await connectDB();
  const [result] = await connection.execute(
    "DELETE FROM ventas WHERE VentaId = ?",
    [ventaId]
  );
  return result;
};

// models/venta.models.js - Añade esta función si no existe
export const createVentaModel = async ({ PedidoClienteId, Total, IVA, Estado = "pendiente" }) => {
  const connection = await connectDB();
  const VentaId = uuidv4();

  // Validar estado
  const estadosPermitidos = ['pendiente', 'aprobado', 'entregado', 'cancelado'];
  const estadoFinal = estadosPermitidos.includes(Estado) ? Estado : 'pendiente';
  
  console.log(" Creando venta modelo con estado:", estadoFinal);
  
  await connection.execute(
    `INSERT INTO ventas (VentaId, PedidoClienteId, FechaVenta, Total, IVA, Estado)
     VALUES (?, ?, NOW(), ?, ?, ?)`,
    [VentaId, PedidoClienteId, Total, IVA, estadoFinal]
  );

  return getVentaByIdModel(VentaId);
};

// Verificar si ya existe una venta para un pedido
export const existeVentaParaPedidoModel = async (pedidoClienteId) => {
  const connection = await connectDB();
  const [rows] = await connection.execute(
    "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
    [pedidoClienteId]
  );
  return rows.length > 0;
};

export const getVentaByPedidoIdModel = async (pedidoClienteId) => {
  const connection = await connectDB();
  try {
    const [rows] = await connection.execute(
      `SELECT v.*, u.NombreCompleto AS NombreCliente
       FROM ventas v
       LEFT JOIN pedidosclientes pc ON v.PedidoClienteId = pc.PedidoClienteId
       LEFT JOIN usuarios u ON pc.ClienteId = u.CedulaId
       WHERE v.PedidoClienteId = ?`,
      [pedidoClienteId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("❌ Error en getVentaByPedidoIdModel:", error);
    throw error;
  } finally {
    connection.release?.();
  }
};