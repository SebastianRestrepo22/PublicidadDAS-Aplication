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
} from "recharts";
import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react";

export const GraficosEstadisticos = () => {
  // Estados para manejar los datos
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
    
    // Ajusta la URL según tu backend
    const response = await fetch('http://localhost:3001/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Si necesitas autenticación:
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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

  // Extraemos los datos para usarlos en los gráficos
  const { ventasMensuales, ventasSemanales, pedidosSemanales, usuariosActivos, totales } = datos;

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
              <ShoppingCart className="h-4 w-4"/>
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
              <Package className="h-4 w-4"/>
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
              <Users className="h-4 w-4"/>
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
              <TrendingUp className="h-4 w-4"/>
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
          {/* Gráfico de Ventas Mensuales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas mensuales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Ventas por mes en el último semestre
            </p>
            <BarChart width={400} height={300} data={ventasMensuales}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="mes"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>

          {/* Gráfico de Ventas Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Tendencia de ventas por semana 
            </p>
            <LineChart width={400} height={300} data={ventasSemanales}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="semana"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={3} dot={{fill: "#3b82f6", strokeWidth: 2, r: 4}}/>
            </LineChart>
          </div>

          {/* Gráfico de Pedidos Semanales */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Pedidos semanales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Volumen de pedidos por semana 
            </p>
            <AreaChart width={400} height={300} data={pedidosSemanales}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="semana"/>
              <YAxis/>
              <Tooltip/>
              <Area 
                type="monotone"
                dataKey="pedidos"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </div>

          {/* Gráfico de Usuarios */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Usuarios activos mensuales</h2>
            <p className="text-sm text-gray-500 mb-4">
              Distribucion de usuarios por estado 
            </p>
            <PieChart width={400} height={300}>
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
                  <Cell key={`cell-${index}`} fill={entry.color}/>
                ))}
              </Pie>
            </PieChart>

            <div className="flex justify-center gap-4 mt-4">
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