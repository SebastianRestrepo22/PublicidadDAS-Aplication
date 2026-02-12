// hooks/useMisPedidos.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useMisPedidos = (clienteId) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPedidos = useCallback(async () => {
    // Solo hacer la solicitud si tenemos clienteId
    if (!clienteId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando pedidos para clienteId:', clienteId);
      
      const { data } = await axios.get(
        "http://localhost:3000/api/pedidos-clientes/mis-pedidos", 
        {
          params: { clienteId }, // Pasar como parámetro de consulta
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      console.log('Pedidos recibidos:', data);
      setPedidos(data);
    } catch (err) {
      console.error("Error al cargar mis pedidos:", err);
      console.error("Error response:", err.response?.data);
      setError(err);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId]); // Dependencia del clienteId

  useEffect(() => {
    if (clienteId) {
      fetchPedidos();
      const interval = setInterval(fetchPedidos, 30000); // actualiza cada 30s
      return () => clearInterval(interval);
    }
  }, [fetchPedidos, clienteId]);

  return { pedidos, loading, error, refetch: fetchPedidos };
};