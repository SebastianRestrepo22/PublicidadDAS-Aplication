import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Interceptor para manejar token expirado
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si el error es 401 (No autorizado) o 403 (Prohibido)
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Verificar si el mensaje indica token expirado
          const errorMsg = error.response?.data?.message?.toLowerCase() || '';
          
          if (errorMsg.includes('expirado') || errorMsg.includes('token') || errorMsg.includes('inválido')) {
            // Mostrar mensaje
            toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', {
              autoClose: 5000,
              position: "top-center",
            });
            
            // Limpiar todo
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            localStorage.removeItem("userId");
            localStorage.removeItem("lastPath");
            delete axios.defaults.headers.common["Authorization"];
            
            // Actualizar estado
            setUser(null);
            setPermissions([]);
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
          }
        }
        return Promise.reject(error);
      }
    );

    // Limpiar interceptor cuando el componente se desmonte
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []); // Solo se ejecuta una vez

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

        // VERIFICAR EXPIRACIÓN
        if (decoded.exp * 1000 < Date.now()) {
          // Token expirado - limpiar y mostrar mensaje
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          localStorage.removeItem("userId");
          localStorage.removeItem("lastPath");
          
          toast.info('Tu sesión ha expirado. Inicia sesión nuevamente.', {
            autoClose: 3000,
            position: "top-center",
          });
          
          setUser(null);
          setPermissions([]);
          setLoading(false);
          return;
        }

        const parsedUserData = userData ? JSON.parse(userData) : {};
        const combinedUser = {
          ...decoded,
          ...parsedUserData,
          Role: (decoded.Role || parsedUserData.Role || "").toLowerCase()
        };
        
        const perms = decoded.Permisos || parsedUserData.Permisos || [];
        
        setUser(combinedUser);
        setPermissions(Array.isArray(perms) ? perms : []);
        
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
      } catch (error) {
        console.error("Error al inicializar auth:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("userId");
        localStorage.removeItem("lastPath");
        setUser(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      
      // Extraer userId del token SIEMPRE
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.CedulaId || userData.CedulaId || userData.id || userData.userId || '';
        
        if (userId) {
          localStorage.setItem("userId", userId);
        } else {
          console.warn("No se encontró userId en el token ni en userData");
        }
      } catch (error) {
        console.error("Error decodificando token en login:", error);
      }
    }

    try {
      const decoded = jwtDecode(token);
      const combinedUser = {
        ...decoded,
        ...(userData || {}),
        Role: (decoded.Role || userData?.Role || "").toLowerCase()
      };
      
      const perms = decoded.Permisos || userData?.Permisos || [];
      
      setUser(combinedUser);
      setPermissions(Array.isArray(perms) ? perms : []);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      setLoading(false);
      
    } catch (error) {
      console.error("Error decodificando token:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("lastPath");
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