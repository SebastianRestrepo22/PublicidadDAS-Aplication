// src/controllers/pedidoCliente.controller.js
import { sendPedidoEstadoEmail, sendVoucherEmail } from "../utils/email.js";
import {
  getAllPedidosClientesModel,
  getPedidoClienteByIdModel,
  createPedidoClienteModel,
  updatePedidoClienteModel,
  deletePedidoClienteModel,
  getClienteByIdModel
} from "../models/pedidoCliente.model.js";
import {
  createDetallePedidoModel,
  getDetallePedidoByPedidoIdModel,
  deleteDetallePedidoModel
} from "../models/detallePedidoCliente.model.js";
import { crearVentaDesdePedidoId } from "./ventas.controller.js";
import QRCode from "qrcode";
import { getAllColoresDB } from "../models/color.model.js";
import { v4 as uuidv4 } from "uuid";

// ========================================
// ✅ CREAR PEDIDO - MANEJA FORMDATA
// ========================================
// ========================================
// ✅ CREAR PEDIDO - MANEJA FORMDATA Y JSON PURO
// ========================================
export const createPedidoCliente = async (req, res) => {
  let nuevoPedido = null;

  try {
    console.log('🔍 [CONTROLLER] Creando pedido...');
    console.log('📁 Archivo recibido:', req.file);
    console.log('📦 Body recibido:', req.body);

    // 🔄 Detectar si viene como FormData (con archivo) o JSON puro
    let pedidoData;
    if (typeof req.body.pedido === 'string') {
      // Caso 1: FormData con archivo → req.body.pedido es string JSON
      try {
        pedidoData = JSON.parse(req.body.pedido);
      } catch (error) {
        console.error('❌ Error parseando JSON del pedido (FormData):', error);
        return res.status(400).json({
          error: 'Datos del pedido inválidos',
          details: error.message
        });
      }
    } else {
      // Caso 2: JSON puro (sin archivo) → req.body es el objeto directamente
      pedidoData = req.body;
    }

    const {
      ClienteId,
      FechaRegistro,
      Total,
      MetodoPago = "transferencia",
      Voucher = null,
      NombreRecibe = null,
      TelefonoEntrega = null,
      DireccionEntrega = null,
      Estado = "pendiente",
      TipoCliente = "registrado",
      ClienteNombre = null,
      ClienteTelefono = null,
      ClienteCorreo = null,
      detalle = []
    } = pedidoData;

    // Validación básica
    if (Total === undefined || Total <= 0) {
      return res.status(400).json({ error: "Total inválido" });
    }
    if (!Array.isArray(detalle) || detalle.length === 0) {
      return res.status(400).json({ error: "El pedido debe contener al menos un producto" });
    }

    // Construir URL del voucher si existe
    let voucherUrl = null;
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      voucherUrl = `${protocol}://${host}/uploads/vouchers/${req.file.filename}`;
      console.log('✅ URL del voucher:', voucherUrl);
    }

    // Procesar fecha
    const fechaProcesada = FechaRegistro
      ? FechaRegistro.split("T")[0]
      : new Date().toISOString().split("T")[0];

    nuevoPedido = await createPedidoClienteModel({
      ClienteId: ClienteId || null,
      FechaRegistro: fechaProcesada,
      Total: parseFloat(Total),
      MetodoPago,
      Voucher: voucherUrl || null,
      NombreRecibe: NombreRecibe || null,
      TelefonoEntrega: TelefonoEntrega || null,
      DireccionEntrega: DireccionEntrega || null,
      Estado,
      TipoCliente,
      ClienteNombre: ClienteNombre || null,
      ClienteTelefono: ClienteTelefono || null,
      ClienteCorreo: ClienteCorreo || null
    });

    console.log("✅ Pedido creado:", nuevoPedido.PedidoClienteId);

    // Crear detalles del pedido
    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];

      console.log(`📝 Procesando detalle ${i + 1}:`, item);

      const ProductoId = item.ProductoId || null;
      const ServicioId = item.ServicioId || null;
      const Cantidad = item.Cantidad ? parseInt(item.Cantidad) : 1;
      const Precio = item.PrecioUnitario || item.Precio || 0;
      const ColorId = item.ColorId || null;
      const Tamaño = ServicioId
        ? (item.Tamaño ?? item.DimensionesId ?? "Mediana")
        : null;
      const Descripcion = item.Descripcion || null;
      const UrlImagen = item.UrlImagen ? item.UrlImagen.trim() : null;
      const Subtotal = parseFloat((Cantidad * Precio).toFixed(2));

      // Validar campos requeridos
      if (!ProductoId && !ServicioId) {
        throw new Error(`Detalle ${i + 1}: Se requiere ProductoId o ServicioId`);
      }
      if (Cantidad <= 0) {
        throw new Error(`Detalle ${i + 1}: Cantidad inválida (${Cantidad})`);
      }
      if (Precio <= 0) {
        throw new Error(`Detalle ${i + 1}: Precio inválido (${Precio})`);
      }

      await createDetallePedidoModel({
        DetallePedidoClienteId: uuidv4(),
        PedidoClienteId: nuevoPedido.PedidoClienteId,
        ProductoId,
        ServicioId,
        Cantidad,
        Precio,
        ColorId,
        Tamaño,
        Descripcion,
        UrlImagen,
        Subtotal
      });

      console.log(`✅ Detalle ${i + 1} creado - Subtotal: $${Subtotal}`);
    }

    // Obtener pedido completo con detalles
    const pedidoCompleto = await getPedidoClienteByIdModel(nuevoPedido.PedidoClienteId);
    pedidoCompleto.detalle = await getDetallePedidoByPedidoIdModel(nuevoPedido.PedidoClienteId);

    // Enviar email de confirmación
    if (pedidoCompleto.ClienteId) {
      const cliente = await getClienteByIdModel(pedidoCompleto.ClienteId);
      if (cliente?.CorreoElectronico) {
        await sendPedidoEstadoEmail(
          cliente.CorreoElectronico,
          cliente.NombreCompleto || `${cliente.Nombre} ${cliente.Apellido}`,
          nuevoPedido.PedidoClienteId,
          "pendiente",
          "Tu pedido ha sido recibido y está en proceso"
        );
      }
    }

    console.log("🎉 Pedido completado exitosamente");
    res.status(201).json(pedidoCompleto);
  } catch (error) {
    console.error("❌ Error al crear pedido:", error.message);

    // Limpiar pedido huérfano
    // Limpiar pedido huérfano
if (nuevoPedido?.PedidoClienteId) {
  try {
    console.log(`🗑️  Eliminando detalles del pedido huérfano: ${nuevoPedido.PedidoClienteId}`);
    // Primero: eliminar detalles
    await dbPool.execute(
      "DELETE FROM detallepedidosclientes WHERE PedidoClienteId = ?",
      [nuevoPedido.PedidoClienteId]
    );
    
    console.log(`🗑️  Eliminando pedido huérfano: ${nuevoPedido.PedidoClienteId}`);
    // Luego: eliminar pedido
    await deletePedidoClienteModel(nuevoPedido.PedidoClienteId);
    console.log(`✅ Pedido huérfano eliminado`);
  } catch (cleanupError) {
    console.error("❌ Error limpiando pedido huérfano:", cleanupError);
  }
}

    // Si hay un archivo subido, eliminarlo
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error eliminando archivo:', err);
      });
    }

    res.status(500).json({
      error: "Error al crear el pedido",
      message: error.message
    });
  }
};

