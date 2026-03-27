import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const parseFechaUTC = (fechaStr) => {
  if (!fechaStr) return new Date(NaN);
  // Si ya tiene zona, lo dejamos
  if (fechaStr.includes('Z') || fechaStr.includes('+') || fechaStr.includes('-')) {
    return new Date(fechaStr);
  }
  // Caso común: "2025-04-08 15:30:00" → añadir 'Z' para UTC
  return new Date(fechaStr.replace(' ', 'T') + 'Z');
};

export const TiempoRestanteAnulacion = ({ fechaVenta, onAnular }) => {
  const [tiempoRestante, setTiempoRestante] = useState('');
  const [puedeAnular, setPuedeAnular] = useState(true);

  useEffect(() => {
    const calcularTiempo = () => {
      const fechaVentaDate = parseFechaUTC(fechaVenta);
      const ahora = new Date();
      const diferenciaMs = ahora - fechaVentaDate;
      const TIEMPO_LIMITE_HORAS = 1;
      
      if (isNaN(diferenciaMs) || diferenciaMs > TIEMPO_LIMITE_HORAS * 60 * 60 * 1000) {
        setTiempoRestante('Expirado');
        setPuedeAnular(false);
      } else {
        const minutosRestantes = Math.floor((TIEMPO_LIMITE_HORAS * 60 * 60 * 1000 - diferenciaMs) / (1000 * 60));
        const horas = Math.floor(minutosRestantes / 60);
        const minutos = minutosRestantes % 60;
        setTiempoRestante(horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`);
        setPuedeAnular(true);
      }
    };

    calcularTiempo();
    const intervalo = setInterval(calcularTiempo, 60000);
    return () => clearInterval(intervalo);
  }, [fechaVenta]);

  if (!puedeAnular) {
    return (
      <button
        disabled
        className="p-2 text-gray-400 cursor-not-allowed"
        title="Tiempo de anulación expirado (1 hora)"
      >
        <Clock size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={onAnular}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
      title={`Tiempo restante: ${tiempoRestante}`}
    >
      <Clock size={18} />
      {tiempoRestante && (
        <span className="text-xs font-medium">{tiempoRestante}</span>
      )}
    </button>
  );
};