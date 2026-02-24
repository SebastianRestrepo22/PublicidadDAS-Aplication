// src/controllers/ventas.controller.js
import { dbPool } from "../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import {
  getAllVentasModel,
  getVentaByIdModel,
  anularVentaModel,
  existeVentaParaPedidoModel
} from "../models/venta.models.js";
import {
  getDetalleVentaByVentaIdModel
} from "../models/detalleVentas.models.js";

export const getVentas = async (req, res) => {
  try {
    const ventas = await getAllVentasModel();
    for (const venta of ventas) {
      venta.detalle = await getDetalleVentaByVentaIdModel(venta.VentaId);
    }
    res.status(200).json(ventas);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

export const getVentaById = async (req, res) => {
  try {
    const venta = await getVentaByIdModel(req.params.id);
    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }
    venta.detalle = await getDetalleVentaByVentaIdModel(req.params.id);
    res.status(200).json(venta);
  } catch (error) {
    console.error("Error al obtener venta:", error);
    res.status(500).json({ error: "Error al obtener venta" });
  }
};

// ✅ CORREGIDO: Esta función ahora usa correctamente PedidoClienteId
export const createVentaDesdePedido = async (req, res) => {
  try {
    const { PedidoClienteId, UsuarioVendedorId } = req.body;
    
    console.log('📦 [API] createVentaDesdePedido recibido:', { PedidoClienteId, UsuarioVendedorId });

    if (!PedidoClienteId) {
      return res.status(400).json({ error: "PedidoClienteId es obligatorio" });
    }

    // UsuarioVendedorId es opcional
    if (!UsuarioVendedorId) {
      console.warn('⚠️ [API] UsuarioVendedorId no proporcionado');
    }

    // Llamar a la función interna que ya tiene toda la lógica
    const resultado = await crearVentaDesdePedidoId(PedidoClienteId, UsuarioVendedorId);

    if (resultado.alreadyExists) {
      return res.status(400).json({ 
        error: "Ya existe una venta para este pedido",
        ventaId: resultado.VentaId 
      });
    }

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente desde el pedido",
      venta: resultado.venta,
      VentaId: resultado.VentaId
    });

  } catch (error) {
    console.error("❌ Error en createVentaDesdePedido:", error);
    res.status(500).json({ error: error.message || "Error al crear venta desde pedido" });
  }
};

