import express from 'express';
import {
  getAllCompras,
  getCompraById,
  createCompra,
  deleteCompra,
  updateCompra,
  updateCompraEstado,
  getComprasPaginated,
  buscarCompras,
  anularComprasExpiradas
} from '../controllers/compras.controller.js';

const router = express.Router();

//  Ruta principal con paginación
router.get('/', getComprasPaginated);

//  Ruta de búsqueda con paginación
router.get('/buscar', buscarCompras);

//  Ruta para obtener TODAS las compras (sin paginación) - compatibilidad
router.get('/todas', getAllCompras);

//  Rutas CRUD estándar
router.get('/:id', getCompraById);
router.post('/', createCompra);
router.put('/:id', updateCompra);
router.delete('/:id', deleteCompra);
router.patch('/:id/estado', updateCompraEstado);

// 🔥 Ruta para anulación automática de compras expiradas
router.post('/auto-cancelar', async (req, res) => {
  try {
    const resultado = await anularComprasExpiradas();
    res.json({
      message: 'Proceso de anulación automática completado',
      ...resultado
    });
  } catch (error) {
    console.error('Error en anulación automática:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor', 
      details: error.message 
    });
  }
});

export default router;