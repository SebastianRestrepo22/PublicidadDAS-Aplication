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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, ShoppingCart, Package, TrendingUp, Star } from "lucide-react";

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
      setDatos(datosReales);
      setCargando(false);

    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("No se pudieron cargar los datos");
      setCargando(false);
    }
  };

  // ➕ Tooltip personalizado para Ventas Mensuales (muestra top productos del mes)
  const CustomTooltipMensual = ({ active, payload, label }) => {
    if (active && payload?.length) {
      // Filtrar productos que coincidan con el mes mostrado (por nombre abreviado)
      const productosDelMes = datos?.topProductosMensuales?.filter(p => {
        // Aquí podrías agregar lógica más precisa si el backend incluye el mes por producto
        return true; // Por ahora mostramos los tops generales
      }).slice(0, 3);

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[280px]">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <p className="text-blue-600 font-semibold mb-3">
            💰 Ventas: ${payload[0].value?.toLocaleString()}
          </p>
          
          {productosDelMes?.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold text-gray-700">Top productos</span>
              </div>
              <div className="space-y-1.5">
                {productosDelMes.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 truncate max-w-[120px]" title={prod.nombre}>
                        {prod.nombre}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        prod.tipo === 'producto' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {prod.tipo}
                      </span>
                    </div>
                    <span className="text-gray-500 font-medium">{prod.cantidad} un.</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // ➕ Tooltip personalizado para Ventas Semanales
  const CustomTooltipSemanal = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const productosSemana = datos?.topProductosSemanales?.slice(0, 3);

      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[280px]">
          <p className="font-bold text-gray-900 mb-2 text-sm">{label}</p>
          <p className="text-blue-600 font-semibold mb-3">
            💰 Ventas: ${payload[0].value?.toLocaleString()}
          </p>
          
          {productosSemana?.length > 0 && (
            <>
              <div className="flex items-center gap-1.5 mb-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold text-gray-700">Top productos</span>
              </div>
              <div className="space-y-1.5">
                {productosSemana.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 truncate max-w-[120px]" title={prod.nombre}>
                        {prod.nombre}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        prod.tipo === 'producto' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {prod.tipo}
                      </span>
                    </div>
                    <span className="text-gray-500 font-medium">{prod.cantidad} un.</span>
                  </div>
                ))}
              </div>
            </>
          )}
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

  // Extraemos los datos incluyendo los top productos
  const { 
    ventasMensuales, 
    ventasSemanales, 
    pedidosSemanales, 
    usuariosActivos, 
    totales,
    topProductosMensuales,
    topProductosSemanales
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
              ${totales.ventasTotales.toLocaleString()}
            </div>
            <p className="text-xs text-blue-100">
              {totales.variacionVentas > 0 ? '+' : ''}{totales.variacionVentas}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Pedidos</span>
              <Package className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {totales.pedidos.toLocaleString()}
            </div>
            <p className="text-xs text-green-100">
              {totales.variacionPedidos > 0 ? '+' : ''}{totales.variacionPedidos}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Usuarios Activos</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {totales.usuariosActivos.toLocaleString()}
            </div>
            <p className="text-xs text-yellow-100">
              {totales.variacionUsuarios > 0 ? '+' : ''}{totales.variacionUsuarios}% desde el mes pasado
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Crecimiento</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">
              {totales.crecimiento > 0 ? '+' : ''}{totales.crecimiento}%
            </div>
            <p className="text-xs text-purple-100">
              {totales.variacionCrecimiento > 0 ? '+' : ''}{totales.variacionCrecimiento}% desde la semana pasada
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ➕ Gráfico de Ventas Mensuales con Tooltip personalizado */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas mensuales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ventas por mes en el último semestre • 
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
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip content={<CustomTooltipMensual />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                  <Bar 
                    dataKey="ventas" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    activeBar={{ fill: '#2563eb', filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ➕ Gráfico de Ventas Semanales con Tooltip personalizado */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tendencia de ventas por semana • 
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
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip content={<CustomTooltipSemanal />} />
                  <Line 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4, stroke: "#fff" }}
                    activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2, fill: "#fff" }}
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

          {/* Gráfico de Usuarios */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Usuarios activos mensuales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Distribucion de usuarios por estado
            </p>
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usuariosActivos}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usuariosActivos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              {usuariosActivos.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};