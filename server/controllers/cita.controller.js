import {
  getAllCitas,
  getCitaById,
  createCita,
  updateCita,
  deleteCita
} from '../models/cita.model.js';

export const obtenerCitas = async (req, res) => {
  try {
    const citas = await getAllCitas();
    res.json(citas);
  } catch {
    res.status(500).json({ message: "Error al obtener citas" });
  }
};

export const obtenerCita = async (req, res) => {
  try {
    const cita = await getCitaById(req.params.id);

    if (!cita)
      return res.status(404).json({ message: "Cita no encontrada" });

    res.json(cita);
  } catch {
    res.status(500).json({ message: "Error al obtener la cita" });
  }
};

export const crearCita = async (req, res) => {
  try {
    const result = await createCita(req.body);

    if (result.error === 'duplicate')
      return res.status(400).json({ message: "Ya existe una cita en esa fecha y hora" });

    res.json({ message: "Cita creada correctamente", citaId: result.citaId });
  } catch {
    res.status(500).json({ message: "Error al crear cita" });
  }
};

export const actualizarCita = async (req, res) => {
  try {
    const result = await updateCita(req.params.id, req.body);

    if (result.error === 'duplicate')
      return res.status(400).json({ message: "Ya existe otra cita en esa fecha y hora" });

    res.json({ message: "Cita actualizada" });
  } catch {
    res.status(500).json({ message: "Error al actualizar cita" });
  }
};

export const eliminarCita = async (req, res) => {
  try {
    await deleteCita(req.params.id);
    res.json({ message: "Cita eliminada" });
  } catch {
    res.status(500).json({ message: "Error al eliminar cita" });
  }
};
