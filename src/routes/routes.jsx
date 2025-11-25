import { Route, Routes } from "react-router-dom"
import { Inicio } from "../features/landing/inicio/inicio"
import { Productos } from "../features/landing/nuestrosproductos/productos"
import { Servicios } from "../features/landing/nuestrosproductos/servicios"
import { QuienesSomos } from "../features/landing/quienessomos/quienesSomos"
import { Login } from "../features/landing/login/login"
import { Insumos } from "../features/dashboard/constrolinsumos/insumos/insumos"
import { ProductoServicios } from "../features/dashboard/servicios/productoServicios"
import { Proveedores } from "../features/dashboard/constrolinsumos/proveedores/proveedores"
import { Usuarios } from "../features/dashboard/usuarios/usuarios"
import { Roles } from "../features/dashboard/roles/roles"
import { DashboardLayout } from "../features/dashboard/components/dashboardLoyout"
import { Error404 } from "../features/404/error404"
import { GraficosEstadisticos } from "../features/dashboard/dashboard/graficoEstadisticos"
import Agenda from "../features/dashboard/agenda/agenda"
import { Diseño } from "../features/dashboard/categoriadediseño/diseño"
import { RecuperarContrasena } from "../features/landing/login/RecuperarContrasena"
import { RestablecerContrasena } from "../features/landing/login/RestablecerContrasena"
import { Navbarcliente } from "../features/navbarCliente/navbarCliente"
import { Clientehome } from "../features/navbarCliente/clientehome"
import { Compras } from "../features/dashboard/constrolinsumos/compras/compras"
import { PedidosClientes } from "../features/dashboard/gestionventas/pedidos/pedidos"
import { Compras } from "../features/dashboard/compras/compras"
// import { Navbarcliente } from "../features/navbarCliente/navbarCliente"
// import { Clientehome } from "../features/navbarCliente/clientehome"
import { Pedidos } from "../features/dashboard/gestionventas/pedidos/pedidos"
import { CarritoCompras } from "../features/landing/carritoCompras/carritoCompras"
import { EditarCarritoProducto } from "../features/landing/carritoCompras/CarritoProductos/editarCarritoProducto"
import { CarritoProducto } from "../features/landing/carritoCompras/CarritoProductos/carritoProducto"
import { PrivateRoute } from "./PrivateRoute"
import { ProtectedRouteAdmin } from "./ProtectedRouteAdmin"
import { Perfil } from "../features/landing/carritoCompras/perfil/perfil"

export const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/servicios" element={<Servicios />} />

            <Route path="/cliente/productos" element={
                <PrivateRoute role="cliente">
                    <Productos />
                </PrivateRoute>
            } />
            <Route path="/cliente/servicios" element={
                <PrivateRoute role="cliente">
                    <Servicios />
                </PrivateRoute>
            } />

            <Route path="/quienessomos" element={<QuienesSomos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/reset-password/:token" element={<RestablecerContrasena />} />
            <Route path="/carritodecompras" element={<CarritoCompras />} />
            <Route path="/carritoproducto" element={<CarritoProducto />} />
            <Route path="/editarcarritoproducto" element={<EditarCarritoProducto />} />
             <Route path="/cliente/perfil" element={
                <PrivateRoute role="cliente">
                    <Perfil />
                </PrivateRoute>
            } />

            <Route path="/dashboard" element={
                <ProtectedRouteAdmin>
                    <DashboardLayout />
                </ProtectedRouteAdmin>
            }>
                <Route path="graficosEstadisticos" element={<GraficosEstadisticos />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="roles" element={<Roles />} />
                <Route path="compras" element={<Compras />} />
                <Route path="insumos" element={<Insumos />} />
                <Route path="diseño" element={<Diseño />} />
                <Route path="productoServicio" element={<ProductoServicios />} />
                <Route path="proveedores" element={<Proveedores />} />
                <Route path="pedidos" element={<PedidosClientes/>}/>
                <Route path="categoriaDeDiseño" element={<Diseño/>}/>
                <Route path="agenda" element={<Agenda/>}/>
                <Route path="pedidos" element={<Pedidos />} />
                <Route path="categoriaDeDiseño" element={<Diseño />} />
                <Route path="agenda" element={<Agenda />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Error404 />} />
        </Routes>
    )
}
