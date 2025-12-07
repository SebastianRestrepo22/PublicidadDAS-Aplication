import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Search, Clock, MapPin, Printer } from "lucide-react";

import CalendarGrid from "./calendar-grid";
import EventDialog from "./event-dialog";

// Meses en español
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// Eventos de ejemplo
const SAMPLE_EVENTS = [
  {
    id: "1",
    title: "Instalación Valla Publicitaria",
    date: new Date(2024, 11, 15),
    time: "09:00",
    category: "instalacion",
    description: "Centro Comercial Plaza Norte - Valla 6x3m",
  },
  {
    id: "2",
    title: "Entrega Folletos Promocionales",
    date: new Date(2024, 11, 18),
    time: "14:30",
    category: "entrega",
    description: "5,000 folletos para campaña navideña",
  },
  {
    id: "3",
    title: "Instalación Letrero Corporativo",
    date: new Date(2024, 11, 20),
    time: "10:00",
    category: "instalacion",
    description: "Oficinas empresariales - Letrero LED",
  },
  {
    id: "4",
    title: "Revisión Impresión Catálogos",
    date: new Date(2024, 11, 22),
    time: "16:00",
    category: "revision",
    description: "Control de calidad - 2,000 catálogos",
  },
];

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsEventDialogOpen(true);
  };

  const handleAddEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    setIsEventDialogOpen(false);
  };

  const upcomingEvents = events
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case "instalacion":
        return <MapPin className="h-3 w-3" />;
      case "entrega":
        return <Printer className="h-3 w-3" />;
      case "revision":
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getCategoryVariant = (category) => {
    switch (category) {
      case "instalacion":
        return "default";
      case "entrega":
        return "secondary";
      case "revision":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Agenda de Instalaciones
            </h1>
            <p className="text-muted-foreground text-lg">
              Gestiona instalaciones y entregas de tu litografía
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar instalaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-primary/20 focus:border-primary/40"
              />
            </div>
            <Button
              onClick={() => setIsEventDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Instalación
            </Button>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-xl lg:col-span-3">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  {MONTHS[currentMonth]} {currentYear}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="text-sm px-4 hover:bg-primary/10"
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="h-9 w-9 p-0 hover:bg-primary/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CalendarGrid
                currentDate={currentDate}
                events={filteredEvents}
                onDateClick={handleDateClick}
              />
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-xl">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                Próximas Instalaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Printer className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No hay instalaciones programadas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm text-card-foreground leading-tight">
                            {event.title}
                          </h4>
                          <Badge
                            variant={getCategoryVariant(event.category)}
                            className="text-xs shrink-0 ml-2"
                          >
                            <span className="flex items-center gap-1">
                              {getCategoryIcon(event.category)}
                              {event.category}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {event.date.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            - {event.time}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onAddEvent={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  );
}
