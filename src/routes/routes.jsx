import { Route, Routes } from "react-router-dom";
import { Productos } from "../features/landing/nuestrosproductos/productos";
import { QuienesSomos } from "../features/landing/quienessomos/quienesSomos";
import { Login } from "../features/landing/login/login";
import { Insumos } from "../features/dashboard/constrolinsumos/insumos/insumos";
import { Usuarios } from "../features/dashboard/usuarios/usuarios";
import { Roles } from "../features/dashboard/roles/roles";
import { DashboardLayout } from "../features/dashboard/components/dashboardLoyout";
import { Error404 } from "../features/404/error404";
import { GraficosEstadisticos } from "../features/dashboard/dashboard/graficoEstadisticos";
import { RecuperarContrasena } from "../features/landing/login/RecuperarContrasena";
import { RestablecerContrasena } from "../features/landing/login/RestablecerContrasena";
import { CarritoCompras } from "../features/landing/carritoCompras/carritoCompras";
import { PrivateRoute } from "./PrivateRoute";
import { ProtectedRouteAdmin } from "./ProtectedRouteAdmin";
import { Perfil } from "../features/landing/carritoCompras/perfil/perfil";
import MisPedidos from "../features/landing/historial/MisPedidos";
import { Ventas } from "../features/dashboard/gestionventas/venta/ventas";
import { Checkout } from "../features/landing/carritoCompras/checkout/checkout";
import { PedidoExitoso } from "../features/dashboard/gestionventas/pedidos/pedidoExitoso/pedidoExitoso";
import { ScrollToTop } from "../features/landing/components/ScrollToTop";
import { Inicio } from "../features/landing/inicio/inicio";
import { Compras } from "../features/dashboard/constrolinsumos/compras/compras";
import { Proveedores } from "../features/dashboard/constrolinsumos/proveedores/proveedores";
import { Servicios } from "../features/landing/nuestrosservicios/servicios";
import { ServicioDetalle } from "../features/landing/nuestrosservicios/servicioDetalle";
import { ProductosDashboard } from "../features/dashboard/productos/producto";
import { ServiciosDashboard } from "../features/dashboard/servicios/servicio";
import { ProductoDetalle } from "../features/landing/nuestrosproductos/productoDetalle";
import { EditarCarritoServicio } from "../features/landing/carritoCompras/CarritoProductos/editarCarritoServicio";
import { Categorias } from "../features/dashboard/categoriadediseño/categorias";
import { PedidosClientes } from "../features/dashboard/gestionventas/pedidos/pedidosClientes";
import DetallePedido from "../features/landing/historial/detallePedidos";

export const Routers = () => {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/servicios/:id" element={<ServicioDetalle/>} />

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
          path="/cliente/DetallePedido"
          element={
            <PrivateRoute role="cliente">
              <DetallePedido />
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
        <Route path="/editarcarritoservicio" element={<EditarCarritoServicio />} />
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
          <Route path="categorias" element={<Categorias/>} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="roles" element={<Roles />} />
          <Route path="insumos" element={<Insumos />} />
          <Route path="proveedores" element={<Proveedores />} />

          <Route path="producto" element={<ProductosDashboard />} />
          <Route path="producto/nuevo" element={<ProductosDashboard />} />
          <Route path="producto/:id" element={<ProductosDashboard />} />
          <Route path="producto/:id/editar" element={<ProductosDashboard />} />

          <Route path="servicio" element={<ServiciosDashboard />} />
          <Route path="servicio/nuevo" element={<ServiciosDashboard />} />
          <Route path="servicio/:id" element={<ServiciosDashboard />} />
          <Route path="servicio/:id/editar" element={<ServiciosDashboard />} />

          <Route path="ventas" element={<Ventas />} />

          <Route path="pedidosClientes" element={<PedidosClientes />} />
          <Route path="pedidosClientes/nuevo" element={<PedidosClientes />} />
          <Route path="pedidosClientes/:id" element={<PedidosClientes />} />
          <Route path="pedidosClientes/:id/editar" element={<PedidosClientes />} />

          <Route path="compras" element={<Compras />} />
          <Route path="compras/nueva" element={<Compras />} />
          <Route path="compras/:id" element={<Compras />} />
          <Route path="compras/:id/editar" element={<Compras />} />


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