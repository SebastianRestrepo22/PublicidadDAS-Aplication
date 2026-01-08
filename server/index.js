import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Rutas de negocio
import proveedorRoutes from './routes/proveedores.routes.js';
import insumosRoutes from './routes/insumos.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import comprasRoutes from './routes/compras.routes.js';
import detalleComprasRoutes from './routes/detalleCompras.routes.js';
import pedidoClienteRoutes from "./routes/pedidoCliente.routes.js";
import detallePedidoClienteRoutes from "./routes/detallePedidoCliente.routes.js";
import detalleProduccionRoutes from "./routes/detalleProduccion.routes.js";
import produccionRoutes from "./routes/produccion.routes.js";
import ventasRoutes from "./routes/venta.routes.js";
import detalleVentasRoutes from "./routes/detalleVentas.routes.js"
import voucherRoutes from './routes/voucher.routes.js';
// Rutas de autenticación y usuarios
import authRouter from './routes/authRoutes.js';
import roleRouter from './routes/role.routes.js';
import userRouter from './routes/user.routes.js';
import serviceRouter from './routes/service.routes.js';
import tipoDocumentoRoutes from './routes/tipoDocumento.js';

// Scripts y DB
import { initRolesAndAdmin } from './scripts/initRolesAndAdmin.js';
import connectDB from './lib/db.js';
dotenv.config();

const app = express();

// Middlewares generales
app.use(cors());
app.use(express.json());

//  Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  Servir archivos estáticos (comprobantes de pago)
app.use('/comprobantes', express.static(path.join(__dirname, '../public/comprobantes')));

// Rutas de autenticación
app.use('/auth', authRouter);
app.use('/roles', roleRouter);
app.use('/user', userRouter);
app.use('/service', serviceRouter);
app.use('/tipos-documento', tipoDocumentoRoutes);

// Rutas de negocio
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/detalle-compras', detalleComprasRoutes);
app.use("/api/pedidos-clientes", pedidoClienteRoutes);
app.use("/api/detalle-pedido", detallePedidoClienteRoutes);
app.use("/api/detalle-produccion", detalleProduccionRoutes);
app.use("/api/produccion", produccionRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/detalle-ventas", detalleVentasRoutes);
app.use('/api/voucher', voucherRoutes);
app.use(express.static("public")); 
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    await initRolesAndAdmin();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(` Server is running on port ${port}`);
    });
  } catch (err) {
    console.error(' Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

startServer();