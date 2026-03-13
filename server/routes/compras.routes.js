import express from 'express';
import {
  getAllCompras,
  getCompraById,
  createCompra,
  deleteCompra,
  updateCompra,
  updateCompraEstado,
  // 🔥 Nuevas funciones importadas
  getComprasPaginated,
  buscarCompras
} from '../controllers/compras.controller.js';

const router = express.Router();

// 🔥 Ruta principal con paginación (GET /api/compras)
router.get('/', getComprasPaginated);

// 🔥 Ruta de búsqueda con paginación (GET /api/compras/buscar)
router.get('/buscar', buscarCompras);

// 📌 Ruta para obtener TODAS las compras (sin paginación) - para compatibilidad
router.get('/todas', getAllCompras);

// Rutas CRUD (específicas después de las rutas con parámetros)
router.get('/:id', getCompraById);
router.post('/', createCompra);
router.put('/:id', updateCompra);
router.delete('/:id', deleteCompra);
router.patch('/:id/estado', updateCompraEstado);

// Ruta para anulación automática
router.post('/auto-cancelar', async (req, res) => {
  try {
    const resultado = await anularComprasExpiradas();
    res.json({
      message: 'Proceso de anulación automática completado',
      ...resultado
    });
  } catch (error) {
    console.error('Error en anulación automática:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;