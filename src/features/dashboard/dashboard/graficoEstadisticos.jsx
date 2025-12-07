"use client";

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


const ventasMensuales = [
  { mes: "Ene", ventas: 65 },
  { mes: "Feb", ventas: 59 },
  { mes: "Mar", ventas: 80 },
  { mes: "Abr", ventas: 81 },
  { mes: "May", ventas: 56 },
  { mes: "Jun", ventas: 55 },
];

const ventasSemanales = [
  { semana: "S1", ventas: 20 },
  { semana: "S2", ventas: 35 },
  { semana: "S3", ventas: 25 },
  { semana: "S4", ventas: 45 },
  { semana: "S5", ventas: 30 },
  { semana: "S6", ventas: 55 },
];

const pedidosSemanales = [
  { semana: "S1", pedidos: 15 },
  { semana: "S2", pedidos: 25 },
  { semana: "S3", pedidos: 35 },
  { semana: "S4", pedidos: 28 },
  { semana: "S5", pedidos: 40 },
  { semana: "S6", pedidos: 32 },
];

const usuariosActivos = [
  { name: "Nuevos", value: 35, color: "#3b82f6" },
  { name: "Activos", value: 45, color: "#10b981" },
  { name: "Inactivos", value: 20, color: "#f59e0b" },
];

export const GraficosEstadisticos = () => {
  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Ventas Totales</span>
              <ShoppingCart className="h-4 w-4"/>
            </div>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-blue-100">+20.1% desde el mes pasado</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Pedidos</span>
              <Package className="h-4 w-4"/>
            </div>
            <div className="text-2xl font-bold ">2,350</div>
            <p className="text-xs text-green-100">+180.1% desde el mes pasado</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-while rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2 ">
              <span className="text-sm font-medium">Usuarios Activos</span>
              <Users className="h-4 w-4"/>
            </div>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-yellow-100">+19% desde el mes pasado</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-medium">Crecimiento</span>
              <TrendingUp className="h-4 w-4"/>
            </div>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-purple-100">
              +2.5% desde la semana pasada
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-bold">Ventas mensuales</h2>
            <p className="text-sm text-grey-500 mb-4">
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
    </>
  )
}