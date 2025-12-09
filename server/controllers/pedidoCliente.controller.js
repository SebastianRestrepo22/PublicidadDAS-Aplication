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
import { QrCode } from "lucide-react";


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


/**
 * Obtener pedido por ID
 */
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
    let { ClienteId, FechaRegistro, Total, Estado, detalle } = req.body;

    console.log("CLIENTE ID RECIBIDO (crudo):", ClienteId);
    ClienteId = ClienteId?.toString().trim();
    console.log("CLIENTE ID LIMPIO:", ClienteId);
    console.log("BODY COMPLETO:", req.body);

    if (!ClienteId) {
      return res.status(400).json({ error: "ClienteId es obligatorio" });
    }

    // Crear el pedido
    const nuevoPedido = await createPedidoClienteModel({
      ClienteId,
      FechaRegistro,
      Total,
      Estado: "pendiente" // Forzar estado inicial
    });

    // Crear detalles
    if (Array.isArray(detalle) && detalle.length > 0) {
      for (let d of detalle) {
        const ProductoServicioId = d.ProductoServicioId?.toString().trim();
        console.log("PRODUCTO SERVICIO ID LIMPIO:", ProductoServicioId);

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

    // 🔑 GENERAR EL QR DINÁMICO PARA BANCOLOMBIA
    const cuentaBancolombia = "24079288086"; // ← Tu cuenta real
    const monto = Math.round(nuevoPedido.Total); // Asegurar que sea entero
    const concepto = `PEDIDO-${nuevoPedido.PedidoClienteId}`; // ID del pedido como referencia

    const qrData = `https://www.bancolombia.com/pagosmovil?cuenta=${cuentaBancolombia}&monto=${monto}&concepto=${encodeURIComponent(concepto)}`;

    let qrCodeBase64 = null;
    try {
      qrCodeBase64 = await QrCode.toDataURL(qrData, { errorCorrectionLevel: "H" });
    } catch (qrError) {
      console.warn("No se pudo generar el QR, pero el pedido se creó:", qrError.message);
    }

    // Obtener datos del cliente para el correo
    let cliente = null;
    try {
      cliente = await getClienteByIdModel(ClienteId);
    } catch (err) {
      console.warn("No se pudo cargar el cliente para el email:", err.message);
    }

    // ✅ ENVIAR VOUCHER POR CORREO
    if (cliente && cliente.CorreoElectronico) {
      await sendVoucherEmail(
        cliente.CorreoElectronico,
        cliente.NombreCompleto || `${cliente.Nombre} ${cliente.Apellido}`,
        nuevoPedido.PedidoClienteId,
        nuevoPedido.Total
      );
    }

    // Preparar respuesta
    const pedidoCreado = {
      ...nuevoPedido,
      detalle: await getDetallePedidoByPedidoIdModel(nuevoPedido.PedidoClienteId)
    };

    // 🔑 Incluir el QR en la respuesta
    res.status(201).json({
      ...pedidoCreado,
      qrCode: qrCodeBase64 // ← ¡Esto es lo que tu frontend necesita!
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

    const result = await updatePedidoClienteModel(id, { Estado, ...otrosCampos });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Envío de correo si el estado cambió
    if (Estado && Estado !== estadoAnterior) {
      const cliente = await getClienteByIdModel(pedidoActual.ClienteId);
      if (cliente && cliente.CorreoElectronico) {
        await sendPedidoEstadoEmail(
          cliente.CorreoElectronico,
          cliente.NombreCompleto,
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


/**
 * Eliminar pedido + detalles
 */
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


export const getMisPedidos = async (req, res) => {
  try {
    const clienteId = req.user.CedulaId;

    if (!clienteId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const pedidos = await getAllPedidosClientesModel(clienteId);

    for (let p of pedidos) {
      p.detalle = await getDetallePedidoByPedidoIdModel(p.PedidoClienteId);
    }

    res.status(200).json(pedidos);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    res.status(500).json({ error: "Error al obtener tus pedidos" });
  }
};
