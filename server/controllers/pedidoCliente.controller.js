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


// GET /pedidos-clientes → público o protegido según tu diseño
export const getPedidosClientes = async (req, res) => {
  try {
    const pedidos = await getAllPedidosClientesModel();

    for (let p of pedidos) {
      p.detalle = await getDetallePedidoByPedidoIdModel(p.PedidoClienteId);
    }

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
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


export const createPedidoCliente = async (req, res) => {
  try {
    const {
      ClienteId,
      FechaRegistro,
      Total,
      Estado,
      detalle,
      metodo_pago,
      voucher,
      nombre_recibe,
      telefono_entrega,
      direccion_entrega
    } = req.body;

    const cleanClienteId = ClienteId?.toString().trim();
    if (!cleanClienteId) {
      return res.status(400).json({ error: "ClienteId es obligatorio" });
    }

    // OBTENER COLORES DE LA BASE DE DATOS - usando el modelo correcto
    let colores = [];
    try {
      colores = await getAllColoresDB(); // ← Nombre correcto
      console.log(`✅ Obtenidos ${colores.length} colores de la base de datos`);
    } catch (colorError) {
      console.warn("⚠️ No se pudieron obtener colores:", colorError.message);
    }

    // Crear un mapa rápido de nombre a ColorId
    const colorNameToId = {};
    colores.forEach(color => {
      colorNameToId[color.Nombre.toLowerCase()] = color.ColorId;
    });

    let finalMetodoPago = metodo_pago || "transferencia";
    let finalVoucher = voucher || null;
    let finalNombreRecibe = null;
    let finalTelefonoEntrega = null;
    let finalDireccionEntrega = null;

    if (finalMetodoPago === "contra_entrega") {
      if (!nombre_recibe || !telefono_entrega || !direccion_entrega) {
        return res.status(400).json({ error: "Datos de entrega son obligatorios para contra entrega" });
      }
      finalNombreRecibe = nombre_recibe;
      finalTelefonoEntrega = telefono_entrega;
      finalDireccionEntrega = direccion_entrega;
    }

    const nuevoPedido = await createPedidoClienteModel({
      ClienteId: cleanClienteId,
      FechaRegistro,
      Total,
      MetodoPago: finalMetodoPago,
      Voucher: finalVoucher,
      NombreRecibe: finalNombreRecibe,
      TelefonoEntrega: finalTelefonoEntrega,
      DireccionEntrega: finalDireccionEntrega,
      Estado: Estado || "pendiente"
    });

    if (Array.isArray(detalle) && detalle.length > 0) {
      for (let d of detalle) {
        const ProductoId = d.ProductoId && d.ProductoId.trim() ? d.ProductoId.trim() : null;
        const ServicioId = d.ServicioId && d.ServicioId.trim() ? d.ServicioId.trim() : null;

        if (!ProductoId && !ServicioId) {
          return res.status(400).json({
            error: "Cada ítem del detalle debe tener 'ProductoId' o 'ServicioId' válido"
          });
        }

        if (ProductoId && ServicioId) {
          return res.status(400).json({
            error: "Un ítem no puede tener ProductoId y ServicioId simultáneamente"
          });
        }

        const Tamaño = ServicioId ? (d.Tamaño || "Mediana") : null;

        // CONVERTIR COLOR SI ES NECESARIO
        let finalColorId = null;

        if (d.ColorId) {
          // Validar si es UUID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

          if (uuidRegex.test(d.ColorId)) {
            // Ya es un UUID válido
            finalColorId = d.ColorId;
            console.log(`✅ ColorId es UUID válido: ${d.ColorId}`);
          } else {
            // Es un nombre, buscar el UUID correspondiente
            const colorNameLower = d.ColorId.toLowerCase();
            finalColorId = colorNameToId[colorNameLower];

            if (finalColorId) {
              console.log(`✅ Color convertido: "${d.ColorId}" → ${finalColorId}`);
            } else {
              console.warn(`⚠️ No se encontró ColorId para: "${d.ColorId}"`);

              // Intentar buscar color que contenga el texto
              const matchingColor = colores.find(c =>
                c.Nombre.toLowerCase().includes(colorNameLower) ||
                colorNameLower.includes(c.Nombre.toLowerCase())
              );

              if (matchingColor) {
                finalColorId = matchingColor.ColorId;
                console.log(`🔄 Color encontrado por aproximación: "${d.ColorId}" → ${matchingColor.Nombre} (${finalColorId})`);
              }
            }
          }
        }

        console.log("🎨 Procesando color:", {
          original: d.ColorId,
          final: finalColorId,
          esUUID: finalColorId?.includes('-')
        });

        await createDetallePedidoModel({
          PedidoClienteId: nuevoPedido.PedidoClienteId,
          ProductoId,
          ServicioId,
          Cantidad: d.Cantidad || 1,
          Tamaño,
          Descripcion: d.Descripcion || "",
          UrlImagen: d.UrlImagen || null,
          Precio: d.Precio || 0,
          ColorId: finalColorId
        });
      }
    }


    let qrCodeBase64 = null;
    if (finalMetodoPago === "transferencia") {
      const cuentaBancolombia = "24079288086";
      const monto = Math.round(nuevoPedido.Total);
      const concepto = `PEDIDO-${nuevoPedido.PedidoClienteId}`;
      const qrData = `https://www.bancolombia.com/pagosmovil?cuenta=${cuentaBancolombia}&monto=${monto}&concepto=${encodeURIComponent(concepto)}`;

      try {
        qrCodeBase64 = await QRCode.toDataURL(qrData, { errorCorrectionLevel: "H" });
      } catch (qrError) {
        console.warn("No se pudo generar el QR:", qrError.message);
      }
    }

    let cliente = null;
    try {
      cliente = await getClienteByIdModel(cleanClienteId);
    } catch (err) {
      console.warn("No se pudo cargar el cliente para el email:", err.message);
    }

    if (cliente && cliente.CorreoElectronico && finalMetodoPago === "transferencia") {
      try {
        await sendVoucherEmail(
          cliente.CorreoElectronico,
          cliente.NombreCompleto || `${cliente.Nombre} ${cliente.Apellido}`,
          nuevoPedido.PedidoClienteId,
          nuevoPedido.Total
        );
      } catch (emailError) {
        console.warn("No se pudo enviar el email:", emailError.message);
      }
    }

    const pedidoCreado = {
      ...nuevoPedido,
      detalle: await getDetallePedidoByPedidoIdModel(nuevoPedido.PedidoClienteId)
    };

    res.status(201).json({
      ...pedidoCreado,
      qrCode: qrCodeBase64
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};

// controllers/pedidoCliente.controller.js - Actualiza la parte de crear venta
export const updatePedidoCliente = async (req, res) => {
  if (req.body.FechaRegistro) {
    req.body.FechaRegistro = req.body.FechaRegistro.split("T")[0];
  }

  try {
    const { id } = req.params;
    const { Estado, ...otrosCampos } = req.body;

    const pedidoActual = await getPedidoClienteByIdModel(id);
    if (!pedidoActual) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const estadoAnterior = pedidoActual.Estado;

    // Actualizar el pedido
    const result = await updatePedidoClienteModel(id, { Estado, ...otrosCampos });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // ✅ CREAR VENTA cuando pasa a "aprobado"
    let ventaCreadaInfo = null;
    if (Estado === "aprobado" && estadoAnterior !== "aprobado") {
      try {
        console.log(`🔄 Intentando crear venta para pedido ${id}...`);
        
        // Usa la función del controller de ventas
        const resultadoVenta = await crearVentaDesdePedidoId(id);
        
        if (resultadoVenta.success) {
          if (resultadoVenta.alreadyExists) {
            console.log(`ℹ️ Venta ya existente: ${resultadoVenta.VentaId}`);
          } else {
            console.log(`✅ Venta creada: ${resultadoVenta.venta?.VentaId || resultadoVenta.VentaId}`);
          }
          ventaCreadaInfo = resultadoVenta.venta || { VentaId: resultadoVenta.VentaId };
        }
      } catch (err) {
        console.error("❌ Error al crear venta desde pedido:", err.message);
        ventaCreadaInfo = { error: err.message };
      }
    }

    // Enviar correo si el estado cambió
    if (Estado && Estado !== estadoAnterior) {
      const cliente = await getClienteByIdModel(pedidoActual.ClienteId);
      if (cliente && cliente.CorreoElectronico) {
        await sendPedidoEstadoEmail(
          cliente.CorreoElectronico,
          cliente.NombreCompleto || `${cliente.Nombre} ${cliente.Apellido}`,
          id,
          Estado,
          ""
        );
      }
    }

    const pedidoActualizado = await getPedidoClienteByIdModel(id);
    pedidoActualizado.detalle = await getDetallePedidoByPedidoIdModel(id);
    
    // Agregar información de venta creada
    if (ventaCreadaInfo && !ventaCreadaInfo.error) {
      pedidoActualizado.ventaCreada = {
        VentaId: ventaCreadaInfo.VentaId || ventaCreadaInfo.ventaId,
        FechaVenta: ventaCreadaInfo.FechaVenta || new Date().toISOString().split('T')[0],
        TotalVenta: ventaCreadaInfo.Total || pedidoActual.Total,
        EstadoVenta: ventaCreadaInfo.Estado || 'Completada'
      };
    }
    
    res.status(200).json(pedidoActualizado);
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar pedido" });
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