import { useEffect, useState } from "react";
import { validarCampoUnico } from "../services/services.proveedores";

// Custom hook para debounce
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Funciones de validación
const validaciones = {
  nombreProveedor: (nombre) => {
    if (!nombre || !nombre.trim()) return "El nombre es obligatorio";
    if (nombre.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
    if (nombre.trim().length > 100) return "El nombre no puede exceder 100 caracteres";
    return "";
  },
  nit: (nit) => {
    if (!nit || !nit.trim()) return "";
    const nitLimpio = nit.trim();
    if (!nitLimpio.startsWith('3')) return "El NIT debe comenzar con el número 3";
    const soloNumeros = nitLimpio.replace(/-/g, '');
    if (soloNumeros.length < 8) return "El NIT debe tener al menos 8 dígitos";
    if (soloNumeros.length > 11) return "El NIT no puede tener más de 11 dígitos";
    const nitRegex = /^3[0-9-]{7,}$/;
    if (!nitRegex.test(nitLimpio)) return "El NIT solo puede contener números y guiones";
    if (nitLimpio.startsWith('-') || nitLimpio.endsWith('-') || nitLimpio.includes('--')) {
      return "Formato de NIT inválido (guiones mal ubicados)";
    }
    return "";
  },
  telefono: (telefono) => {
    if (!telefono) return "El teléfono es obligatorio";
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(telefono)) return "10 dígitos";
    return "";
  },
  correo: (correo) => {
    if (!correo) return "El correo electrónico es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) return "Formato de correo inválido";
    return "";
  },
  direccion: (direccion) => {
    if (!direccion || !direccion.trim()) return "La dirección es obligatoria";
    if (direccion.trim().length < 5) return "La dirección debe tener al menos 5 caracteres";
    return "";
  }
};

