import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const TiempoRestanteAnulacion = ({ fechaVenta, onAnular }) => {
  const [tiempoRestante, setTiempoRestante] = useState('');
  const [puedeAnular, setPuedeAnular] = useState(true);

  useEffect(() => {
    const calcularTiempo = () => {
      const safeFecha = typeof fechaVenta === 'string' ? fechaVenta.replace(' ', 'T') : fechaVenta;
      const fechaVentaDate = new Date(safeFecha);
      const ahora = new Date();
      const diferenciaMs = ahora - fechaVentaDate;
      const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);
      
      const TIEMPO_LIMITE_HORAS = 1;
      
      if (diferenciaHoras > TIEMPO_LIMITE_HORAS || isNaN(diferenciaHoras)) {
        setTiempoRestante('Expirado');
        setPuedeAnular(false);
      } else {
        const minutosRestantes = Math.floor((TIEMPO_LIMITE_HORAS * 60 - (diferenciaMs / (1000 * 60))));
        const horas = Math.floor(minutosRestantes / 60);
        const minutos = minutosRestantes % 60;
        
        if (horas > 0) {
          setTiempoRestante(`${horas}h ${minutos}m`);
        } else {
          setTiempoRestante(`${minutos}m`);
        }
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