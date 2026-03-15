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

  // Efecto para cargar datos cuando el componente se monta
  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    try {
      setCargando(true);

      const response = await fetch('http://localhost:3000/api/dashboard/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }

      const datosReales = await response.json();
      console.log('📊 Datos dashboard:', datosReales);
      setDatos(datosReales);
      setCargando(false);

    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("No se pudieron cargar los datos");
      setCargando(false);
    }
  };

  // Tooltip personalizado para Ventas Mensuales
  const CustomTooltipMensual = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[200px]">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <p className="text-blue-600 font-semibold">
            💰 Ventas: ${payload[0]?.value?.toLocaleString() || '0'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para Ventas Semanales
  const CustomTooltipSemanal = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[200px]">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <p className="text-blue-600 font-semibold">
            💰 Ventas: ${payload[0]?.value?.toLocaleString() || '0'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip para Compras Semanales
  const CustomTooltipCompras = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[200px]">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <p className="text-green-600 font-semibold">
            📦 Compras: {payload[0]?.value?.toLocaleString() || '0'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Mostrar cargando mientras obtenemos datos
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

  // Mostrar error si algo sale mal
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

  // Si no hay datos, mostramos algo
  if (!datos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  // Extraemos los datos
  const {
    ventasMensuales = [],
    ventasSemanales = [],
    pedidosSemanales = [],
    comprasSemanales = [], // Nuevo: compras semanales
    totales = {}
  } = datos;

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
              ${totales?.ventasTotales?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-blue-100">
              {totales?.variacionVentas > 0 ? '+' : ''}{totales?.variacionVentas || 0}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Pedidos</span>
              <Package className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {totales?.pedidos?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-green-100">
              {totales?.variacionPedidos > 0 ? '+' : ''}{totales?.variacionPedidos || 0}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Compras Semanales</span>
              <Calendar className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {totales?.comprasSemanales?.toLocaleString() || '0'}
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
              {totales?.crecimiento > 0 ? '+' : ''}{totales?.crecimiento || 0}%
            </div>
            <p className="text-xs text-yellow-100">
              {totales?.variacionCrecimiento > 0 ? '+' : ''}{totales?.variacionCrecimiento || 0}% desde la semana pasada
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Gráfico de Ventas Mensuales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas mensuales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ventas por mes en el último semestre
            </p>
            <div className="overflow-x-auto">
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
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltipMensual />} />
                  <Bar
                    dataKey="ventas"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Ventas Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tendencia de ventas por semana
            </p>
            <div className="overflow-x-auto">
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
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip content={<CustomTooltipSemanal />} />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pedidos Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Pedidos semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Volumen de pedidos por semana
            </p>
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={pedidosSemanales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pedidos"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Compras Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Compras semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Número de compras por semana
            </p>
            <div className="overflow-x-auto">
              {comprasSemanales && comprasSemanales.length > 0 ? (
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
                      domain={[0, 'dataMax + 1']} // Asegura que el eje Y tenga un rango válido
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value) => {
                        // Asegurar que el valor sea un número válido
                        const numValue = Number(value);
                        return isNaN(numValue) ? '0' : numValue;
                      }}
                    />
                    <Bar
                      dataKey="compras"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      // Asegurar que los valores sean números
                      data={comprasSemanales.map(item => ({
                        semana: item.semana,
                        compras: Number(item.compras) || 0
                      }))}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No hay datos de compras disponibles
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};