import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RouteTracker = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Solo guardar rutas si el usuario está autenticado
    if (token && user) {
      // Definir rutas que NO deben guardarse
      const excludePaths = [
        '/login', 
        '/recuperar-contrasena', 
        '/reset-password',
        '/carritodecompras',
        '/editarcarritoservicio',
        '/checkout'
      ];
      
      // Verificar si la ruta actual debe ser excluida
      const shouldExclude = excludePaths.some(path => 
        location.pathname.includes(path)
      );
      
      // Rutas que SÍ deben guardarse (dashboard, cliente, y detalles)
      const isProtectedRoute = 
        location.pathname.startsWith('/dashboard') || 
        location.pathname.startsWith('/cliente') ||
        location.pathname.startsWith('/productos/') ||
        location.pathname.startsWith('/servicios/');
      
      if (!shouldExclude && isProtectedRoute) {
        const fullPath = location.pathname + location.search + location.hash;
        localStorage.setItem('lastPath', fullPath);
      }
    }
  }, [location, user]);
  
  return null;
};