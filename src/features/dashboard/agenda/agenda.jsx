// src/features/dashboard/agenda/Agenda.jsx
import React, { useState, useEffect } from "react";
import Calendar from "./calendar";
import CitaForm from "./cita-form";
import CitaList from "./cita-list";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Agenda() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/cita");
      if (!res.ok) throw new Error("Error al cargar citas");
      const data = await res.json();
      const formatted = data.map((apt) => ({
        ...apt,
        id: apt.citaId, // 🔑 Corrección crítica
        date: new Date(apt.date),
      }));
      setAppointments(formatted);
    } catch (err) {
      toast.error("Error al cargar citas:", err);
      toast.error("No se pudieron cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async (appointmentData) => {
    // Normalizar time a HH:mm si no tiene segundos
    const time = appointmentData.time.length === 5
      ? `${appointmentData.time}:00`
      : appointmentData.time;

    const formatted = {
      ...appointmentData,
      date: appointmentData.date.toISOString().split("T")[0], // YYYY-MM-DD
      time,
    };

    try {
      const res = await fetch("http://localhost:3000/api/cita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Ya existe una cita en esa fecha y hora");
        return;
      }

      toast.success("Cita creada exitosamente");
      setIsFormOpen(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.error("Error al crear cita:", err);
      toast.error("Error inesperado al crear la cita.");
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    const time = appointmentData.time.length === 5
      ? `${appointmentData.time}:00`
      : appointmentData.time;

    const formatted = {
      ...appointmentData,
      date: appointmentData.date.toISOString().split("T")[0],
      time,
    };

    try {
      const res = await fetch(
        `http://localhost:3000/api/cita/${editingAppointment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formatted),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Ya existe otra cita en esa fecha y hora");
        return;
      }

      toast.success("Cita actualizada correctamente");
      setIsFormOpen(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (err) {
      console.error("Error al actualizar cita:", err);
      toast.error("Error inesperado al actualizar la cita.");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!id) {
      toast.error("ID de cita no válido");
      return;
    }
    if (!window.confirm("¿Seguro que deseas eliminar esta cita?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/cita/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Cita eliminada correctamente");
        fetchAppointments();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "No se pudo eliminar la cita.");
      }
    } catch (err) {
      console.error("Error al eliminar cita:", err);
      toast.error("Error de red al eliminar la cita.");
    }
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
    <div className="w-full min-h-screen bg-white px-6 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-gray-500">Gestiona tus citas y recordatorios</p>
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
            Nuevo recordatorio
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

      {/* Contenido principal */}
      {!isFormOpen &&
        (viewMode === "calendar" ? (
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow">
              {loading ? (
                <div className="text-center py-8">Cargando agenda...</div>
              ) : (
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  appointments={appointments}
                  getAppointmentsForDate={getAppointmentsForDate}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            {loading ? (
              <div className="text-center py-8">Cargando lista...</div>
            ) : (
              <CitaList
                appointments={appointments}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
                showDate={true}
              />
            )}
          </div>
        ))}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}