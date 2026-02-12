// controllers/ventas.controller.js
import connectDB from "../lib/db.js";
import { v4 as uuidv4 } from "uuid";
// controllers/ventas.controller.js - Actualiza el import
import {
  getAllVentasModel,
  getVentaByIdModel,
  createVentaModel,
  updateVentaModel,
  deleteVentaModel,
  existeVentaParaPedidoModel,
  getVentaByPedidoIdModel
} from "../models/venta.models.js";
import {
  getDetalleVentaByVentaIdModel,
  createDetalleVentaModel
} from "../models/detalleVentas.models.js";

/**
 * Obtener todas las ventas con sus detalles
 */
export const getVentas = async (req, res) => {
  try {
    const ventas = await getAllVentasModel();

    for (const v of ventas) {
      v.detalle = await getDetalleVentaByVentaIdModel(v.VentaId);
    }

    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

/**
 * Obtener venta por ID con sus detalles
 */
export const getVentaById = async (req, res) => {
  try {
    const venta = await getVentaByIdModel(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });

    venta.detalle = await getDetalleVentaByVentaIdModel(req.params.id);
    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ error: "Error al obtener venta" });
  }
};

/**
 * Crear venta automáticamente desde pedido
 */
export const crearVentaDesdePedidoId = async (PedidoClienteId) => {
  if (!PedidoClienteId) throw new Error("PedidoClienteId es obligatorio");

  const pool = await connectDB();
  const connection = await pool.getConnection();

  try {
    console.log("🔄 Creando venta para pedido:", PedidoClienteId);

    // Verificar si ya existe venta
    const [ventaCheck] = await connection.execute(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [PedidoClienteId]
    );
    if (ventaCheck.length > 0) {
      connection.release();
      console.log("ℹ️ Venta ya existente:", ventaCheck[0].VentaId);
      return {
        success: true,
        alreadyExists: true,
        VentaId: ventaCheck[0].VentaId
      };
    }

    // Obtener pedido
    const [pedidoRows] = await connection.execute(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      connection.release();
      throw new Error("Pedido no encontrado");
    }

    const pedido = pedidoRows[0];

    await connection.beginTransaction();

    // Obtener detalles del pedido
    const [detallesRows] = await connection.execute(
      `SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );

    if (detallesRows.length === 0) {
      await connection.rollback();
      connection.release();
      throw new Error("El pedido no tiene detalles");
    }

    // CREAR VENTA
    const VentaId = uuidv4();
    const IVA = pedido.Total * 0.19;
    
    let estadoVenta = pedido.Estado;
    
    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['pendiente', 'aprobado', 'entregado', 'cancelado'];
    if (!estadosPermitidos.includes(estadoVenta)) {
      console.warn(`⚠️ Estado del pedido no válido para venta: ${estadoVenta}, usando 'pendiente'`);
      estadoVenta = 'pendiente';
    }

    console.log("📊 Creando venta con:", {
      VentaId,
      Total: pedido.Total,
      IVA,
      EstadoPedido: pedido.Estado,
      EstadoVenta: estadoVenta,
      DetallesCount: detallesRows.length
    });

    await connection.execute(
      `INSERT INTO ventas (VentaId, PedidoClienteId, FechaVenta, Total, IVA, Estado)
       VALUES (?, ?, NOW(), ?, ?, ?)`,
      [VentaId, PedidoClienteId, pedido.Total, IVA, estadoVenta]
    );

    console.log("✅ Venta creada con estado:", estadoVenta);

    // Crear detalles de venta - CON LOS NUEVOS CAMPOS
    let detallesCreados = 0;
    for (const detalle of detallesRows) {
      let nombreBase = "";
      let esProducto = false;
      
      // Determinar si es producto o servicio y obtener nombre base
      if (detalle.ProductoId) {
        esProducto = true;
        const [producto] = await connection.execute(
          "SELECT Nombre FROM productos WHERE ProductoId = ? LIMIT 1",
          [detalle.ProductoId]
        );
        nombreBase = producto.length > 0 ? producto[0].Nombre : "Producto";
      } else if (detalle.ServicioId) {
        const [servicio] = await connection.execute(
          "SELECT Nombre FROM servicios WHERE ServicioId = ? LIMIT 1",
          [detalle.ServicioId]
        );
        nombreBase = servicio.length > 0 ? servicio[0].Nombre : "Servicio";
      }

      const subtotal = detalle.Cantidad * detalle.Precio;

      // ✅ CORRECCIÓN CRÍTICA: Tamaño SOLO para servicios, NULL para productos
      const tamañoParaInsertar = detalle.ServicioId ? (detalle.Tamaño || 'Mediana') : null;

      console.log("📏 Procesando detalle:", {
        tipo: esProducto ? "Producto" : "Servicio",
        tamañoOriginal: detalle.Tamaño,
        tamañoFinal: tamañoParaInsertar,
        productoId: detalle.ProductoId,
        servicioId: detalle.ServicioId
      });

      // ✅ INSERCIÓN CORREGIDA - INCLUYENDO LOS NUEVOS CAMPOS
      await connection.execute(
        `INSERT INTO detalleventas 
         (DetalleVentaId, VentaId, ProductoId, ServicioId, Nombre, 
          Cantidad, PrecioUnitario, Descuento, Subtotal, Tamaño, 
          Descripcion, ColorId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          VentaId,
          detalle.ProductoId || null,
          detalle.ServicioId || null,
          nombreBase, // Nombre base del producto/servicio
          detalle.Cantidad,
          detalle.Precio,
          0, // Descuento - valor por defecto
          subtotal,
          tamañoParaInsertar, // ← CORREGIDO: NULL para productos, valor para servicios
          // Descripcion: SOLO para servicios, null para productos
          detalle.ServicioId ? (detalle.Descripcion || "") : null,
          // ColorId: SOLO para productos, null para servicios
          detalle.ProductoId ? (detalle.ColorId || null) : null
        ]
      );

      detallesCreados++;
      console.log(`✅ Detalle ${detallesCreados} creado:`, {
        tipo: esProducto ? "Producto" : "Servicio",
        nombre: nombreBase,
        color: detalle.ColorId || "N/A",
        descripcion: detalle.Descripcion?.substring(0, 50) || "N/A",
        tamaño: tamañoParaInsertar
      });
    }

    await connection.commit();
    connection.release();

    console.log(`🎉 ${detallesCreados} detalles de venta creados exitosamente`);

    return {
      success: true,
      VentaId: VentaId,
      estado: estadoVenta,
      detalles: detallesCreados,
      message: "Venta creada exitosamente",
      alreadyExists: false
    };

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("❌ Error al crear venta desde pedido:", error.message);
    console.error("Stack trace:", error.stack);
    throw error;
  }
};

