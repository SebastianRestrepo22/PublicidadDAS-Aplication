import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";
import {
  getAllVentasModel,
  getVentaByIdModel,
  createVentaFromPedidoModel,
  createVentaManualModel,
  anularVentaModel,
  existeVentaParaPedidoModel,
  getVentaByPedidoIdModel
} from "../models/venta.models.js";
import {
  getDetalleVentaByVentaIdModel,
  createDetallesVentaFromPedidoModel,
  createDetalleVentaManualModel
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

export const createVentaDesdePedido = async (req, res) => {
  const connection = await dbPool.getConnection();
  try {
    const { PedidoClienteId, UsuarioVendedorId } = req.body;
    
    if (!PedidoClienteId) {
      return res.status(400).json({ error: "PedidoClienteId es obligatorio" });
    }
    
    await connection.beginTransaction();
    
    const existe = await existeVentaParaPedidoModel(PedidoClienteId);
    if (existe) {
      await connection.rollback();
      return res.status(400).json({ error: "Ya existe una venta para este pedido" });
    }
    
    const [pedidoRows] = await connection.query(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    const pedido = pedidoRows[0];
    
    const [detallesRows] = await connection.query(
      `SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (detallesRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "El pedido no tiene detalles" });
    }
    
    // Usar el modelo para crear la venta (UsuarioVendedorId puede ser null)
    const result = await createVentaFromPedidoModel(pedido, UsuarioVendedorId || null);
    
    if (!result.success) {
      await connection.rollback();
      return res.status(400).json({ error: "Error al crear la venta" });
    }
    
    const VentaId = result.VentaId;
    
    // Crear los detalles usando el modelo
    await createDetallesVentaFromPedidoModel(connection, VentaId, detallesRows);
    
    await connection.commit();
    
    const ventaCreada = await getVentaByIdModel(VentaId);
    ventaCreada.detalle = await getDetalleVentaByVentaIdModel(VentaId);
    
    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente desde el pedido",
      venta: ventaCreada
    });
    
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear venta desde pedido:", error);
    res.status(500).json({ error: "Error al crear venta desde pedido" });
  } finally {
    connection.release();
  }
};

export const createVentaManual = async (req, res) => {
  const connection = await dbPool.getConnection();
  try {
    let ventaData;
    
    if (req.body.ventaData) {
      ventaData = JSON.parse(req.body.ventaData);
      console.log("Datos desde FormData:", ventaData);
    } else {
      ventaData = req.body;
      console.log("Datos desde JSON:", ventaData);
    }

    const {
      ClienteId, ClienteNombre, ClienteTelefono, ClienteCorreo,
      UsuarioVendedorId, Subtotal, IVA, Total, detalles
    } = ventaData;

    // Para ventas manuales, UsuarioVendedorId SÍ es obligatorio
    if (!UsuarioVendedorId) {
      return res.status(400).json({ error: "UsuarioVendedorId es obligatorio" });
    }
    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ error: "Debe incluir al menos un detalle" });
    }

    await connection.beginTransaction();

    // Usar el modelo para crear la venta
    const VentaId = await createVentaManualModel({
      ClienteId,
      ClienteNombre,
      ClienteTelefono,
      ClienteCorreo,
      UsuarioVendedorId,
      Subtotal,
      IVA,
      Total
    });

    // Crear los detalles usando el modelo
    for (const detalle of detalles) {
      await createDetalleVentaManualModel({
        VentaId,
        TipoItem: detalle.TipoItem,
        ProductoId: detalle.ProductoId,
        ServicioId: detalle.ServicioId,
        ServicioTamanoId: detalle.ServicioTamanoId,
        NombreSnapshot: detalle.NombreSnapshot,
        Cantidad: detalle.Cantidad,
        PrecioUnitario: detalle.PrecioUnitario,
        Descuento: detalle.Descuento,
        Subtotal: (detalle.Cantidad || 0) * (detalle.PrecioUnitario || 0),
        ColorId: detalle.ColorId,
        DescripcionPersonalizada: detalle.DescripcionPersonalizada,
        UrlImagenPersonalizada: detalle.UrlImagenPersonalizada
      });
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente",
      VentaId
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error en createVentaManual:", error);
    res.status(500).json({ error: error.message || "Error al crear venta" });
  } finally {
    connection.release();
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

export const crearVentaDesdePedidoId = async (PedidoClienteId, UsuarioVendedorId = null) => {
  const connection = await dbPool.getConnection();
  try {
    if (!PedidoClienteId) throw new Error("PedidoClienteId es obligatorio");
    
    await connection.beginTransaction();

    const [ventaExistente] = await connection.query(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [PedidoClienteId]
    );
    if (ventaExistente.length > 0) {
      await connection.rollback();
      return { success: false, alreadyExists: true, VentaId: ventaExistente[0].VentaId };
    }
    
    const [pedidoRows] = await connection.query(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      await connection.rollback();
      throw new Error("Pedido no encontrado");
    }
    const pedido = pedidoRows[0];
    
    const [detallesRows] = await connection.query(
      `SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (detallesRows.length === 0) {
      await connection.rollback();
      throw new Error("El pedido no tiene detalles");
    }
    
    // Usar el modelo para crear la venta (UsuarioVendedorId puede ser null)
    const result = await createVentaFromPedidoModel(pedido, UsuarioVendedorId);
    
    if (!result.success) {
      await connection.rollback();
      return result;
    }
    
    const VentaId = result.VentaId;
    
    // Crear los detalles usando el modelo
    await createDetallesVentaFromPedidoModel(connection, VentaId, detallesRows);
    
    await connection.commit();
    
    const ventaCreada = await getVentaByIdModel(VentaId);
    
    return {
      success: true,
      VentaId: VentaId,
      venta: ventaCreada,
      alreadyExists: false
    };
    
  } catch (error) {
    await connection.rollback();
    console.error("Error en crearVentaDesdePedidoId:", error);
    throw error;
  } finally {
    connection.release();
  }
};