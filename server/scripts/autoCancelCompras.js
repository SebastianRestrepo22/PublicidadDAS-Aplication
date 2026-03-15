// scripts/autoCancelCompras.js
import cron from 'node-cron';
import { anularComprasExpiradas } from '../services/compraAutoCancel.service.js';

// Función para iniciar el servicio de anulación automática
export const iniciarAutoCancelacionCompras = () => {
  console.log('🚀 Iniciando servicio de anulación automática de compras...');
  
  // Ejecutar cada minuto (para testing)
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Ejecutando verificación de compras expiradas...');
    try {
      const resultado = await anularComprasExpiradas();
      if (resultado.anuladas > 0) {
        console.log(`✅ ${resultado.anuladas} compras anuladas automáticamente`);
      }
    } catch (error) {
      console.error('❌ Error en CRON de anulación:', error);
    }
  });

  // También ejecutar inmediatamente al iniciar
  setTimeout(async () => {
    console.log('🚀 Ejecutando verificación inicial...');
    try {
      await anularComprasExpiradas();
    } catch (error) {
      console.error('❌ Error en verificación inicial:', error);
    }
  }, 5000);

  console.log('✅ Servicio de anulación automática de compras iniciado correctamente');
};