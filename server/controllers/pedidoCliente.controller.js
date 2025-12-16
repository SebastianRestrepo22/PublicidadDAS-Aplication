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
import { crearProduccionDesdePedido } from "../services/produccion.service.js"; // ✅ Solo esta función se usa
import QRCode from "qrcode";

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
      metodo_pago: finalMetodoPago,
      voucher: finalVoucher,
      nombre_recibe: finalNombreRecibe,
      telefono_entrega: finalTelefonoEntrega,
      direccion_entrega: finalDireccionEntrega,
      Estado: Estado || "Pendiente" // ✅ Asegurar estado inicial
    });

    if (Array.isArray(detalle) && detalle.length > 0) {
      for (let d of detalle) {
        const ProductoServicioId = d.ProductoServicioId?.toString().trim();
        await createDetallePedidoModel({
          PedidoClienteId: nuevoPedido.PedidoClienteId,
          ProductoServicioId,
          Cantidad: d.Cantidad,
          Alto: d.Alto,
          Ancho: d.Ancho,
          Descripcion: d.Descripcion,
          UrlImagen: d.UrlImagen
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
      await sendVoucherEmail(
        cliente.CorreoElectronico,
        cliente.NombreCompleto || `${cliente.Nombre} ${cliente.Apellido}`,
        nuevoPedido.PedidoClienteId,
        nuevoPedido.Total
      );
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

    // ✅ CREAR PRODUCCIÓN AUTOMÁTICA AL CAMBIAR A "en_produccion"
    if (Estado === "en_produccion" && estadoAnterior !== "en_produccion") {
      try {
        await crearProduccionDesdePedido(id); // ✅ Usar función importada correctamente
        console.log(`✅ Producción automática creada para el pedido ${id}`);
      } catch (err) {
        console.error("⚠️ Error al crear producción automática:", err.message);
        // No se rechaza la actualización del pedido
      }
    }

    if (Estado === "terminado" && estadoAnterior !== "terminado") {
      try {
        await crearVentaDesdePedidoId(id); // ¡Usa el ID del pedido!
        console.log(`Venta creada automáticamente para el pedido ${id}`);
      } catch (err) {
        console.error("Error al crear venta desde pedido:", err.message);
        // No detener la actualización del pedido
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

import { crearVentaDesdePedidoId } from "./ventas.controller.js";
