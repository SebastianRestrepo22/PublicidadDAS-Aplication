import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import  proveedorRoutes from './routes/proveedores.routes.js';
import insumosRoutes from './routes/insumos.routes.js';
import categoriaRoutes from './routes/categoria.routes.js';
import comprasRoutes from './routes/compras.routes.js';
import pedidoClienteRoutes from "./routes/pedidoCliente.routes.js";
import detallePedidoClienteRoutes from "./routes/detallePedidoCliente.routes.js";
import citaRoutes from "./routes/cita.routes.js";



// Importar archivo para crear usuario
import { initRolesAndAdmin } from './scripts/initRolesAndAdmin.js';

// Routers
import authRouter from './routes/authRoutes.js';
import roleRouter from './routes/role.routes.js';
import userRouter from './routes/user.routes.js'
import serviceRouter from './routes/service.routes.js'
import tipoDocumentoRoutes from './routes/tipoDocumento.js';

// DB
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/auth', authRouter);

app.use('/roles', roleRouter);
app.use('/user', userRouter);
app.use('/service', serviceRouter);
app.use('/tipos-documento', tipoDocumentoRoutes);

app.use('/api/categorias', categoriaRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/insumos', insumosRoutes)
app.use('/api/compras', comprasRoutes)
app.use("/api/pedidos-clientes", pedidoClienteRoutes);
app.use("/api/detalle-pedido", detallePedidoClienteRoutes);
app.use("/api/cita", citaRoutes)


const startServer = async () => {
  try {
    const connection = await connectDB(); // Conecta a la DB
    // Inicializar roles y usuario administrador
    await initRolesAndAdmin();
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
  }
};

startServer();




