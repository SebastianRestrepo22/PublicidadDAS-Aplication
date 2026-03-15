// services/compraAutoCancel.service.js
import { dbPool } from "../lib/db.js";

export const anularComprasExpiradas = async () => {
  try {
    console.log('\n🕒 ===== VERIFICACIÓN DE COMPRAS EXPIRADAS =====');
    console.log(`🕒 Hora actual del servidor: ${new Date().toLocaleString()}`);
    
    // Anular compras pendientes con más de 2 horas
    const [result] = await dbPool.query(
      `UPDATE compras 
       SET Estado = 'anulada',
           MotivoCancelacion = CONCAT('Anulación automática por tiempo de espera excedido (2 horas) - ', NOW())
       WHERE Estado = 'pendiente' 
       AND FechaRegistro < DATE_SUB(NOW(), INTERVAL 2 HOUR)`
    );
    
    console.log(`📊 RESULTADO: ${result.affectedRows} compras anuladas`);
    console.log('===========================================\n');
    
    return { 
      anuladas: result.affectedRows,
      fallidas: 0
    };

  } catch (error) {
    console.error('❌ Error en proceso de anulación automática:', error);
    throw error;
  }
};