// Esta función ya está bien, pero la dejamos igual
export const createVentaDesdePedido = async (req, res) => {
  const { PedidoClienteId } = req.body;
  if (!PedidoClienteId) {
    return res.status(400).json({ error: "PedidoClienteId es obligatorio" });
  }

  try {
    const venta = await crearVentaDesdePedidoId(PedidoClienteId);
    res.status(201).json(venta);
  } catch (error) {
    console.error("Error al crear venta desde pedido:", error.message);
    res.status(500).json({ error: error.message || "Error al crear venta" });
  }
};

/**
 * Actualizar venta (solo estado y datos de pago)
 */
export const updateVenta = async (req, res) => {
  const { id } = req.params;
  const { Estado, Total, IVA } = req.body;

  try {
    const ventaActual = await getVentaByIdModel(id);
    if (!ventaActual) return res.status(404).json({ error: "Venta no encontrada" });

    // Validar estado con los nuevos valores
    const estadosPermitidos = ['pendiente', 'aprobado', 'entregado', 'cancelado'];
    const estadoValidado = estadosPermitidos.includes(Estado) ? Estado : ventaActual.Estado;

    await updateVentaModel(id, { Estado: estadoValidado, Total, IVA });

    const ventaActualizada = await getVentaByIdModel(id);
    ventaActualizada.detalle = await getDetalleVentaByVentaIdModel(id);

    res.status(200).json(ventaActualizada);
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    res.status(500).json({ error: "Error al actualizar venta" });
  }
};

/**
 * Eliminar venta y sus detalles (CORREGIDO)
 */
export const deleteVenta = async (req, res) => {
  const pool = await connectDB();
  const connection = await pool.getConnection();
  const { id } = req.params;

  try {
    await connection.beginTransaction();

    await connection.execute("DELETE FROM detalleventas WHERE VentaId = ?", [id]);
    const [result] = await connection.execute("DELETE FROM ventas WHERE VentaId = ?", [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    await connection.commit();
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ error: "Error al eliminar venta" });
  } finally {
    connection.release();
  }
};