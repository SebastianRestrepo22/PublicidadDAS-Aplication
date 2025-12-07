import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRouteAdmin = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  } 

  if (user?.Role !== "administrador") {
    return <Navigate to="/" />;
  }

  return children;
};
