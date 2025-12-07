import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role && user.Role.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" />;

  return children;
};