export const createVentaManual = async (req, res) => {
  let connection;
  try {
    let ventaData;
    
    // Verificar si los datos vienen en req.body (JSON) o en req.body.ventaData (FormData)
    if (req.body.ventaData) {
      ventaData = JSON.parse(req.body.ventaData);
      console.log("📦 Datos desde FormData:", ventaData);
    } else {
      ventaData = req.body;
      console.log("📦 Datos desde JSON:", ventaData);
    }

    const {
      ClienteId, ClienteNombre, ClienteTelefono, ClienteCorreo,
      UsuarioVendedorId, Subtotal, IVA, Total, detalles
    } = ventaData;

    if (!UsuarioVendedorId) {
      return res.status(400).json({ error: "UsuarioVendedorId es obligatorio" });
    }
    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ error: "Debe incluir al menos un detalle" });
    }

    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const VentaId = uuidv4();

    await connection.execute(
      `INSERT INTO ventas (
        VentaId, Origen, ClienteId, ClienteNombre, ClienteTelefono,
        ClienteCorreo, UsuarioVendedorId, FechaVenta, Subtotal, IVA, Total, Estado
      ) VALUES (?, 'manual', ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 'pagado')`,
      [
        VentaId, 
        ClienteId || null, 
        ClienteNombre || null,
        ClienteTelefono || null, 
        ClienteCorreo || null,
        UsuarioVendedorId, 
        Subtotal || 0, 
        IVA || 0, 
        Total || 0
      ]
    );

    for (const detalle of detalles) {
      const DetalleVentaId = uuidv4();
      const subtotalDetalle = (detalle.Cantidad || 0) * (detalle.PrecioUnitario || 0);

      await connection.execute(
        `INSERT INTO detalleventas (
          DetalleVentaId, VentaId, TipoItem, ProductoId, ServicioId,
          ServicioTamanoId, NombreSnapshot, Cantidad, PrecioUnitario,
          Descuento, Subtotal, ColorId, DescripcionPersonalizada, UrlImagenPersonalizada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DetalleVentaId, 
          VentaId, 
          detalle.TipoItem || 'producto',
          detalle.ProductoId || null, 
          detalle.ServicioId || null,
          detalle.ServicioTamanoId || null, 
          detalle.NombreSnapshot || '',
          detalle.Cantidad || 1, 
          detalle.PrecioUnitario || 0,
          detalle.Descuento || 0, 
          subtotalDetalle,
          detalle.ColorId || null, 
          detalle.DescripcionPersonalizada || null,
          detalle.UrlImagenPersonalizada || null
        ]
      );
    }

    await connection.commit();

    const ventaCreada = await getVentaByIdModel(VentaId);
    ventaCreada.detalle = await getDetalleVentaByVentaIdModel(VentaId);

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente",
      venta: ventaCreada
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en createVentaManual:", error);
    res.status(500).json({ error: error.message || "Error al crear venta" });
  } finally {
    if (connection) connection.release();
  }
};

export const anularVenta = async (req, res) => {
  const { id } = req.params;
  try {
    const venta = await getVentaByIdModel(id);
    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }
    if (venta.Estado === 'anulado') {
      return res.status(400).json({ error: "La venta ya está anulada" });
    }
    
    const result = await anularVentaModel(id);
    if (result.success) {
      const ventaAnulada = await getVentaByIdModel(id);
      ventaAnulada.detalle = await getDetalleVentaByVentaIdModel(id);
      res.status(200).json({
        success: true,
        message: "Venta anulada exitosamente",
        venta: ventaAnulada
      });
    } else {
      res.status(500).json({ error: result.message || "Error al anular venta" });
    }
  } catch (error) {
    console.error("Error al anular venta:", error);
    res.status(500).json({ error: "Error al anular venta" });
  }
};

export const getDetallesByVenta = async (req, res) => {
  try {
    const detalles = await getDetalleVentaByVentaIdModel(req.params.id);
    res.status(200).json(detalles);
  } catch (error) {
    console.error("Error al obtener detalles:", error);
    res.status(500).json({ error: "Error al obtener detalles" });
  }
};

// ✅ FUNCIÓN PRINCIPAL PARA CREAR VENTA DESDE PEDIDO (usada internamente)
export const crearVentaDesdePedidoId = async (PedidoClienteId, UsuarioVendedorId = null) => {
  let connection;
  try {
    console.log('🎯 [VENTAS] ===== INICIANDO CREACIÓN DE VENTA DESDE PEDIDO =====');
    console.log('📦 PedidoClienteId:', PedidoClienteId);
    console.log('👤 UsuarioVendedorId:', UsuarioVendedorId);
    
    if (!PedidoClienteId) throw new Error("PedidoClienteId es obligatorio");
    
    connection = await dbPool.getConnection();
    await connection.beginTransaction();
    console.log('🔄 Transacción iniciada');

    // Verificar si ya existe venta
    console.log('🔍 Verificando si ya existe venta...');
    const [ventaExistente] = await connection.execute(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [PedidoClienteId]
    );
    
    if (ventaExistente.length > 0) {
      console.log('⚠️ Ya existe venta:', ventaExistente[0].VentaId);
      await connection.rollback();
      return { 
        success: false, 
        alreadyExists: true, 
        VentaId: ventaExistente[0].VentaId 
      };
    }
    
    // Obtener el pedido
    console.log('🔍 Obteniendo datos del pedido...');
    const [pedidoRows] = await connection.execute(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      console.log('❌ Pedido no encontrado');
      await connection.rollback();
      throw new Error("Pedido no encontrado");
    }
    const pedido = pedidoRows[0];
    console.log('✅ Pedido encontrado:', {
      id: pedido.PedidoClienteId,
      total: pedido.Total,
      tipoCliente: pedido.TipoCliente
    });
    
    // Obtener detalles del pedido
    console.log('🔍 Obteniendo detalles del pedido...');
    const [detallesRows] = await connection.execute(
      `SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (detallesRows.length === 0) {
      console.log('❌ El pedido no tiene detalles');
      await connection.rollback();
      throw new Error("El pedido no tiene detalles");
    }
    console.log(`✅ Encontrados ${detallesRows.length} detalles`);
    
    const VentaId = uuidv4();
    console.log('🆔 Nuevo VentaId generado:', VentaId);
    
    const subtotal = pedido.Total || 0;
    const IVA = subtotal * 0.19;
    const total = subtotal + IVA;
    
    console.log('💰 Totales calculados:', { subtotal, IVA, total });
    
    let clienteId = null;
    let clienteNombre = pedido.ClienteNombre || null;
    let clienteTelefono = pedido.ClienteTelefono || null;
    let clienteCorreo = pedido.ClienteCorreo || null;
    
    if (pedido.TipoCliente === 'registrado' && pedido.ClienteId) {
      clienteId = pedido.ClienteId;
      console.log('👤 Cliente registrado ID:', clienteId);
    }
    
    // Insertar la venta
    console.log('💾 Insertando venta en base de datos...');
    await connection.execute(
      `INSERT INTO ventas (
        VentaId, Origen, PedidoClienteId, ClienteId, ClienteNombre,
        ClienteTelefono, ClienteCorreo, UsuarioVendedorId, FechaVenta,
        Subtotal, IVA, Total, Estado
      ) VALUES (?, 'pedido', ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 'pagado')`,
      [
        VentaId, PedidoClienteId, clienteId, clienteNombre,
        clienteTelefono, clienteCorreo, UsuarioVendedorId,
        subtotal, IVA, total
      ]
    );
    console.log('✅ Venta insertada correctamente');
    
    // Insertar detalles
    console.log('💾 Insertando detalles de venta...');
    for (let i = 0; i < detallesRows.length; i++) {
      const detalle = detallesRows[i];
      const DetalleVentaId = uuidv4();
      
      let tipoItem = null;
      let productoId = null;
      let servicioId = null;
      let servicioTamanoId = null;
      let nombreSnapshot = "";
      
      if (detalle.ProductoId) {
        tipoItem = 'producto';
        productoId = detalle.ProductoId;
        const [productoRows] = await connection.execute(
          "SELECT Nombre FROM productos WHERE ProductoId = ?",
          [detalle.ProductoId]
        );
        nombreSnapshot = productoRows.length > 0 ? productoRows[0].Nombre : "Producto";
      } else if (detalle.ServicioId) {
        tipoItem = 'servicio';
        servicioId = detalle.ServicioId;
        const [servicioRows] = await connection.execute(
          "SELECT Nombre FROM servicios WHERE ServicioId = ?",
          [detalle.ServicioId]
        );
        nombreSnapshot = servicioRows.length > 0 ? servicioRows[0].Nombre : "Servicio";
        
        if (detalle.Tamaño) {
          const [tamanoRows] = await connection.execute(
            "SELECT ServicioTamanoId FROM servicio_tamanos WHERE ServicioId = ? AND NombreTamano = ?",
            [detalle.ServicioId, detalle.Tamaño]
          );
          if (tamanoRows.length > 0) {
            servicioTamanoId = tamanoRows[0].ServicioTamanoId;
          }
        }
      }
      
      const subtotalDetalle = detalle.Cantidad * detalle.Precio;
      
      await connection.execute(
        `INSERT INTO detalleventas (
          DetalleVentaId, VentaId, TipoItem, ProductoId, ServicioId,
          ServicioTamanoId, NombreSnapshot, Cantidad, PrecioUnitario,
          Descuento, Subtotal, ColorId, DescripcionPersonalizada, UrlImagenPersonalizada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DetalleVentaId, VentaId, tipoItem, productoId, servicioId,
          servicioTamanoId, nombreSnapshot, detalle.Cantidad, detalle.Precio,
          detalle.Descuento || 0, subtotalDetalle, detalle.ColorId || null,
          detalle.Descripcion || null, detalle.UrlImagen || null
        ]
      );
      
      console.log(`  ✅ Detalle ${i+1} insertado: ${nombreSnapshot} x ${detalle.Cantidad}`);
    }
    
    await connection.commit();
    console.log('✅ Transacción completada exitosamente');
    
    const ventaCreada = await getVentaByIdModel(VentaId);
    
    console.log('🎉 [VENTAS] Venta creada exitosamente:', {
      VentaId,
      total,
      estado: 'pagado'
    });
    
    return {
      success: true,
      VentaId: VentaId,
      venta: ventaCreada,
      alreadyExists: false
    };
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ [VENTAS] ERROR EN crearVentaDesdePedidoId:');
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Stack:', error.stack);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};