// hooks/useMisPedidos.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useMisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:3000/api/pedidos-clientes/mis-pedidos", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setPedidos(data);
    } catch (err) {
      console.error("Error al cargar mis pedidos:", err);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 30000); // actualiza cada 30s
    return () => clearInterval(interval);
  }, [fetchPedidos]);

  return { pedidos, loading, refetch: fetchPedidos };
};