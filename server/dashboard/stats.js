const express = require('express');
const router = express.Router();

router.get('/dashboard/stats', async (req, res) => {
  try {
    console.log('🔍 Iniciando carga de dashboard...');
    
    // 1. Ventas mensuales (de ventas)
    const [ventasMensuales] = await pool.query(`
      SELECT 
        DATE_FORMAT(FechaVenta, '%b') as mes,
        SUM(Total) as ventas
      FROM ventas
      WHERE FechaVenta >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND Estado = 'pagado'
      GROUP BY DATE_FORMAT(FechaVenta, '%Y-%m')
      ORDER BY MIN(FechaVenta) ASC
    `);

    // 2. Ventas semanales (de ventas)
    const [ventasSemanales] = await pool.query(`
      SELECT 
        CONCAT('S', WEEK(FechaVenta)) as semana,
        SUM(Total) as ventas
      FROM ventas
      WHERE FechaVenta >= DATE_SUB(NOW(), INTERVAL 6 WEEK)
        AND Estado = 'pagado'
      GROUP BY WEEK(FechaVenta)
      ORDER BY MIN(FechaVenta) ASC
    `);

    // 3. Pedidos semanales (de pedidosclientes)
    const [pedidosSemanales] = await pool.query(`
      SELECT 
        CONCAT('S', WEEK(FechaRegistro)) as semana,
        COUNT(*) as pedidos
      FROM pedidosclientes
      WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 6 WEEK)
        AND Estado IN ('aprobado', 'entregado', 'finalizado')
      GROUP BY WEEK(FechaRegistro)
      ORDER BY MIN(FechaRegistro) ASC
    `);

    // 🔥 4. COMPRAS SEMANALES (de compras) - CORREGIDO
    const [comprasSemanales] = await pool.query(`
      SELECT 
        CONCAT('S', WEEK(c.FechaRegistro)) as semana,
        COUNT(*) as compras,
        SUM(c.Total) as total_compras
      FROM compras c
      WHERE c.FechaRegistro >= DATE_SUB(NOW(), INTERVAL 6 WEEK)
        AND c.Estado IN ('recibido', 'pendiente')
      GROUP BY WEEK(c.FechaRegistro)
      ORDER BY MIN(c.FechaRegistro) ASC
    `);

    // 5. Totales para tarjetas
    const [totales] = await pool.query(`
      SELECT
        (SELECT COALESCE(SUM(Total), 0) FROM ventas 
         WHERE FechaVenta >= DATE_SUB(NOW(), INTERVAL 1 MONTH) 
         AND Estado = 'pagado') as ventas_totales,
        (SELECT COUNT(*) FROM pedidosclientes 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('aprobado', 'entregado', 'finalizado')) as pedidos,
        (SELECT COUNT(*) FROM compras 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('recibido', 'pendiente')) as compras_mes,
        (SELECT COALESCE(SUM(Total), 0) FROM compras 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('recibido', 'pendiente')) as total_compras_mes
    `);

    // 6. Calcular variaciones
    const [variaciones] = await pool.query(`
      SELECT
        (SELECT COALESCE(SUM(Total), 0) FROM ventas 
         WHERE FechaVenta >= DATE_SUB(NOW(), INTERVAL 1 MONTH) 
         AND Estado = 'pagado') as mes_actual_ventas,
        (SELECT COALESCE(SUM(Total), 0) FROM ventas 
         WHERE FechaVenta >= DATE_SUB(NOW(), INTERVAL 2 MONTH) 
         AND FechaVenta < DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado = 'pagado') as mes_anterior_ventas,
        (SELECT COUNT(*) FROM pedidosclientes 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('aprobado', 'entregado', 'finalizado')) as mes_actual_pedidos,
        (SELECT COUNT(*) FROM pedidosclientes 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
         AND FechaRegistro < DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('aprobado', 'entregado', 'finalizado')) as mes_anterior_pedidos,
        (SELECT COUNT(*) FROM compras 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('recibido', 'pendiente')) as compras_mes_actual,
        (SELECT COUNT(*) FROM compras 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
         AND FechaRegistro < DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('recibido', 'pendiente')) as compras_mes_anterior,
        (SELECT COALESCE(SUM(Total), 0) FROM compras 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('recibido', 'pendiente')) as total_compras_actual,
        (SELECT COALESCE(SUM(Total), 0) FROM compras 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
         AND FechaRegistro < DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('recibido', 'pendiente')) as total_compras_anterior
    `);

    // Calcular porcentajes de variación
    const variacionVentas = variaciones[0].mes_anterior_ventas > 0 
      ? ((variaciones[0].mes_actual_ventas - variaciones[0].mes_anterior_ventas) / variaciones[0].mes_anterior_ventas * 100).toFixed(1)
      : 0;

    const variacionPedidos = variaciones[0].mes_anterior_pedidos > 0
      ? ((variaciones[0].mes_actual_pedidos - variaciones[0].mes_anterior_pedidos) / variaciones[0].mes_anterior_pedidos * 100).toFixed(1)
      : 0;

    const variacionCompras = variaciones[0].compras_mes_anterior > 0
      ? ((variaciones[0].compras_mes_actual - variaciones[0].compras_mes_anterior) / variaciones[0].compras_mes_anterior * 100).toFixed(1)
      : 0;

    const variacionTotalCompras = variaciones[0].total_compras_anterior > 0
      ? ((variaciones[0].total_compras_actual - variaciones[0].total_compras_anterior) / variaciones[0].total_compras_anterior * 100).toFixed(1)
      : 0;

    // Calcular promedio de compras semanales
    const comprasPromedio = comprasSemanales.length > 0
      ? (comprasSemanales.reduce((sum, item) => sum + item.compras, 0) / comprasSemanales.length).toFixed(0)
      : 0;

    // Calcular crecimiento (basado en ventas)
    const crecimiento = variaciones[0].mes_anterior_ventas > 0
      ? ((variaciones[0].mes_actual_ventas - variaciones[0].mes_anterior_ventas) / variaciones[0].mes_anterior_ventas * 100).toFixed(1)
      : 0;

    // Estructurar la respuesta
    const dashboardData = {
      ventasMensuales: ventasMensuales.map(item => ({
        mes: item.mes,
        ventas: Number(item.ventas) || 0
      })),
      ventasSemanales: ventasSemanales.map(item => ({
        semana: item.semana,
        ventas: Number(item.ventas) || 0
      })),
      pedidosSemanales: pedidosSemanales.map(item => ({
        semana: item.semana,
        pedidos: Number(item.pedidos) || 0
      })),
      comprasSemanales: comprasSemanales.map(item => ({
        semana: item.semana,
        compras: Number(item.compras) || 0
      })),
      totales: {
        ventasTotales: Number(totales[0]?.ventas_totales || 0),
        pedidos: Number(totales[0]?.pedidos || 0),
        comprasSemanales: Number(comprasPromedio || 0),
        crecimiento: Number(crecimiento || 0),
        variacionVentas: Number(variacionVentas || 0),
        variacionPedidos: Number(variacionPedidos || 0),
        variacionCrecimiento: Number(variacionCompras || 0),
        // Datos adicionales de compras
        totalComprasMes: Number(totales[0]?.total_compras_mes || 0),
        variacionTotalCompras: Number(variacionTotalCompras || 0)
      }
    };

    console.log('📊 Datos enviados:', JSON.stringify(dashboardData, null, 2));
    res.json(dashboardData);
    
  } catch (error) {
    console.error('❌ Error en dashboard:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos del dashboard',
      details: error.message 
    });
  }
});

module.exports = router;