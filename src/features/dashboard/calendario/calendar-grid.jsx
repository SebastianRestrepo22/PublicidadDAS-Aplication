// src/features/dashboard/calendario/calendar-grid.jsx
import React from "react";

// Opcional: si no tienes tu propia función cn (classNames), 
// podemos hacerla aquí (concatena clases)
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarGrid({ currentDate, events, onDateClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Primer y último día del mes
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Días del mes anterior para completar la cuadrícula
  const prevMonth = new Date(year, month - 1, 0);
  const daysFromPrevMonth = startingDayOfWeek;

  // Total de celdas
  const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
  const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;

  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const isCurrentMonth = (date) =>
    date.getMonth() === month && date.getFullYear() === year;

  const getEventsForDate = (date) =>
    events.filter((event) => {
      // nos aseguramos que la fecha del evento sea Date
      const evDate =
        event.date instanceof Date ? event.date : new Date(event.date);
      return evDate.toDateString() === date.toDateString();
    });

  // Generar días para la cuadrícula
  const calendarDays = [];

  // Días del mes anterior
  for (let i = daysFromPrevMonth; i > 0; i--) {
    calendarDays.push(
      new Date(year, month - 1, prevMonth.getDate() - i + 1)
    );
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Días del mes siguiente
  for (let day = 1; day <= daysFromNextMonth; day++) {
    calendarDays.push(new Date(year, month + 1, day));
  }

  return (
    <div className="w-full">
      {/* Encabezado de días */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Cuadrícula de calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={cn(
                "min-h-[80px] p-2 border border-border/50 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                !isCurrentMonthDay && "bg-slate-50 dark:bg-slate-800/50",
                isTodayDate && "bg-primary/10 border-primary/30",
                "group"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isTodayDate && "text-primary font-semibold",
                  !isCurrentMonthDay && "text-slate-500 dark:text-slate-400",
                  isCurrentMonthDay &&
                    !isTodayDate &&
                    "text-slate-900 dark:text-slate-100"
                )}
              >
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-xs px-2 py-1 rounded text-white truncate",
                      event.category === "trabajo"
                        ? "bg-primary"
                        : "bg-accent"
                    )}
                    title={`${event.title} - ${event.time}`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 px-2">
                    +{dayEvents.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