// ========================================
// ✅ ACTUALIZAR PEDIDO - MANEJA FORMDATA
// ========================================
export const updatePedidoCliente = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    console.log('🔍 [CONTROLLER] Actualizando pedido...');
    console.log('📁 Archivo recibido:', req.file);
    console.log('📦 Body recibido:', updates);

    // Si se subió un nuevo comprobante
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      const voucherUrl = `${protocol}://${host}/uploads/pedidos/${req.file.filename}`;
      updates.Voucher = voucherUrl;
    }

    // Validar que al menos haya algo para actualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }

    // 1. Obtener el estado actual del pedido (antes de actualizar)
    const pedidoActual = await getPedidoClienteByIdModel(id);
    if (!pedidoActual) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }

    // 2. Actualizar el pedido
    const result = await updatePedidoClienteModel(id, updates);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado.' });
    }

    // 3. Obtener el pedido actualizado
    const updated = await getPedidoClienteByIdModel(id);

    // 4. ✅ SI EL ESTADO ES "aprobado", CREAR VENTA AUTOMÁTICAMENTE
    if (updated.Estado === 'aprobado') {
      try {
        console.log('✅ Estado "aprobado" detectado. Creando venta...');
        const resultadoVenta = await crearVentaDesdePedidoId(id);
        console.log('✅ Resultado de creación de venta:', resultadoVenta);
        
        // Opcional: incluir info de venta en la respuesta
        updated.ventaCreada = resultadoVenta;
      } catch (ventaError) {
        console.error('⚠️ Error al crear venta automáticamente:', ventaError.message);
        // Nota: No lanzamos error aquí para no romper la actualización del pedido
        // El pedido se actualiza igual, pero la venta falla (se puede revisar logs)
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('❌ Error en updatePedidoCliente:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el pedido.',
      error: error.message 
    });
  }
};

