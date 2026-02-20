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
import { Clientes } from "../features/dashboard/clientes/clientes";
import { SinAcceso } from "../features/dashboard/SinAcceso/SinAcceso";
import { RequirePermission } from "../components/RequirePermission";

export const Routers = () => {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:id" element={<ProductoDetalle />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/servicios/:id" element={<ServicioDetalle />} />

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
          {/* Ruta de sin acceso */}
          <Route path="sin-acceso" element={<SinAcceso />} />
          
          {/* Rutas protegidas por permisos */}
          <Route 
            path="graficosEstadisticos" 
            element={
              <RequirePermission permission="ver_dashboard">
                <GraficosEstadisticos />
              </RequirePermission>
            } 
          />
          
          <Route 
            path="categorias" 
            element={
              <RequirePermission permission="ver_categorias">
                <Categorias />
              </RequirePermission>
            } 
          />
          
          <Route 
            path="usuarios" 
            element={
              <RequirePermission permission="ver_usuarios">
                <Usuarios />
              </RequirePermission>
            } 
          />
          
          <Route 
            path="roles" 
            element={
              <RequirePermission permission="ver_roles">
                <Roles />
              </RequirePermission>
            } 
          />
          
          <Route 
            path="insumos" 
            element={
              <RequirePermission permission="ver_insumos">
                <Insumos />
              </RequirePermission>
            } 
          />
          
          <Route 
            path="proveedores" 
            element={
              <RequirePermission permission="ver_proveedores">
                <Proveedores />
              </RequirePermission>
            } 
          />

          <Route 
            path="producto" 
            element={
              <RequirePermission permission="ver_productos">
                <ProductosDashboard />
              </RequirePermission>
            } 
          />
          <Route path="producto/nuevo" element={
            <RequirePermission permission="ver_productos">
              <ProductosDashboard />
            </RequirePermission>
          } />
          <Route path="producto/:id" element={
            <RequirePermission permission="ver_productos">
              <ProductosDashboard />
            </RequirePermission>
          } />
          <Route path="producto/:id/editar" element={
            <RequirePermission permission="ver_productos">
              <ProductosDashboard />
            </RequirePermission>
          } />

          <Route 
            path="servicio" 
            element={
              <RequirePermission permission="ver_servicios">
                <ServiciosDashboard />
              </RequirePermission>
            } 
          />
          <Route path="servicio/nuevo" element={
            <RequirePermission permission="ver_servicios">
              <ServiciosDashboard />
            </RequirePermission>
          } />
          <Route path="servicio/:id" element={
            <RequirePermission permission="ver_servicios">
              <ServiciosDashboard />
            </RequirePermission>
          } />
          <Route path="servicio/:id/editar" element={
            <RequirePermission permission="ver_servicios">
              <ServiciosDashboard />
            </RequirePermission>
          } />

          <Route 
            path="ventas" 
            element={
              <RequirePermission permission="ver_ventas">
                <Ventas />
              </RequirePermission>
            } 
          />
          <Route path="ventas/nuevo" element={
            <RequirePermission permission="ver_ventas">
              <Ventas />
            </RequirePermission>
          } />
          <Route path="ventas/:id" element={
            <RequirePermission permission="ver_ventas">
              <Ventas />
            </RequirePermission>
          } />
          <Route path="ventas/:id/editar" element={
            <RequirePermission permission="ver_ventas">
              <Ventas />
            </RequirePermission>
          } />

          <Route 
            path="clientes" 
            element={
              <RequirePermission permission="ver_clientes">
                <Clientes />
              </RequirePermission>
            } 
          />

          <Route 
            path="pedidosClientes" 
            element={
              <RequirePermission permission="ver_pedidos">
                <PedidosClientes />
              </RequirePermission>
            } 
          />
          <Route path="pedidosClientes/nuevo" element={
            <RequirePermission permission="ver_pedidos">
              <PedidosClientes />
            </RequirePermission>
          } />
          <Route path="pedidosClientes/:id" element={
            <RequirePermission permission="ver_pedidos">
              <PedidosClientes />
            </RequirePermission>
          } />
          <Route path="pedidosClientes/:id/editar" element={
            <RequirePermission permission="ver_pedidos">
              <PedidosClientes />
            </RequirePermission>
          } />

          <Route 
            path="compras" 
            element={
              <RequirePermission permission="ver_compras">
                <Compras />
              </RequirePermission>
            } 
          />
          <Route path="compras/nueva" element={
            <RequirePermission permission="ver_compras">
              <Compras />
            </RequirePermission>
          } />
          <Route path="compras/:id" element={
            <RequirePermission permission="ver_compras">
              <Compras />
            </RequirePermission>
          } />
          <Route path="compras/:id/editar" element={
            <RequirePermission permission="ver_compras">
              <Compras />
            </RequirePermission>
          } />
        </Route>

        {/* Página no encontrada */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </ScrollToTop>
  );
};