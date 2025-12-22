import React, { useState, useEffect } from "react";

export default function CitaForm({
  appointment,
  appointments,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    client: "",
    service: "",
    status: "pendiente",
    priority: "media",
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title,
        description: appointment.description,
        date: appointment.date.toISOString().split("T")[0],
        time: appointment.time,
        client: appointment.client,
        service: appointment.service,
        status: appointment.status,
        priority: appointment.priority,
      });
    }
  }, [appointment]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalDate = new Date(formData.date);

    // 🔴 Validación anti-duplicados
    const exists = appointments.some(
      (apt) =>
        apt.date.toDateString() === finalDate.toDateString() &&
        apt.time === formData.time &&
        (!appointment || apt.id !== appointment.id)
    );

    if (exists) {
      alert("Ya existe una cita en esa fecha y hora.");
      return;
    }

    onSubmit({
      ...formData,
      date: finalDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Título *</label>
          <input
            className="w-full border p-2 rounded"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <label>Cliente *</label>
          <input
            className="w-full border p-2 rounded"
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Fecha *</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <label>Hora *</label>
          <input
            type="time"
            className="w-full border p-2 rounded"
            value={formData.time}
            onChange={(e) =>
              setFormData({ ...formData, time: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label>Estado</label>
        <select
          className="w-full border p-2 rounded"
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
        >
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded border"
        >
          Cancelar
        </button>
        <button type="submit" className="px-3 py-1 rounded bg-blue-500 text-white">
          {appointment ? "Actualizar" : "Crear"} Cita
        </button>
      </div>
    </form>
  );
}
