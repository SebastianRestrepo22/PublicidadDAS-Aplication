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
import { CarritoCompras } from "../features/carritoCompras/carritoCompras"
import { CarritoProducto } from "../features/carritoCompras/CarritoProductos/carritoProducto"
import { EditarCarritoProducto } from "../features/carritoCompras/CarritoProductos/editarCarritoProducto"
import Agenda from "../features/dashboard/agenda/agenda"
import { Diseño } from "../features/dashboard/categoriadediseño/diseño"
import { RecuperarContrasena } from "../features/landing/login/RecuperarContrasena"
import { RestablecerContrasena } from "../features/landing/login/RestablecerContrasena"
import { Navbarcliente } from "../features/navbarCliente/navbarCliente"
import { Clientehome } from "../features/navbarCliente/clientehome"
import { Compras } from "../features/dashboard/constrolinsumos/compras/compras"
import { PedidosClientes } from "../features/dashboard/gestionventas/pedidos/pedidos"

export const Routers = () => {
    return (
        <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/quienessomos" element={<QuienesSomos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/reset-password/:token" element={<RestablecerContrasena />} />

            <Route path="cliente" element={<Navbarcliente/>}>
                <Route path="Clientehome" element={<Clientehome/>}/>
                
            </Route>

            <Route path="/carritodecompras" element={<CarritoCompras />} />
            <Route path="/carritoproducto" element={<CarritoProducto />} />
            <Route path="/editarcarritoproducto" element={<EditarCarritoProducto />} />

           

            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="graficosEstadisticos" element={<GraficosEstadisticos />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="roles" element={<Roles />} />
                <Route path="compras" element={<Compras/>} />
                <Route path="insumos" element={<Insumos />} />
                <Route path="diseño" element={<Diseño />} />
                <Route path="productoServicio" element={<ProductoServicios />} />
                <Route path="proveedores" element={<Proveedores />} />
                <Route path="pedidos" element={<PedidosClientes/>}/>
                <Route path="categoriaDeDiseño" element={<Diseño/>}/>
                <Route path="agenda" element={<Agenda/>}/>
            </Route>

            {/* 404 */}
            <Route path="*" element={<Error404 />} />
        </Routes>
    )
}
