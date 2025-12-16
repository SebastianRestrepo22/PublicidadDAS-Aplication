import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);

      // Verificar expiración
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        return null;
      }

      // COMBINAR DATOS DEL TOKEN CON DATOS DEL LOCALSTORAGE
      return {
        ...decoded,
        ...(userData ? JSON.parse(userData) : {})
      };
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
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
        localStorage.removeItem("userData");
        return [];
      }

      // Asegurarse de obtener permisos de múltiples fuentes
      const userData = localStorage.getItem("userData");
      const storedUser = userData ? JSON.parse(userData) : null;
      
      // Priorizar permisos del token, luego del userData almacenado
      return decoded.Permisos || (storedUser?.Permisos || []);
    } catch (error) {
      return [];
    }
  });

  // AÑADIR ESTADO LOADING
  const [loading, setLoading] = useState(true);

  // Función para actualizar el estado después del login
  const login = (token, userData) => {
    console.log("AuthContext: login() ejecutado con userData:", userData);

    // Guardar en localStorage
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Token decodificado:", decoded);

      // Combinar datos del token con datos adicionales
      const combinedUser = {
        ...decoded,
        ...(userData || {})
      };

      setUser(combinedUser);
      
      // Asegurar que los permisos se establezcan correctamente
      const perms = decoded.Permisos || (userData?.Permisos || []);
      console.log("Permisos establecidos:", perms);
      setPermissions(perms);
      setLoading(false); // AÑADIR: establecer loading como false

      // Configurar axios para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    } catch (error) {
      console.error("Error decodificando token:", error);
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
    setLoading(false); // AÑADIR: establecer loading como false
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
    // Si ya tenemos usuario y permisos, no estamos cargando
    if (user !== null && permissions !== null) {
      setLoading(false);
    } else {
      // Pequeño timeout para evitar flash de carga si es rápido
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, permissions]);

  // Valor del contexto
  const value = {
    user,
    permissions,
    loading, // AHORA ESTÁ DEFINIDO
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