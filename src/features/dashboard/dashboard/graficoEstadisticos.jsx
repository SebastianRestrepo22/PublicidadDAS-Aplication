"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingCart, Package, TrendingUp, Calendar } from "lucide-react";

export const GraficosEstadisticos = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setCargando(true);
      console.log('🔍 Solicitando datos del dashboard...');

      const response = await fetch('http://localhost:3000/api/dashboard/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📡 Respuesta status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const datosReales = await response.json();
      console.log('📊 Datos dashboard recibidos:', datosReales);
      
      setDatos(datosReales);
      setCargando(false);

    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      setError(`No se pudieron cargar los datos: ${error.message}`);
      setCargando(false);
    }
  };

  // Función para asegurar que los valores sean números válidos
  const asegurarNumero = (valor) => {
    if (valor === undefined || valor === null) return 0;
    if (typeof valor === 'string') {
      // Eliminar cualquier carácter no numérico excepto punto decimal
      const limpio = valor.replace(/[^0-9.-]/g, '');
      const num = parseFloat(limpio);
      return isNaN(num) ? 0 : num;
    }
    const num = Number(valor);
    return isNaN(num) ? 0 : num;
  };

  // Formateador seguro para el eje Y
  const formatearEjeY = (valor) => {
    const num = asegurarNumero(valor);
    if (num === 0) return '$0';
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}k`;
    }
    return `$${num}`;
  };

  // Procesar datos para los gráficos
  const procesarDatos = (data, key) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => {
      const valorOriginal = item[key];
      const valorSeguro = asegurarNumero(valorOriginal);
      
      // Log para depuración
      if (isNaN(valorSeguro)) {
        console.warn(`⚠️ Valor NaN detectado en ${key}:`, item);
      }
      
      return {
        ...item,
        [key]: valorSeguro
      };
    });
  };

  // Tooltip personalizado con manejo seguro de NaN
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const valor = asegurarNumero(payload[0]?.value);
      const dataKey = payload[0]?.dataKey;
      
      let icono = '📊';
      if (dataKey === 'ventas') icono = '💰';
      else if (dataKey === 'pedidos') icono = '📦';
      else if (dataKey === 'compras') icono = '🛒';
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <p className="text-blue-600 font-semibold text-sm">
            {icono} {valor.toLocaleString('es-CO')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={cargarDatosDashboard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  // Procesar datos asegurando números
  const ventasMensuales = procesarDatos(datos.ventasMensuales, 'ventas');
  const ventasSemanales = procesarDatos(datos.ventasSemanales, 'ventas');
  const pedidosSemanales = procesarDatos(datos.pedidosSemanales, 'pedidos');
  const comprasSemanales = procesarDatos(datos.comprasSemanales, 'compras');
  
  const totales = datos.totales || {};

  console.log('📊 Datos procesados:', {
    ventasMensuales: ventasMensuales.length,
    ventasSemanales: ventasSemanales.length,
    pedidosSemanales: pedidosSemanales.length,
    comprasSemanales: comprasSemanales.length,
    totales
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="p-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Ventas Totales</span>
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              ${asegurarNumero(totales.ventasTotales).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-blue-100">
              {asegurarNumero(totales.variacionVentas) > 0 ? '+' : ''}
              {asegurarNumero(totales.variacionVentas)}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Pedidos</span>
              <Package className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {asegurarNumero(totales.pedidos).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-green-100">
              {asegurarNumero(totales.variacionPedidos) > 0 ? '+' : ''}
              {asegurarNumero(totales.variacionPedidos)}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Compras Semanales</span>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {asegurarNumero(totales.comprasSemanales).toLocaleString('es-CO')}
            </div>
            <p className="text-xs text-purple-100">
              Promedio por semana
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Crecimiento</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {asegurarNumero(totales.crecimiento) > 0 ? '+' : ''}
              {asegurarNumero(totales.crecimiento)}%
            </div>
            <p className="text-xs text-yellow-100">
              {asegurarNumero(totales.variacionCrecimiento) > 0 ? '+' : ''}
              {asegurarNumero(totales.variacionCrecimiento)}% desde la semana pasada
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas Mensuales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas mensuales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ventas por mes en el último semestre
            </p>
            <div className="overflow-x-auto">
              {ventasMensuales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ventasMensuales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={formatearEjeY}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="ventas"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No hay datos de ventas mensuales
                </div>
              )}
            </div>
          </div>

          {/* Ventas Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tendencia de ventas por semana
            </p>
            <div className="overflow-x-auto">
              {ventasSemanales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ventasSemanales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="semana"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={formatearEjeY}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="ventas"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No hay datos de ventas semanales
                </div>
              )}
            </div>
          </div>

          {/* Pedidos Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Pedidos semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Volumen de pedidos por semana
            </p>
            <div className="overflow-x-auto">
              {pedidosSemanales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={pedidosSemanales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="pedidos"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No hay datos de pedidos semanales
                </div>
              )}
            </div>
          </div>

          {/* Compras Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Compras semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Número de compras por semana
            </p>
            <div className="overflow-x-auto">
              {comprasSemanales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comprasSemanales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="semana"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="compras"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No hay datos de compras semanales
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};