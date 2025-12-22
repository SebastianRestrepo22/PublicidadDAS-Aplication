// src/features/dashboard/agenda/calendar.jsx
import React from "react";

export default function Calendar({
  selectedDate,
  onDateSelect,
  appointments,
  getAppointmentsForDate,
}) {
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = [];
  const startDay = firstDayOfMonth.getDay(); // 0 = domingo
  const totalDays = lastDayOfMonth.getDate();

  for (let i = 0; i < startDay; i++) daysInMonth.push(null);
  for (let d = 1; d <= totalDays; d++) {
    daysInMonth.push(new Date(year, month, d));
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onDateSelect(new Date(year, month - 1, 1))}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          &lt;
        </button>

        <h2 className="font-semibold">
          {monthNames[month]} {year}
        </h2>

        <button
          onClick={() => onDateSelect(new Date(year, month + 1, 1))}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600">
        <div>D</div><div>L</div><div>M</div><div>M</div>
        <div>J</div><div>V</div><div>S</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mt-2">
        {daysInMonth.map((day, idx) => {
          if (day === null) return <div key={idx} className="p-2"></div>;

          const isSelected = day.toDateString() === selectedDate.toDateString();
          const appointmentsForDay = getAppointmentsForDate ? getAppointmentsForDate(day) : [];

          return (
            <div
              key={idx}
              onClick={() => onDateSelect(day)}
              className={`p-2 rounded cursor-pointer relative
                ${isSelected 
                  ? "bg-blue-600 text-white" 
                  : appointmentsForDay.length > 0 
                    ? "bg-red-50 hover:bg-red-100" 
                    : "hover:bg-gray-100"}
              `}
            >
              <div className="font-medium">{day.getDate()}</div>

              {/* Mostrar descripciones breves de las citas */}
              {appointmentsForDay.length > 0 && (
                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                  {appointmentsForDay.map((apt, i) => (
                    <div
                      key={i}
                      className={`text-xs px-1 py-0.5 rounded truncate
                        ${isSelected ? "bg-white text-blue-800" : "bg-red-100 text-red-800"}
                      `}
                      title={apt.descripcion || "Sin descripción"}
                    >
                      {apt.descripcion?.slice(0, 20) || "Cita"}
                      {apt.descripcion && apt.descripcion.length > 20 ? "…" : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}