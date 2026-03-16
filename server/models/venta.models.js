import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";

export const getAllVentasModel = async () => {
  try {
    const [rows] = await dbPool.query(`
      SELECT 
        v.VentaId,
        v.Origen,
        v.PedidoClienteId,
        v.ClienteId,
        v.ClienteNombre,
        v.ClienteTelefono,
        v.ClienteCorreo,
        v.UsuarioVendedorId,
        u.NombreCompleto AS UsuarioVendedorNombre,
        v.FechaVenta,
        v.Subtotal,
        v.IVA,
        v.Total,
        v.Estado,
        v.MotivoAnulacion
      FROM ventas v
      LEFT JOIN usuarios u ON v.UsuarioVendedorId = u.CedulaId
      ORDER BY v.FechaVenta DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error en getAllVentasModel:", error);
    throw error;
  }
};

export const getVentaByIdModel = async (ventaId) => {
  try {
    // 1. Obtener la venta principal
    const [ventaRows] = await dbPool.query(
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

    if (ventaRows.length === 0) {
      return null;
    }

    const venta = ventaRows[0];

    // 2. Obtener los detalles de la venta
    const [detalleRows] = await dbPool.query(
      `SELECT 
        dv.*,
        p.Nombre AS ProductoNombre,
        s.Nombre AS ServicioNombre,
        c.Nombre AS ColorNombre,
        c.Hex AS ColorHex
      FROM detalleventas dv
      LEFT JOIN productos p ON dv.ProductoId = p.ProductoId
      LEFT JOIN servicios s ON dv.ServicioId = s.ServicioId
      LEFT JOIN colores c ON dv.ColorId = c.ColorId
      WHERE dv.VentaId = ?`,
      [ventaId]
    );

    // 3. Agregar los detalles a la venta
    venta.detalle = detalleRows;

    return venta;

  } catch (error) {
    console.error("Error en getVentaByIdModel:", error);
    throw error;
  }
};

export const createVentaFromPedidoModel = async (pedidoData, usuarioVendedorId) => {
  const connection = await dbPool.getConnection();

  try {
    await connection.beginTransaction();

    const [ventaExistente] = await connection.query(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [pedidoData.PedidoClienteId]
    );

    if (ventaExistente.length > 0) {
      await connection.rollback();
      return {
        success: false,
        alreadyExists: true,
        VentaId: ventaExistente[0].VentaId
      };
    }

    const VentaId = uuidv4();

    let subtotal = parseFloat(pedidoData.Total) || 0;
    subtotal = parseFloat(subtotal.toFixed(2));

    const IVA = parseFloat((subtotal * 0.19).toFixed(2));
    const total = parseFloat((subtotal + IVA).toFixed(2));

    let clienteId = null;
    let clienteNombre = null;
    let clienteTelefono = null;
    let clienteCorreo = null;

    if (pedidoData.TipoCliente === 'registrado' && pedidoData.ClienteId) {
      clienteId = pedidoData.ClienteId;
      const [clienteRows] = await connection.query(
        "SELECT NombreCompleto, Telefono, CorreoElectronico FROM usuarios WHERE CedulaId = ?",
        [pedidoData.ClienteId]
      );
      if (clienteRows.length > 0) {
        clienteNombre = clienteRows[0].NombreCompleto;
        clienteTelefono = clienteRows[0].Telefono;
        clienteCorreo = clienteRows[0].CorreoElectronico;
      }
    } else {
      clienteNombre = pedidoData.ClienteNombre || null;
      clienteTelefono = pedidoData.ClienteTelefono || null;
      clienteCorreo = pedidoData.ClienteCorreo || null;
    }

    await connection.query(
      `INSERT INTO ventas (
        VentaId, Origen, PedidoClienteId, ClienteId, ClienteNombre, 
        ClienteTelefono, ClienteCorreo, UsuarioVendedorId, FechaVenta, 
        Subtotal, IVA, Total, Estado
      ) VALUES (?, 'pedido', ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 'pagado')`,
      [
        VentaId,
        pedidoData.PedidoClienteId,
        clienteId,
        clienteNombre,
        clienteTelefono,
        clienteCorreo,
        usuarioVendedorId || null,
        subtotal,
        IVA,
        total
      ]
    );

    // 🔥 Obtener los detalles del pedido con toda la información
    const [detallesPedido] = await connection.query(
      `SELECT 
        dp.*,
        p.Nombre AS ProductoNombre,
        s.Nombre AS ServicioNombre,
        c.Nombre AS ColorNombre,
        c.Hex AS ColorHex
       FROM detallepedidosclientes dp
       LEFT JOIN productos p ON dp.ProductoId = p.ProductoId
       LEFT JOIN servicios s ON dp.ServicioId = s.ServicioId
       LEFT JOIN colores c ON dp.ColorId = c.ColorId
       WHERE dp.PedidoClienteId = ?`,
      [pedidoData.PedidoClienteId]
    );

    // 🔥 Crear los detalles de la venta con TODA la información
    for (const detalle of detallesPedido) {
      const DetalleVentaId = uuidv4();
      
      // Determinar el tipo de item y nombre snapshot
      let tipoItem = detalle.ProductoId ? 'producto' : 'servicio';
      let nombreSnapshot = '';
      
      if (detalle.ProductoId) {
        nombreSnapshot = detalle.ProductoNombre || 'Producto';
      } else if (detalle.ServicioId) {
        nombreSnapshot = detalle.ServicioNombre || 'Servicio';
      }

      // Calcular subtotal
      const subtotalDetalle = (detalle.Cantidad || 0) * (detalle.Precio || 0);

      await connection.query(
        `INSERT INTO detalleventas (
          DetalleVentaId, VentaId, TipoItem, ProductoId, ServicioId,
          NombreSnapshot, Cantidad, PrecioUnitario, Subtotal, ColorId, DescripcionPersonalizada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          DetalleVentaId,
          VentaId,
          tipoItem,
          detalle.ProductoId || null,
          detalle.ServicioId || null,
          nombreSnapshot,
          detalle.Cantidad || 1,
          detalle.Precio || 0,
          subtotalDetalle,
          detalle.ColorId || null,  // ✅ Aquí se guarda el ColorId
          detalle.Descripcion || null
        ]
      );
    }

    await connection.commit();

    return {
      success: true,
      VentaId: VentaId,
      alreadyExists: false
    };

  } catch (error) {
    await connection.rollback();
    console.error("Error en createVentaFromPedidoModel:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export const createVentaManualModel = async (ventaData, connection) => {
  const usarConnection = connection || await dbPool.getConnection();
  const liberarConnection = !connection;

  try {
    const VentaId = uuidv4();
    let {
      ClienteId,
      ClienteNombre,
      ClienteTelefono,
      ClienteCorreo,
      UsuarioVendedorId,
      Subtotal,
      IVA,
      Total,
      Estado = 'pagado'
    } = ventaData;

    const limpiarNumero = (valor) => {
      if (typeof valor === 'string') {
        if (valor.includes(',') && valor.match(/\.\d{3},/)) {
          valor = valor.replace(/\./g, '').replace(',', '.');
        } else {
          valor = valor.replace(/[^0-9.-]/g, '');
        }
      }
      const num = parseFloat(valor);
      return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
    };

    Subtotal = limpiarNumero(Subtotal || 0);
    IVA = limpiarNumero(IVA || (Subtotal * 0.19));
    Total = limpiarNumero(Total || (Subtotal + IVA));

    await usarConnection.query(
      `INSERT INTO ventas (
        VentaId, Origen, ClienteId, ClienteNombre, ClienteTelefono, 
        ClienteCorreo, UsuarioVendedorId, FechaVenta, Subtotal, IVA, Total, Estado
      ) VALUES (?, 'manual', ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        VentaId,
        ClienteId || null,
        ClienteNombre || null,
        ClienteTelefono || null,
        ClienteCorreo || null,
        UsuarioVendedorId,
        Subtotal,
        IVA,
        Total,
        Estado
      ]
    );

    return VentaId;

  } catch (error) {
    throw error;
  } finally {
    if (liberarConnection) {
      usarConnection.release();
    }
  }
};

export const anularVentaModel = async (ventaId, motivoAnulacion) => {
  try {
    const [venta] = await dbPool.query(
      "SELECT Estado FROM ventas WHERE VentaId = ?",
      [ventaId]
    );

    if (venta.length === 0) {
      return { success: false, message: "Venta no encontrada" };
    }

    if (venta[0].Estado === 'anulado') {
      return { success: false, message: "La venta ya está anulada" };
    }

    const [result] = await dbPool.query(
      "UPDATE ventas SET Estado = 'anulado', MotivoAnulacion = ? WHERE VentaId = ?",
      [motivoAnulacion || null, ventaId]
    );

    return {
      success: true,
      affectedRows: result.affectedRows
    };

  } catch (error) {
    console.error("Error en anularVentaModel:", error);
    throw error;
  }
};

export const existeVentaParaPedidoModel = async (pedidoClienteId) => {
  try {
    const [rows] = await dbPool.query(
      "SELECT VentaId FROM ventas WHERE PedidoClienteId = ?",
      [pedidoClienteId]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Error en existeVentaParaPedidoModel:", error);
    throw error;
  }
};

export const getVentaByPedidoIdModel = async (pedidoClienteId) => {
  try {
    const [rows] = await dbPool.query(
      `SELECT v.*, u.NombreCompleto AS UsuarioVendedorNombre
       FROM ventas v
       LEFT JOIN usuarios u ON v.UsuarioVendedorId = u.CedulaId
       WHERE v.PedidoClienteId = ?`,
      [pedidoClienteId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error en getVentaByPedidoIdModel:", error);
    throw error;
  }
};

export const getVentasPaginated = async ({
  page = 1,
  limit = 10,
  filtroCampo = null,
  filtroValor = null,
  fechaInicio = null,
  fechaFin = null
}) => {
  const offset = (page - 1) * limit;
  let whereConditions = [];
  let params = [];

  if (fechaInicio) {
    whereConditions.push('v.FechaVenta >= ?');
    params.push(fechaInicio);
  }
  if (fechaFin) {
    whereConditions.push('v.FechaVenta <= ?');
    params.push(fechaFin);
  }

  const columnasMap = {
    VentaId: 'v.VentaId',
    PedidoClienteId: 'v.PedidoClienteId',
    ClienteNombre: 'v.ClienteNombre',
    Estado: 'v.Estado',
    Origen: 'v.Origen',
    Total: 'v.Total'
  };

  if (filtroCampo && filtroValor && columnasMap[filtroCampo]) {
    const columnaReal = columnasMap[filtroCampo];

    if (columnaReal === 'v.Total') {
      const valorNum = Number(filtroValor);
      if (!isNaN(valorNum)) {
        whereConditions.push(`${columnaReal} = ?`);
        params.push(valorNum);
      }
    } else if (columnaReal === 'v.Estado' || columnaReal === 'v.Origen') {
      whereConditions.push(`${columnaReal} = ?`);
      params.push(filtroValor);
    } else {
      whereConditions.push(`${columnaReal} LIKE ?`);
      params.push(`%${filtroValor}%`);
    }
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const [rows] = await dbPool.query(`
    SELECT 
      v.VentaId,
      v.Origen,
      v.PedidoClienteId,
      v.ClienteId,
      v.ClienteNombre,
      v.ClienteTelefono,
      v.ClienteCorreo,
      v.UsuarioVendedorId,
      u.NombreCompleto AS UsuarioVendedorNombre,
      v.FechaVenta,
      v.Subtotal,
      v.IVA,
      v.Total,
      v.Estado,
      v.MotivoAnulacion,
      COUNT(dv.DetalleVentaId) AS ItemsCount,
      SUM(CASE WHEN dv.TipoItem = 'producto' THEN 1 ELSE 0 END) AS ProductosCount,
      SUM(CASE WHEN dv.TipoItem = 'servicio' THEN 1 ELSE 0 END) AS ServiciosCount
    FROM ventas v
    LEFT JOIN usuarios u ON v.UsuarioVendedorId = u.CedulaId
    LEFT JOIN detalleventas dv ON v.VentaId = dv.VentaId
    ${whereClause}
    GROUP BY v.VentaId
    ORDER BY v.FechaVenta DESC
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  const [countResult] = await dbPool.query(`
    SELECT COUNT(DISTINCT v.VentaId) as total 
    FROM ventas v
    ${whereClause}
  `, params);

  const rowsWithCounts = rows.map(row => ({
    ...row,
    ItemsCount: parseInt(row.ItemsCount) || 0,
    ProductosCount: parseInt(row.ProductosCount) || 0,
    ServiciosCount: parseInt(row.ServiciosCount) || 0,
    detalle: [] 
  }));

  return {
    data: rowsWithCounts,
    totalItems: countResult[0]?.total || 0,
    currentPage: Number(page),
    itemsPerPage: Number(limit)
  };
};