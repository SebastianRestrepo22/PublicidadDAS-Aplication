import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Inicio } from "../landing/inicio/inicio";

export const Redirector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      // Si no hay usuario, redirigir a login
      navigate("/login");
    } else {
      // Si hay usuario, redirigir según rol
      if (user.Role.toLowerCase() === "Administrador") {
        navigate("/dashboard/graficosEstadisticos");
      } else if (user.Role.toLowerCase() === "Cliente") {
        navigate("/cliente/productos");
      }
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) return <p>Cargando...</p>;

  // Si quieres, podrías renderizar algo aquí mientras decide
  return <Inicio />;
};
