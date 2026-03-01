import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const TiempoRestanteAnulacion = ({ fechaVenta, onAnular }) => {
  const [tiempoRestante, setTiempoRestante] = useState('');
  const [expirado, setExpirado] = useState(false);

  useEffect(() => {
    const calcularTiempo = () => {
      const fecha = new Date(fechaVenta);
      const ahora = new Date();
      const limite = new Date(fecha.getTime() + 60 * 60 * 1000);

      if (ahora >= limite) {
        setExpirado(true);
        setTiempoRestante('00:00');
        return;
      }

      const diffMs = limite - ahora;
      const diffMinutos = Math.floor(diffMs / (1000 * 60));
      const diffSegundos = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTiempoRestante(
        `${diffMinutos}:${diffSegundos.toString().padStart(2, '0')}`
      );
    };

    calcularTiempo();
    const interval = setInterval(calcularTiempo, 1000);
    return () => clearInterval(interval);
  }, [fechaVenta]);

  if (expirado) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 italic">Expirado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-green-600 font-mono">
        ⏱️ {tiempoRestante}
      </span>
      <button
        onClick={onAnular}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Anular venta"
      >
        <X size={18} />
      </button>
    </div>
  );
};