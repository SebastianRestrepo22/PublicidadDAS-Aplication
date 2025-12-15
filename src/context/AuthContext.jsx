import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);

      // Verificar expiración
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return null;
      }

      return decoded;
    } catch (error) {
      localStorage.removeItem("token");
      return null;
    }
  });

  // Nuevo estado para permisos
  const [permissions, setPermissions] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
      const decoded = jwtDecode(token);
      // Verificar expiración
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return [];
      }
      
      // Extraer permisos del token si existen
      return decoded.Permisos || [];
    } catch (error) {
      return [];
    }
  });

  // Estado para verificar si está cargando
  const [loading, setLoading] = useState(true);

  // Función para actualizar el estado después del login
  const login = (token, userData) => {
    localStorage.setItem("token", token);
    
    try {
      const decoded = jwtDecode(token);
      
      // Verificar expiración
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setUser(null);
        setPermissions([]);
        return;
      }

      setUser(decoded);
      setPermissions(decoded.Permisos || []);
      
      // Guardar datos adicionales del usuario si se proporcionan
      if (userData) {
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error al decodificar token:", error);
      logout();
    }
  };

  // Función para actualizar permisos (por si se necesitan refrescar)
  const updatePermissions = (newPermissions) => {
    setPermissions(newPermissions);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
    setPermissions([]);
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permissionName) => {
    if (!user) return false;
    
    // Si es administrador, tiene todos los permisos
    if (user.Role?.toLowerCase() === "administrador") {
      return true;
    }
    
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(permissionName);
  };

  // Función para verificar múltiples permisos (al menos uno)
  const hasAnyPermission = (permissionNames) => {
    if (!user) return false;
    
    if (user.Role?.toLowerCase() === "administrador") {
      return true;
    }
    
    if (!permissions || permissions.length === 0 || !permissionNames) return false;
    return permissionNames.some(perm => permissions.includes(perm));
  };

  // Función para verificar todos los permisos
  const hasAllPermissions = (permissionNames) => {
    if (!user) return false;
    
    if (user.Role?.toLowerCase() === "administrador") {
      return true;
    }
    
    if (!permissions || permissions.length === 0 || !permissionNames) return false;
    return permissionNames.every(perm => permissions.includes(perm));
  };

  // Efecto para establecer loading como false después de la inicialización
  useEffect(() => {
    setLoading(false);
  }, []);

  // Valor del contexto
  const value = {
    user,
    permissions,
    loading,
    login,
    logout,
    updatePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Mantener setUser por compatibilidad
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};