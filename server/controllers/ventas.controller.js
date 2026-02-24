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

export const createVentaDesdePedido = async (req, res) => {
  let connection;
  try {
    const { PedidoClienteId, UsuarioVendedorId } = req.body;
    
    if (!PedidoClienteId) {
      return res.status(400).json({ error: "PedidoClienteId es obligatorio" });
    }
    if (!UsuarioVendedorId) {
      return res.status(400).json({ error: "UsuarioVendedorId es obligatorio" });
    }
    
    connection = await dbPool.getConnection();
    await connection.beginTransaction();
    
    const existe = await existeVentaParaPedidoModel(PedidoClienteId);
    if (existe) {
      await connection.rollback();
      return res.status(400).json({ error: "Ya existe una venta para este pedido" });
    }
    
    const [pedidoRows] = await connection.execute(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    const pedido = pedidoRows[0];
    
    const [detallesRows] = await connection.execute(
      `SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (detallesRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "El pedido no tiene detalles" });
    }
    
    const VentaId = uuidv4();
    const subtotal = pedido.Total || 0;
    const IVA = subtotal * 0.19;
    const total = subtotal + IVA;
    
    let clienteId = null;
    let clienteNombre = pedido.ClienteNombre || null;
    let clienteTelefono = pedido.ClienteTelefono || null;
    let clienteCorreo = pedido.ClienteCorreo || null;
    
    if (pedido.TipoCliente === 'registrado' && pedido.ClienteId) {
      clienteId = pedido.ClienteId;
    }
    
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
    
    for (const detalle of detallesRows) {
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
    }
    
    await connection.commit();
    
    const ventaCreada = await getVentaByIdModel(VentaId);
    ventaCreada.detalle = await getDetalleVentaByVentaIdModel(VentaId);
    
    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente desde el pedido",
      venta: ventaCreada
    });
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al crear venta desde pedido:", error);
    res.status(500).json({ error: "Error al crear venta desde pedido" });
  } finally {
    if (connection) connection.release();
  }
};

export const createVentaManual = async (req, res) => {
  let connection;
  try {
    let ventaData;
    
    // Verificar si los datos vienen en req.body (JSON) o en req.body.ventaData (FormData)
    if (req.body.ventaData) {
      // Viene de FormData (con archivos)
      ventaData = JSON.parse(req.body.ventaData);
      console.log("Datos desde FormData:", ventaData);
    } else {
      // Viene como JSON directo (sin archivos)
      ventaData = req.body;
      console.log("Datos desde JSON:", ventaData);
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

    res.status(201).json({
      success: true,
      message: "Venta creada exitosamente",
      VentaId
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en createVentaManual:", error);
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

export const crearVentaDesdePedidoId = async (PedidoClienteId, UsuarioVendedorId = null) => {
  let connection;
  try {
    if (!PedidoClienteId) throw new Error("PedidoClienteId es obligatorio");
    
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const [ventaExistente] = await connection.execute(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [PedidoClienteId]
    );
    if (ventaExistente.length > 0) {
      await connection.rollback();
      return { success: false, alreadyExists: true, VentaId: ventaExistente[0].VentaId };
    }
    
    const [pedidoRows] = await connection.execute(
      `SELECT * FROM pedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (pedidoRows.length === 0) {
      await connection.rollback();
      throw new Error("Pedido no encontrado");
    }
    const pedido = pedidoRows[0];
    
    const [detallesRows] = await connection.execute(
      `SELECT * FROM detallepedidosclientes WHERE PedidoClienteId = ?`,
      [PedidoClienteId]
    );
    if (detallesRows.length === 0) {
      await connection.rollback();
      throw new Error("El pedido no tiene detalles");
    }
    
    const VentaId = uuidv4();
    const subtotal = pedido.Total || 0;
    const IVA = subtotal * 0.19;
    const total = subtotal + IVA;
    
    let clienteId = null;
    let clienteNombre = pedido.ClienteNombre || null;
    let clienteTelefono = pedido.ClienteTelefono || null;
    let clienteCorreo = pedido.ClienteCorreo || null;
    
    if (pedido.TipoCliente === 'registrado' && pedido.ClienteId) {
      clienteId = pedido.ClienteId;
    }
    
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
    
    for (const detalle of detallesRows) {
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
    }
    
    await connection.commit();
    
    const ventaCreada = await getVentaByIdModel(VentaId);
    
    return {
      success: true,
      VentaId: VentaId,
      venta: ventaCreada,
      alreadyExists: false
    };
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error en crearVentaDesdePedidoId:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};