// ========================================
// RESTO DE FUNCIONES (SIN CAMBIOS)
// ========================================
export const getPedidosClientes = async (req, res) => {
  try {
    console.log('🔍 [CONTROLLER] Obteniendo todos los pedidos...');
    
    const pedidos = await getAllPedidosClientesModel();
    
    console.log(`✅ [CONTROLLER] Pedidos obtenidos: ${pedidos.length}`);
    
    // 🔴 Manejar errores al obtener detalles individualmente
    for (let p of pedidos) {
      try {
        p.detalle = await getDetallePedidoByPedidoIdModel(p.PedidoClienteId);
        console.log(`   📋 Pedido ${p.PedidoClienteId}: ${p.detalle.length} detalles`);
      } catch (detalleError) {
        console.error(`   ⚠️ Error obteniendo detalles para pedido ${p.PedidoClienteId}:`, detalleError.message);
        p.detalle = []; // Asignar array vacío si hay error
      }
    }

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("❌ [CONTROLLER] Error al obtener pedidos:", error);
    res.status(500).json({ 
      error: "Error al obtener pedidos",
      details: error.message,
      sqlError: error.code
    });
  }
};

export const getPedidoClienteById = async (req, res) => {
  try {
    const pedido = await getPedidoClienteByIdModel(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    pedido.detalle = await getDetallePedidoByPedidoIdModel(req.params.id);
    res.status(200).json(pedido);
  } catch (error) {
    console.error("Error al obtener pedido:", error);
    res.status(500).json({ error: "Error al obtener pedido" });
  }
};

export const deletePedidoCliente = async (req, res) => {
  try {
    const detalles = await getDetallePedidoByPedidoIdModel(req.params.id);
    for (let d of detalles) {
      await deleteDetallePedidoModel(d.DetallePedidoClienteId);
    }
    const result = await deletePedidoClienteModel(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
};

// Solo si usas autenticación en rutas privadas
export const getMisPedidos = async (req, res) => {
  try {
    const clienteId = req.user?.CedulaId;
    if (!clienteId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    const pedidos = await getAllPedidosClientesModel();
    const pedidosDelCliente = pedidos.filter(p => p.ClienteId === clienteId);
    for (let p of pedidosDelCliente) {
      p.detalle = await getDetallePedidoByPedidoIdModel(p.PedidoClienteId);
    }
    res.status(200).json(pedidosDelCliente);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    res.status(500).json({ error: "Error al obtener tus pedidos" });
  }
};