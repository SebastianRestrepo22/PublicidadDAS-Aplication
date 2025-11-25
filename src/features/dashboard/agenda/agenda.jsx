import React, { useState, useEffect } from "react";
import Calendar from "./calendar";
import CitaForm from "./cita-form";
import CitaList from "./cita-list";

export default function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");

  // 🔵 Cargar citas desde backend
  useEffect(() => {
    fetch("http://localhost:4000/citas")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((apt) => ({
          ...apt,
          date: new Date(apt.date), // convierte sea el formato que sea
        }));
        setAppointments(formatted);
      })
      .catch((err) => console.error("Error al cargar citas:", err));
  }, []);

  // 🔵 Crear cita (validación incluida)
  const handleCreateAppointment = async (appointmentData) => {
    const formatted = {
      ...appointmentData,
      date: appointmentData.date.toISOString().split("T")[0],
    };

    const res = await fetch("http://localhost:4000/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formatted),
    });

    if (!res.ok) {
      alert("Ya existe una cita en esa fecha y hora");
      return;
    }

    window.location.reload();
  };

  // 🔵 Actualizar cita
  const handleUpdateAppointment = async (appointmentData) => {
    const formatted = {
      ...appointmentData,
      date: appointmentData.date.toISOString().split("T")[0],
    };

    const res = await fetch(
      `http://localhost:4000/citas/${editingAppointment.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      }
    );

    if (!res.ok) {
      alert("Ya existe otra cita en esa fecha y hora");
      return;
    }

    window.location.reload();
  };

  // 🔵 Eliminar cita
  const handleDeleteAppointment = async (id) => {
    await fetch(`http://localhost:4000/citas/${id}`, { method: "DELETE" });
    window.location.reload();
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(
      (apt) => apt.date.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="w-full min-h-screen bg-white px-8 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-gray-500">Gestiona tus citas y trabajos</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === "calendar"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Calendario
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Lista
            </button>
          </div>

          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Nueva cita
          </button>
        </div>
      </div>

      {/* Modal formulario */}
      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingAppointment ? "Editar Cita" : "Nueva Cita"}
            </h2>
            <CitaForm
              appointment={editingAppointment}
              appointments={appointments}
              onSubmit={
                editingAppointment
                  ? handleUpdateAppointment
                  : handleCreateAppointment
              }
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAppointment(null);
              }}
            />
          </div>
        </div>
      )}

      {!isFormOpen &&
        (viewMode === "calendar" ? (
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                appointments={appointments}
                getAppointmentsForDate={getAppointmentsForDate}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <CitaList
              appointments={appointments}
              onEdit={handleEditAppointment}
              onDelete={handleDeleteAppointment}
              showDate={true}
            />
          </div>
        ))}
    </div>
  );
}
