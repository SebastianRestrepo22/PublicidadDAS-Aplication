// hooks/useExpiracionCompra.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useExpiracionCompra = (compra, onAnularCompra) => {
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [expirada, setExpirada] = useState(false);

  useEffect(() => {
    // Solo aplicar para compras PENDIENTES
    if (!compra || compra.Estado !== 'PENDIENTE' || compra.MotivoCancelacion) {
      return;
    }

    // Calcular tiempo de expiración (5 horas después de la creación)
    const calcularTiempoExpiracion = () => {
      const fechaCreacion = new Date(compra.FechaRegistro);
      const fechaExpiracion = new Date(fechaCreacion.getTime() + (5 * 60 * 60 * 1000)); // +5 horas
      const ahora = new Date();
      
      return Math.max(0, Math.floor((fechaExpiracion - ahora) / 1000)); // Tiempo en segundos
    };

    const actualizarTiempo = () => {
      const segundosRestantes = calcularTiempoExpiracion();
      setTiempoRestante(segundosRestantes);

      if (segundosRestantes <= 0) {
        setExpirada(true);
        // Mostrar notificación de expiración
        toast.warning(
          <div>
            <strong>⚠️ Compra #{(compra.CompraId || '').substring(0, 8)} expirada</strong>
            <br />
            <small>La compra ha sido anulada automáticamente por tiempo de espera excedido</small>
          </div>,
          {
            autoClose: 8000,
            icon: '⏰'
          }
        );
        // Llamar a la función de anulación
        onAnularCompra(compra.CompraId, 'Anulación automática por tiempo de espera (5 horas)');
      }
    };

    // Actualizar inmediatamente
    actualizarTiempo();

    // Configurar intervalo para actualizar cada segundo
    const intervalo = setInterval(actualizarTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [compra, onAnularCompra]);

  // Formatear tiempo restante
  const formatearTiempo = () => {
    if (!tiempoRestante || tiempoRestante <= 0) {
      return 'Expirada';
    }

    const horas = Math.floor(tiempoRestante / 3600);
    const minutos = Math.floor((tiempoRestante % 3600) / 60);
    const segundos = tiempoRestante % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}m ${segundos}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segundos}s`;
    } else {
      return `${segundos}s`;
    }
  };

  // Obtener color del tiempo
  const getColorTiempo = () => {
    if (!tiempoRestante || tiempoRestante <= 0) return 'text-red-600';
    if (tiempoRestante < 3600) return 'text-orange-500'; // Menos de 1 hora
    if (tiempoRestante < 7200) return 'text-yellow-500'; // Entre 1 y 2 horas
    return 'text-green-500'; // Más de 2 horas
  };

  // Obtener porcentaje de tiempo transcurrido
  const getPorcentajeTranscurrido = () => {
    if (!compra?.FechaRegistro) return 0;
    
    const fechaCreacion = new Date(compra.FechaRegistro);
    const fechaExpiracion = new Date(fechaCreacion.getTime() + (5 * 60 * 60 * 1000));
    const ahora = new Date();
    
    const total = 5 * 60 * 60 * 1000; // 5 horas en ms
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