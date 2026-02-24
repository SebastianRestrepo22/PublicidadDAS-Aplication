// ProtectedRouteAdmin.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRouteAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.Role?.toLowerCase();
  
  if (userRole === "cliente") {
    return <Navigate to="/cliente/productos" replace />;
  }

  // Si es admin o cualquier otro rol no-cliente, puede pasar
  return children;
};