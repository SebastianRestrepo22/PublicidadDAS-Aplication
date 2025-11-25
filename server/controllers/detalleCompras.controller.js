import {
    getAllDetallesModel,
    getDetalleByIdModel,
    getDetalleByCompraIdModel,
    createDetalleModel,
    deleteDetalleModel,
    updateDetalleModel 
} from '../models/detalleCompras.model.js';


//Todo los detalles
export const getAllDetalles = async (req, res) => {
  try {
    const detalles = await getAllDetallesModel();
    res.json(detalles);
  } catch (err) {
    console.error(" Error al obtener detalles:", err.message);
    res.status(500).json({ error: err.message });
  }
};

//detalle x id 
export const getDetalleById = async (req, res) => {
  const id = req.params.id;

  try {
    const detalle = await getDetalleByIdModel(id);
    if (!detalle) return res.status(404).json({ message: "Detalle no encontrado" });
    res.json(detalle);
  } catch (err) {
    console.error(" Error al obtener detalle por ID:", err.message);
    res.status(500).json({ error: err.message });
  }

};

//detalle por id compra
export const getDetalleByCompraId = async (req, res) => {
  const CompraId = req.params.CompraId;

  try {
    const detalles = await getDetalleByCompraIdModel(CompraId);
    res.json(detalles);
  } catch (err) {
    console.error("Error al obtener detalles por compra:" , err.message);
    res.status(500).json({ error: err.message });
  }
};

// nuevo detalle
export const createDetalle = async (req, res) => {
  const { CompraId, TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion } = req.body;

  if (!CompraId || !TipoDetalle || (!ProductoServicioId && !InsumoId) || !Cantidad || !Descripcion) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const result = await createDetalleModel({ CompraId, TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion });
    res.status(201).json(result);
  } catch (err) {
    console.error(" Error al crear el detalle:", err.message);
    res.status(500).json({ error: err.message });
  }
};

//actualizar detalle
export const updateDetalle = async (req, res) => {
  const id = req.params.id;

  const { TipoDetalle, ProductoServicioId, InsumoId, Cantidad, Descripcion } = req.body;


  if (!id || id.length !== 36){
    return res.status(400).json({ error: "ID invalido"})
  }

  try {
    const result = await updateDetalleModel(id, {
      TipoDetalle,
      ProductoServicioId, 
      InsumoId,
      Cantidad,
      Descripcion
    });
    
    if (result.affectedRows === 0 ) {
       return res.status(404).json({ message: "Detalle no encontrado"})
    }
    res.json({ message: "Detalle actualizado correctamente"});

   }catch (err) {
    console.error("Error al actualizar detalle:", err)
    res.status(500).json({ error: err.message})
   }
};

export const deleteDetalle = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await deleteDetalleModel(id);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Detalle no encontrado" });
    }
    res.json({ message: "Detalle eliminado correctamente" });
  } catch (err) {
    console.error(" Error al eliminar detalle:", err.message);
    res.status(500).json({ error: err.message });
  }
};





  
