import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inicializar autenticación desde localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");

      if (!token) {
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // Verificar si el token ha expirado
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          setUser(null);
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Combinar datos del token con userData
        const parsedUserData = userData ? JSON.parse(userData) : {};
        const combinedUser = {
          ...decoded,
          ...parsedUserData,
          Role: (decoded.Role || parsedUserData.Role || "").toLowerCase()
        };
        
        // Extraer permisos
        const perms = decoded.Permisos || parsedUserData.Permisos || [];
        
        setUser(combinedUser);
        setPermissions(Array.isArray(perms) ? perms : []);
        
        // Configurar headers de axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
      } catch (error) {
        console.error("Error al inicializar auth:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setUser(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    // Guardar en localStorage
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }

    try {
      const decoded = jwtDecode(token);
      const combinedUser = {
        ...decoded,
        ...(userData || {}),
        Role: (decoded.Role || userData?.Role || "").toLowerCase()
      };
      
      const perms = decoded.Permisos || userData?.Permisos || [];
      
      // Actualizar estado SIN setTimeout
      setUser(combinedUser);
      setPermissions(Array.isArray(perms) ? perms : []);
      
      // Configurar headers de axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // IMPORTANTE: Establecer loading como false inmediatamente
      setLoading(false);
      
    } catch (error) {
      console.error("Error decodificando token:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setPermissions([]);
    setLoading(false);
  };

  const updatePermissions = (newPermissions) => {
    setPermissions(Array.isArray(newPermissions) ? newPermissions : []);
  };

  const hasPermission = (permissionName) => {
    if (!user || loading) return false;
    if (user.Role === "administrador") return true;
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }
    return permissions.includes(permissionName);
  };

  const hasAnyPermission = (permissionNames) => {
    if (!user || loading) return false;
    if (user.Role === "administrador") return true;
    if (!Array.isArray(permissions) || !Array.isArray(permissionNames)) {
      return false;
    }
    return permissionNames.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (permissionNames) => {
    if (!user || loading) return false;
    if (user.Role === "administrador") return true;
    if (!Array.isArray(permissions) || !Array.isArray(permissionNames)) {
      return false;
    }
    return permissionNames.every((perm) => permissions.includes(perm));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        loading,
        login,
        logout,
        updatePermissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};