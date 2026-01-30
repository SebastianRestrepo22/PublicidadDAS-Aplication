// server/models/detallePedidoCliente.model.js
import { v4 as uuidv4 } from "uuid";
import { dbPool } from "../lib/db.js";


export const getDetallePedidoByPedidoIdModel = async (PedidoClienteId) => {
  try {
    // ✅ Usar el nombre exacto: detallePedidosClientes
    const [rows] = await dbPool.execute(
      "SELECT * FROM detallePedidosClientes WHERE PedidoClienteId = ?",
      [PedidoClienteId]
    );
    return rows;
  } catch (error) {
    console.error("❌ Error en getDetallePedidoByPedidoIdModel:", error);
    throw error;
  }
};
// En createDetallePedidoModel, generar UUID para DetallePedidoClienteId

export const createDetallePedidoModel = async ({
  PedidoClienteId,
  ProductoId,
  ServicioId,
  Cantidad,
  Tamaño,
  Descripcion,
  UrlImagen,
  Precio,
  ColorId
}) => {
  try {
    const DetallePedidoClienteId = uuidv4(); // ← Generar UUID
    
    const query = `
      INSERT INTO detallePedidosClientes 
      (DetallePedidoClienteId, PedidoClienteId, ProductoId, ServicioId, Cantidad, Tamaño, Descripcion, UrlImagen, Precio, ColorId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      DetallePedidoClienteId, // ← Incluir el ID generado
      PedidoClienteId,
      ProductoId || null,
      ServicioId || null,
      Cantidad,
      Tamaño,
      Descripcion,
      UrlImagen,
      Precio,
      ColorId || null
    ];
    
    console.log("📝 [MODEL] Insertando detalle:", {
      DetallePedidoClienteId,
      ProductoId,
      ColorId,
      valores: values
    });
    
    const [result] = await dbPool.execute(query, values);
    
    console.log("✅ [MODEL] Detalle creado con ID:", DetallePedidoClienteId);
    return { DetallePedidoClienteId: DetallePedidoClienteId };
    
  } catch (error) {
    console.error("❌ Error en createDetallePedidoModel:", error);
    throw error;
  }
};

export const deleteDetallePedidoModel = async (id) => {
  try {
    // ✅ Usar el nombre exacto: detallePedidosClientes
    const [result] = await dbPool.execute(
      "DELETE FROM detallePedidosClientes WHERE DetallePedidoClienteId = ?",
      [id]
    );
    return result;
  } catch (error) {
    console.error("❌ Error en deleteDetallePedidoModel:", error);
    throw error;
  }
};