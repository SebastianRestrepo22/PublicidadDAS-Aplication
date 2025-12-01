import {
  getAllPedidosClientesModel,
  getPedidoClienteByIdModel,
  createPedidoClienteModel,
  updatePedidoClienteModel,
  deletePedidoClienteModel
} from "../models/pedidoCliente.model.js";

import {
  createDetallePedidoModel,
  getDetallePedidoByPedidoIdModel,
  deleteDetallePedidoModel
} from "../models/detallePedidoCliente.model.js";


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

/**
 * Crear pedido + detalles
 */
export const createPedidoCliente = async (req, res) => {
  try {
    let { ClienteId, FechaRegistro, Total, Estado, detalle } = req.body;

    console.log("CLIENTE ID RECIBIDO (crudo):", ClienteId);

    // 🔥 LIMPIA espacios y tabs
    ClienteId = ClienteId?.toString().trim();

    console.log("CLIENTE ID LIMPIO:", ClienteId);
    console.log("BODY COMPLETO:", req.body);

    if (!ClienteId) {
      return res.status(400).json({ error: "ClienteId es obligatorio" });
    }

    const nuevoPedido = await createPedidoClienteModel({
      ClienteId,
      FechaRegistro,
      Total,
      Estado
    });

    if (Array.isArray(detalle) && detalle.length > 0) {
      for (let d of detalle) {

  // Limpieza de ProductoServicioId
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

    const pedidoCreado = {
      ...nuevoPedido,
      detalle: await getDetallePedidoByPedidoIdModel(nuevoPedido.PedidoClienteId)
    };

    res.status(201).json(pedidoCreado);

  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};


/**
 * Actualizar pedido
 */
export const updatePedidoCliente = async (req, res) => {

  if (req.body.FechaRegistro) {
  req.body.FechaRegistro = req.body.FechaRegistro.split("T")[0];
}

  try {
    const result = await updatePedidoClienteModel(req.params.id, req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const pedidoActualizado = await getPedidoClienteByIdModel(req.params.id);
    pedidoActualizado.detalle = await getDetallePedidoByPedidoIdModel(req.params.id);

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
