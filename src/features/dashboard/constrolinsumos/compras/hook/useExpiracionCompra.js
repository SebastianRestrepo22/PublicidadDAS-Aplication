// useExpiracionCompra.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useExpiracionCompra = (compra, onAnularCompra) => {
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [expirada, setExpirada] = useState(false);

  useEffect(() => {
    // Solo aplicar para compras PENDIENTES
    if (!compra || compra.Estado !== 'pendiente' || compra.MotivoCancelacion) {
      return;
    }

    const calcularTiempoExpiracion = () => {
      const fechaCreacion = new Date(compra.FechaRegistro);
      const fechaExpiracion = new Date(fechaCreacion.getTime() + (2 * 60 * 60 * 1000)); // +2 horas
      const ahora = new Date();
      
      const segundosRestantes = Math.max(0, Math.floor((fechaExpiracion - ahora) / 1000));
      
      // Si ya expiró, anular inmediatamente
      if (segundosRestantes <= 0 && !expirada) {
        handleExpiracion();
      }
      
      return segundosRestantes;
    };

    const handleExpiracion = () => {
      setExpirada(true);
      toast.warning(
        <div>
          <strong>⚠️ Compra #{String(compra.CompraId || '').substring(0, 8)} expirada</strong>
          <br />
          <small>La compra ha sido anulada automáticamente por tiempo de espera excedido (2 horas)</small>
        </div>,
        {
          autoClose: 8000,
          icon: '⏰'
        }
      );
      onAnularCompra(compra.CompraId, 'Anulación automática por tiempo de espera (2 horas)');
    };

    const actualizarTiempo = () => {
      const segundosRestantes = calcularTiempoExpiracion();
      setTiempoRestante(segundosRestantes);
    };

    actualizarTiempo();
    const intervalo = setInterval(actualizarTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [compra, onAnularCompra, expirada]);

  // Formatear tiempo restante
  const formatearTiempo = () => {
    if (!tiempoRestante || tiempoRestante <= 0) {
      return 'Expirada';
    }

    const horas = Math.floor(tiempoRestante / 3600);
    const minutos = Math.floor((tiempoRestante % 3600) / 60);
    const segundos = tiempoRestante % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else if (minutos > 0) {
      return `${minutos}m ${segundos}s`;
    } else {
      return `${segundos}s`;
    }
  };

  const getColorTiempo = () => {
    if (!tiempoRestante || tiempoRestante <= 0) return 'text-red-600';
    if (tiempoRestante < 600) return 'text-red-500 animate-pulse'; // Menos de 10 min
    if (tiempoRestante < 1800) return 'text-orange-500'; // Menos de 30 min
    if (tiempoRestante < 3600) return 'text-yellow-500'; // Menos de 1 hora
    return 'text-green-500';
  };

  const getPorcentajeTranscurrido = () => {
    if (!compra?.FechaRegistro) return 0;
    
    const fechaCreacion = new Date(compra.FechaRegistro);
    const ahora = new Date();
    
    const total = 2 * 60 * 60 * 1000; // 2 horas en ms
    const transcurrido = ahora - fechaCreacion;
    
    return Math.min(100, Math.max(0, (transcurrido / total) * 100));
  };

  return {
    tiempoRestante,
    expirada,
    tiempoFormateado: formatearTiempo(),
    colorTiempo: getColorTiempo(),
    porcentajeTranscurrido: getPorcentajeTranscurrido()
  };
};