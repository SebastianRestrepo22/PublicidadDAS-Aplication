import React from "react";

export default function Calendar({
  selectedDate,
  onDateSelect,
  appointments,
  getAppointmentsForDate,
}) {
  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = [];
  const startDay = firstDayOfMonth.getDay();
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

      <div className="grid grid-cols-7 gap-1 text-center font-semibold">
        <div>D</div><div>L</div><div>M</div><div>M</div>
        <div>J</div><div>V</div><div>S</div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mt-2">
        {daysInMonth.map((day, idx) => {
          if (day === null) return <div key={idx} className="p-2"></div>;

          const isSelected = day.toDateString() === selectedDate.toDateString();
          const appointmentsForDay =
            getAppointmentsForDate ? getAppointmentsForDate(day) : [];

          return (
            <div
              key={idx}
              onClick={() => onDateSelect(day)}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100
                ${appointmentsForDay.length > 0 ? "bg-red-200" : ""}
                ${isSelected ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
              `}
            >
              <div>{day.getDate()}</div>

              {appointmentsForDay.length > 0 && (
                <div className="text-xs text-gray-500">
                  {appointmentsForDay.length} cita
                  {appointmentsForDay.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
