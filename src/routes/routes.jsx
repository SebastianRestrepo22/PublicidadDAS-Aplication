import { Route, Routes } from "react-router-dom";
import { Productos } from "../features/landing/nuestrosproductos/productos";
import { Servicios } from "../features/landing/nuestrosproductos/servicios";
import { QuienesSomos } from "../features/landing/quienessomos/quienesSomos";
import { Login } from "../features/landing/login/login";
import { Insumos } from "../features/dashboard/constrolinsumos/insumos/insumos";
import { ProductoServicios } from "../features/dashboard/servicios/productoServicios";
import { Proveedores } from "../features/dashboard/constrolinsumos/proveedores/proveedores";
import { Usuarios } from "../features/dashboard/usuarios/usuarios";
import { Roles } from "../features/dashboard/roles/roles";
import { DashboardLayout } from "../features/dashboard/components/dashboardLoyout";
import { Error404 } from "../features/404/error404";
import { GraficosEstadisticos } from "../features/dashboard/dashboard/graficoEstadisticos";
import Agenda from "../features/dashboard/agenda/agenda";
import { Diseño } from "../features/dashboard/categoriadediseño/diseño";
import { RecuperarContrasena } from "../features/landing/login/RecuperarContrasena";
import { RestablecerContrasena } from "../features/landing/login/RestablecerContrasena";
import { CarritoCompras } from "../features/landing/carritoCompras/carritoCompras";
import { EditarCarritoProducto } from "../features/landing/carritoCompras/CarritoProductos/editarCarritoProducto";
import { CarritoProducto } from "../features/landing/carritoCompras/CarritoProductos/carritoProducto";
import { PrivateRoute } from "./PrivateRoute";
import { ProtectedRouteAdmin } from "./ProtectedRouteAdmin";
import { Perfil } from "../features/landing/carritoCompras/perfil/perfil";
import MisPedidos from "../features/landing/historial/MisPedidos";
import { PedidosClientes } from "../features/dashboard/gestionventas/pedidos/pedidosClientes";
import { Compras } from "../features/dashboard/constrolinsumos/compras/compras";
import { Ventas } from "../features/dashboard/gestionventas/venta/ventas";
import { Produccion } from "../features/dashboard/gestionventas/produccion/produccion";
import { Checkout } from "../features/landing/carritoCompras/checkout/checkout";
import { PedidoExitoso } from "../features/dashboard/gestionventas/pedidos/pedidoExitoso/pedidoExitoso";
import { ScrollToTop } from "../features/landing/components/ScrollToTop";
import Comprobante from "../features/dashboard/comprobantes/comprobante";
import { Inicio } from "../features/landing/inicio/inicio";

export const Routers = () => {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/servicios" element={<Servicios />} />

        {/* Rutas cliente protegidas */}
        <Route
          path="/cliente/productos"
          element={
            <PrivateRoute role="cliente">
              <Productos />
            </PrivateRoute>
          }
        />
        <Route
          path="/cliente/servicios"
          element={
            <PrivateRoute role="cliente">
              <Servicios />
            </PrivateRoute>
          }
        />
        <Route
          path="/cliente/MisPedidos"
          element={
            <PrivateRoute role="cliente">
              <MisPedidos />
            </PrivateRoute>
          }
        />
        <Route
          path="/cliente/perfil"
          element={
            <PrivateRoute role="cliente">
              <Perfil />
            </PrivateRoute>
          }
        />

        {/* Autenticación */}
        <Route path="/quienessomos" element={<QuienesSomos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/reset-password/:token" element={<RestablecerContrasena />} />
        <Route path="/carritodecompras" element={<CarritoCompras />} />
        <Route path="/carritoproducto" element={<CarritoProducto />} />
        <Route path="/editarcarritoproducto" element={<EditarCarritoProducto />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/pedido-exitoso"
          element={
            <PrivateRoute role="cliente">
              <PedidoExitoso />
            </PrivateRoute>
          }
        />


        {/* Dashboard Admin */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRouteAdmin>
              <DashboardLayout />
            </ProtectedRouteAdmin>
          }
        >
          <Route path="graficosEstadisticos" element={<GraficosEstadisticos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="roles" element={<Roles />} />
          <Route path="insumos" element={<Insumos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="productoServicio" element={<ProductoServicios />} />
          <Route path="diseño" element={<Diseño />} />
          <Route path="categoriaDeDiseño" element={<Diseño />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="pedidosClientes" element={<PedidosClientes />} />
          <Route path="pedidosClientes/nuevo" element={<PedidosClientes />} />
          <Route path="pedidosClientes/:id" element={<PedidosClientes />} />
          <Route path="pedidosClientes/:id/editar" element={<PedidosClientes />} />
          <Route path="compras" element={<Compras />} />
          <Route path="compras/nueva" element={<Compras />} />
          <Route path="compras/:id" element={<Compras />} />
          <Route path="compras/:id/editar" element={<Compras />} />
          <Route path="produccion" element={<Produccion />} />
          <Route path="produccion/nuevo" element={<Produccion />} />
          <Route path="produccion/:id" element={<Produccion />} />
          <Route path="produccion/:id/editar" element={<Produccion />} />
          <Route path="comprobante" element={<Comprobante />} />
          <Route path="comprobante" element={<Comprobante />} />
          <Route path="ventas/nuevo" element={<Ventas />} />
          <Route path="ventas/:id" element={<Ventas />} />
          <Route path="ventas/:id/editar" element={<Ventas />} />


        </Route>

        {/* Página no encontrada */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </ScrollToTop>
  );
};