export const ProveedorForm = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  mode = "create" // "create" | "edit"
}) => {
  const [formData, setFormData] = useState({
    nombreProveedor: "",
    nit: "",
    telefono: "",
    correo: "",
    direccion: "",
    estado: 1
  });

  const [validacionesEstado, setValidacionesEstado] = useState({
    nombreProveedor: { valido: true, mensaje: '', verificando: false },
    nit: { valido: true, mensaje: '', verificando: false },
    correo: { valido: true, mensaje: '', verificando: false },
    telefono: { valido: true, mensaje: '' },
    direccion: { valido: true, mensaje: '' }
  });

  // Valores debounce para validación en tiempo real
  const debouncedNombre = useDebounce(formData.nombreProveedor, 500);
  const debouncedCorreo = useDebounce(formData.correo, 500);

  // Inicializar formulario cuando cambie el modo o los datos iniciales
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        nombreProveedor: initialData.NombreProveedor || "",
        nit: initialData.Nit || "",
        telefono: initialData.Telefono || "",
        correo: initialData.Correo || "",
        direccion: initialData.Direccion || "",
        estado: Number(initialData.Estado) === 1 ? 1 : 0
      });
    } else if (mode === "create") {
      setFormData({
        nombreProveedor: "",
        nit: "",
        telefono: "",
        correo: "",
        direccion: "",
        estado: 1
      });
    }
  }, [initialData, mode, open]);

  // Validación en tiempo real de campos únicos
  useEffect(() => {
    const validarCampoUnicoEnTiempoReal = async (campo, valor) => {
      if (!valor || valor.trim() === '') {
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: { valido: true, mensaje: '', verificando: false }
        }));
        return;
      }

      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: { ...prev[campo], verificando: true }
      }));

      try {
        const excludeId = mode === "edit" && initialData?.ProveedorId ? initialData.ProveedorId : null;
        const resultado = await validarCampoUnico(campo, valor, excludeId);
        
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: {
            valido: !resultado.existe,
            mensaje: resultado.existe ? `Ya existe un proveedor con este ${campo}` : '',
            verificando: false
          }
        }));
      } catch (error) {
        console.error(`Error validando ${campo}:`, error);
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: { valido: true, mensaje: '', verificando: false }
        }));
      }
    };

    if (open && debouncedNombre) {
      validarCampoUnicoEnTiempoReal('nombreProveedor', debouncedNombre);
    }
  }, [debouncedNombre, open, mode, initialData]);

  useEffect(() => {
    const validarCampoUnicoEnTiempoReal = async (campo, valor) => {
      if (!valor || valor.trim() === '') {
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: { valido: true, mensaje: '', verificando: false }
        }));
        return;
      }

      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: { ...prev[campo], verificando: true }
      }));

      try {
        const excludeId = mode === "edit" && initialData?.ProveedorId ? initialData.ProveedorId : null;
        const resultado = await validarCampoUnico(campo, valor, excludeId);
        
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: {
            valido: !resultado.existe,
            mensaje: resultado.existe ? `Ya existe un proveedor con este ${campo}` : '',
            verificando: false
          }
        }));
      } catch (error) {
        console.error(`Error validando ${campo}:`, error);
        setValidacionesEstado(prev => ({
          ...prev,
          [campo]: { valido: true, mensaje: '', verificando: false }
        }));
      }
    };

    if (open && debouncedCorreo) {
      validarCampoUnicoEnTiempoReal('correo', debouncedCorreo);
    }
  }, [debouncedCorreo, open, mode, initialData]);

  const handleChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Validación local inmediata
    if (validaciones[campo]) {
      const error = validaciones[campo](valor);
      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: { ...prev[campo], mensaje: error, valido: !error }
      }));
    }
  };

  const handleBlur = (campo, valor) => {
    if (validaciones[campo]) {
      const error = validaciones[campo](valor);
      setValidacionesEstado(prev => ({
        ...prev,
        [campo]: { ...prev[campo], mensaje: error, valido: !error }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const errores = {};
    Object.keys(validaciones).forEach(campo => {
      const error = validaciones[campo](formData[campo]);
      if (error) errores[campo] = error;
    });

    // Verificar campos únicos
    if (!validacionesEstado.nombreProveedor.valido || !validacionesEstado.correo.valido) {
      toast.error("Por favor corrige los campos duplicados");
      return;
    }

    if (Object.keys(errores).length > 0) {
      setValidacionesEstado(prev => ({
        ...prev,
        ...Object.keys(errores).reduce((acc, campo) => {
          acc[campo] = { ...prev[campo], mensaje: errores[campo], valido: false };
          return acc;
        }, {})
      }));
      return;
    }

    onSubmit(formData);
  };

  if (!open) return null;

  const renderInput = (campo, label, placeholder, type = "text", required = true) => (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={formData[campo]}
        className={`w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 ${
          validacionesEstado[campo].mensaje || !validacionesEstado[campo].valido
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        onChange={(e) => {
          let valor = e.target.value;
          if (campo === "telefono") {
            valor = valor.replace(/\D/g, "");
          }
          handleChange(campo, valor);
        }}
        onBlur={(e) => handleBlur(campo, e.target.value)}
        maxLength={campo === "nit" ? 15 : campo === "telefono" ? 10 : undefined}
      />
      {validacionesEstado[campo].verificando && (
        <span className="text-blue-500 text-xs mt-1 flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verificando...
        </span>
      )}
      {!validacionesEstado[campo].verificando && validacionesEstado[campo].mensaje && (
        <span className={`text-xs mt-1 flex items-center gap-1 ${
          validacionesEstado[campo].valido ? 'text-green-600' : 'text-red-500'
        }`}>
          {!validacionesEstado[campo].valido && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {validacionesEstado[campo].mensaje}
        </span>
      )}
      {campo === "nit" && (
        <span className="text-gray-400 text-xs mt-1">
          Mínimo 8 dígitos, máximo 11 dígitos (puede incluir guiones)
        </span>
      )}
    </div>
  );

  return (
    <div className="w-[95vw] max-w-[600px] p-6 mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-3">
        {mode === "create" ? "Nuevo proveedor" : "Editar proveedor"}
      </h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            {renderInput("nombreProveedor", "Nombre del proveedor", "Ingrese nombre proveedor")}
            {renderInput("nit", "NIT (Opcional)", "Contener 8 digitos", "text", false)}
            {renderInput("telefono", "Teléfono", "Ej: 3001234567")}
          </div>
          <div className="space-y-4">
            {renderInput("correo", "Correo electrónico", "proveedor@ejemplo.com", "email")}
            {renderInput("direccion", "Dirección", "Ingrese dirección completa")}
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (mode === "create" ? 'Creando...' : 'Guardando...') : (mode === "create" ? 'Crear proveedor' : 'Guardar cambios')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProveedorForm;