import React from "react";

export default function CitaList({ appointments, onEdit, onDelete, showDate = false }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay citas programadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="border p-4 rounded hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{appointment.title}</h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-200">{appointment.status}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">{appointment.priority}</span>
              </div>

              {appointment.description && (
                <p className="text-sm text-gray-600">{appointment.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {showDate && <div>{appointment.date.toLocaleDateString("es-ES")}</div>}
                <div>{appointment.time}</div>
                <div>{appointment.client}</div>
                {appointment.service && <div>{appointment.service}</div>}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(appointment)}
                className="px-2 py-1 rounded border text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(appointment.id)}
                className="px-2 py-1 rounded border text-sm text-red-500"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
