import {
  getAllProduccionModel,
  getProduccionByIdModel,
  createProduccionModel,
  updateProduccionModel,
  deleteProduccionModel
} from "../models/produccion.model.js";

import {
  getDetalleProduccionByProduccionIdModel,
  deleteDetalleProduccionModel as deleteDetalleModel
} from "../models/detalleProduccion.model.js";

// REMOVER esta importación si no existe el modelo
// import { updatePedidoClienteModel } from "../models/pedidoCliente.model.js";

import { v4 as uuidv4 } from "uuid";
import connectDB from "../lib/db.js";

// Obtener todas las producciones con sus detalles
export const getProduccion = async (req, res) => {
  try {
    const produccion = await getAllProduccionModel();

    for (let p of produccion) {
      p.detalle = await getDetalleProduccionByProduccionIdModel(p.ProduccionId);
    }

    res.status(200).json(produccion);
  } catch (error) {
    console.error("Error al obtener producciones:", error);
    res.status(500).json({ error: "Error al obtener producciones" });
  }
};

// Obtener producción por ID
export const getProduccionById = async (req, res) => {
  try {
    const produccion = await getProduccionByIdModel(req.params.id);

    if (!produccion) {
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    produccion.detalle = await getDetalleProduccionByProduccionIdModel(req.params.id);
    res.status(200).json(produccion);
  } catch (error) {
    console.error("Error al obtener producción:", error);
    res.status(500).json({ error: "Error al obtener producción" });
  }
};

// Crear producción + detalles
export const createProduccion = async (req, res) => {
  const { PedidoClienteId, Estado, FechaInicio, FechaFin, detalle } = req.body;

  if (!PedidoClienteId || !FechaInicio) {
    return res.status(400).json({ error: "PedidoClienteId y FechaInicio son requeridos" });
  }

  let connection;
  try {
    // Obtener una conexión del pool
    const pool = await connectDB();
    connection = await pool.getConnection();
    
    await connection.beginTransaction();

    const ProduccionId = uuidv4();

    // Insertar producción
    await connection.execute(
      `INSERT INTO produccion (ProduccionId, PedidoClienteId, Estado, FechaInicio, FechaFin)
       VALUES (?, ?, ?, ?, ?)`,
      [ProduccionId, PedidoClienteId, Estado || "En Proceso", FechaInicio, FechaFin || null]
    );

    // Insertar detalles
    if (Array.isArray(detalle)) {
      for (const d of detalle) {
        if (!d.InsumoId || !d.CantidadUsada) continue;
        await connection.execute(
          `INSERT INTO detalleproduccion (DetalleProduccionId, ProduccionId, InsumoId, CantidadUsada)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), ProduccionId, d.InsumoId, Number(d.CantidadUsada)]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Producción creada correctamente", ProduccionId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creando producción:", error);
    res.status(500).json({ error: "Error al crear producción" });
  } finally {
    if (connection) connection.release();
  }
};

// Función auxiliar para actualizar estado del pedido
const updatePedidoClienteEstado = async (connection, pedidoId, estado) => {
  try {
    // PRIMERO: Verificar si la tabla existe
    const [tables] = await connection.execute("SHOW TABLES");
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log("📊 Tablas disponibles:", tableNames);
    
    // Buscar el nombre correcto de la tabla
    let tablaPedido = null;
    const posiblesNombres = [
      'pedidocliente',
      'PedidoCliente', 
      'pedidos_cliente',
      'pedidosclientes',
      'pedidos',
      'pedidos_clientes'
    ];
    
    for (const nombre of posiblesNombres) {
      if (tableNames.includes(nombre)) {
        tablaPedido = nombre;
        console.log(`✅ Tabla encontrada: ${tablaPedido}`);
        break;
      }
    }
    
    if (!tablaPedido) {
      console.error("❌ No se encontró la tabla de pedidos");
      return;
    }
    
    // Verificar las columnas de la tabla
    const [columns] = await connection.execute(`DESCRIBE ${tablaPedido}`);
    console.log(`📋 Columnas de ${tablaPedido}:`, columns.map(col => col.Field));
    
    // Buscar el nombre correcto de la columna ID
    let columnaId = 'PedidoClienteId';
    const posiblesColumnasId = ['PedidoClienteId', 'pedidoclienteid', 'id', 'ID', 'pedido_id'];
    
    for (const columna of posiblesColumnasId) {
      if (columns.some(col => col.Field === columna)) {
        columnaId = columna;
        console.log(`✅ Columna ID encontrada: ${columnaId}`);
        break;
      }
    }
    
    // Buscar el nombre correcto de la columna Estado
    let columnaEstado = 'Estado';
    const posiblesColumnasEstado = ['Estado', 'estado', 'status', 'EstadoPedido'];
    
    for (const columna of posiblesColumnasEstado) {
      if (columns.some(col => col.Field === columna)) {
        columnaEstado = columna;
        console.log(`✅ Columna Estado encontrada: ${columnaEstado}`);
        break;
      }
    }
    
    // Actualizar el pedido
    console.log(`🔄 Actualizando pedido ${pedidoId} a estado "${estado}" en tabla ${tablaPedido}`);
    
    const [result] = await connection.execute(
      `UPDATE ${tablaPedido} SET ${columnaEstado} = ? WHERE ${columnaId} = ?`,
      [estado, pedidoId]
    );
    
    console.log(`✅ Pedido actualizado. Filas afectadas: ${result.affectedRows}`);
    
  } catch (error) {
    console.error("❌ Error en updatePedidoClienteEstado:", error);
    // No lanzamos el error, solo lo registramos para no romper el flujo principal
  }
};

// Actualizar producción + sincronizar con pedido si se finaliza
export const updateProduccion = async (req, res) => {
  const { id } = req.params;
  const { Estado, PedidoClienteId, FechaInicio, FechaFin } = req.body;

  let connection;
  try {
    // 1. Obtener producción actual para comparar estado
    const produccionActual = await getProduccionByIdModel(id);
    if (!produccionActual) {
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    const eraFinalizada = produccionActual.Estado === "Finalizado";
    const seraFinalizada = Estado === "Finalizado";

    // 2. Obtener conexión del pool
    const pool = await connectDB();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 3. Actualizar producción
    const [result] = await connection.execute(
      `UPDATE produccion 
       SET Estado = ?, FechaInicio = ?, FechaFin = ? 
       WHERE ProduccionId = ?`,
      [
        Estado || produccionActual.Estado, 
        FechaInicio || produccionActual.FechaInicio, 
        FechaFin || produccionActual.FechaFin, 
        id
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    // 4. Si pasa a "Finalizado" y no lo estaba antes, actualizar el pedido
    if (seraFinalizada && !eraFinalizada) {
      const pedidoId = PedidoClienteId || produccionActual.PedidoClienteId;
      
      if (!pedidoId) {
        console.warn("⚠️ No se puede actualizar pedido: ID no disponible");
      } else {
        // Intentar actualizar el pedido (esta función ya maneja errores internamente)
        await updatePedidoClienteEstado(connection, pedidoId, "terminado");
      }
    }

    await connection.commit();

    // 5. Responder con producción actualizada
    const produccionActualizada = await getProduccionByIdModel(id);
    produccionActualizada.detalle = await getDetalleProduccionByProduccionIdModel(id);
    
    res.status(200).json(produccionActualizada);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error al actualizar producción:", error);
    res.status(500).json({ error: "Error al actualizar producción" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Eliminar producción + detalles
export const deleteProduccion = async (req, res) => {
  let connection;
  try {
    // Obtener conexión del pool
    const pool = await connectDB();
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Eliminar detalles primero
    await connection.execute(
      "DELETE FROM detalleproduccion WHERE ProduccionId = ?", 
      [req.params.id]
    );

    // Eliminar producción
    const [result] = await connection.execute(
      "DELETE FROM produccion WHERE ProduccionId = ?", 
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "Producción no encontrada" });
    }

    await connection.commit();
    res.status(204).send();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error al eliminar producción:", error);
    res.status(500).json({ error: "Error al eliminar producción" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};