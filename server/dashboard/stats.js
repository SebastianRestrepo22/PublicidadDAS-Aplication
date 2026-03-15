const express = require('express');
const router = express.Router();

router.get('/dashboard/stats', async (req, res) => {
  try {
    // 1. Ventas mensuales
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

    // 2. Ventas semanales
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

    // 3. Pedidos semanales
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

    // 4. COMPRAS SEMANALES (reemplaza a usuarios activos)
    const [comprasSemanales] = await pool.query(`
      SELECT 
        CONCAT('S', WEEK(FechaRegistro)) as semana,
        COUNT(*) as compras
      FROM pedidosclientes
      WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 6 WEEK)
        AND Estado IN ('aprobado', 'entregado', 'finalizado')
      GROUP BY WEEK(FechaRegistro)
      ORDER BY MIN(FechaRegistro) ASC
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
        (SELECT COUNT(*) FROM pedidosclientes 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
         AND Estado IN ('aprobado', 'entregado', 'finalizado')) as compras_semanales
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
        (SELECT COUNT(*) FROM pedidosclientes 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
         AND Estado IN ('aprobado', 'entregado', 'finalizado')) as semana_actual_compras,
        (SELECT COUNT(*) FROM pedidosclientes 
         WHERE FechaRegistro >= DATE_SUB(NOW(), INTERVAL 2 WEEK)
         AND FechaRegistro < DATE_SUB(NOW(), INTERVAL 1 WEEK)
         AND Estado IN ('aprobado', 'entregado', 'finalizado')) as semana_anterior_compras
    `);

    // ➕ 7. NUEVO: Top productos/servicios - Últimos 6 meses (para gráfico mensual)
    const [topProductosMensuales] = await pool.query(`
      SELECT 
        dv.NombreSnapshot as nombre,
        dv.TipoItem as tipo,
        DATE_FORMAT(v.FechaVenta, '%Y-%m') as periodo,
        SUM(dv.Cantidad) as cantidad_vendida,
        SUM(dv.Subtotal) as ingresos
      FROM detalleventas dv
      INNER JOIN ventas v ON dv.VentaId = v.VentaId
      WHERE v.FechaVenta >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND v.Estado = 'pagado'
      GROUP BY dv.ProductoId, dv.ServicioId, dv.NombreSnapshot, dv.TipoItem
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `);

    // ➕ 8. NUEVO: Top productos/servicios - Últimas 6 semanas (para gráfico semanal)
    const [topProductosSemanales] = await pool.query(`
      SELECT 
        dv.NombreSnapshot as nombre,
        dv.TipoItem as tipo,
        WEEK(v.FechaVenta) as periodo,
        SUM(dv.Cantidad) as cantidad_vendida,
        SUM(dv.Subtotal) as ingresos
      FROM detalleventas dv
      INNER JOIN ventas v ON dv.VentaId = v.VentaId
      WHERE v.FechaVenta >= DATE_SUB(NOW(), INTERVAL 6 WEEK)
        AND v.Estado = 'pagado'
      GROUP BY dv.ProductoId, dv.ServicioId, dv.NombreSnapshot, dv.TipoItem
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `);

    // Calcular porcentajes de variación
    const variacionVentas = variaciones[0].mes_anterior_ventas > 0 
      ? ((variaciones[0].mes_actual_ventas - variaciones[0].mes_anterior_ventas) / variaciones[0].mes_anterior_ventas * 100).toFixed(1)
      : 100;

    const variacionPedidos = variaciones[0].mes_anterior_pedidos > 0
      ? ((variaciones[0].mes_actual_pedidos - variaciones[0].mes_anterior_pedidos) / variaciones[0].mes_anterior_pedidos * 100).toFixed(1)
      : 100;

    // Calcular promedio de compras semanales
    const comprasPromedio = comprasSemanales.length > 0
      ? (comprasSemanales.reduce((sum, item) => sum + item.compras, 0) / comprasSemanales.length).toFixed(0)
      : 0;

    // Calcular crecimiento (basado en ventas)
    const crecimiento = ((variaciones[0].mes_actual_ventas - variaciones[0].mes_anterior_ventas) / variaciones[0].mes_anterior_ventas * 100).toFixed(1);

    // Calcular variación de compras semanales
    const variacionCompras = variaciones[0].semana_anterior_compras > 0
      ? ((variaciones[0].semana_actual_compras - variaciones[0].semana_anterior_compras) / variaciones[0].semana_anterior_compras * 100).toFixed(1)
      : 0;

    // Estructurar la respuesta COMPLETA
    const dashboardData = {
      ventasMensuales: ventasMensuales.map(item => ({
        mes: item.mes,
        ventas: Number(item.ventas)
      })),
      ventasSemanales: ventasSemanales.map(item => ({
        semana: item.semana,
        ventas: Number(item.ventas)
      })),
      pedidosSemanales: pedidosSemanales.map(item => ({
        semana: item.semana,
        pedidos: Number(item.pedidos)
      })),
      comprasSemanales: comprasSemanales.map(item => ({
        semana: item.semana,
        compras: Number(item.compras)
      })),
      totales: {
        ventasTotales: Number(totales[0]?.ventas_totales || 0),
        pedidos: Number(totales[0]?.pedidos || 0),
        comprasSemanales: Number(comprasPromedio || 0),
        crecimiento: Number(crecimiento || 0),
        variacionVentas: Number(variacionVentas || 0),
        variacionPedidos: Number(variacionPedidos || 0),
        variacionCrecimiento: Number(variacionCompras || 0)
      },
      topProductosMensuales: topProductosMensuales.map(item => ({
        nombre: item.nombre,
        tipo: item.tipo,
        cantidad: Number(item.cantidad_vendida),
        ingresos: Number(item.ingresos)
      })),
      topProductosSemanales: topProductosSemanales.map(item => ({
        nombre: item.nombre,
        tipo: item.tipo,
        cantidad: Number(item.cantidad_vendida),
        ingresos: Number(item.ingresos)
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos del dashboard',
      details: error.message 
    });
  }
});

module.exports = router;