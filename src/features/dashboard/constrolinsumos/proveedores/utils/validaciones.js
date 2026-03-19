import { validarCampoUnico } from '../services/services.proveedores';

// Variable para controlar debounce
let timeoutId = null;

// Validar nombre con validación en tiempo real
export const validarNombre = (nombre, excludeId = null, setError = null, setValidando = null) => {
  // Limpiar timeout anterior
  if (timeoutId) clearTimeout(timeoutId);

  // Validaciones de formato inmediatas
  if (!nombre || !nombre.trim()) {
    if (setError) setError("El nombre es obligatorio");
    return { valido: false, mensaje: "El nombre es obligatorio" };
  }
  if (nombre.trim().length < 2) {
    if (setError) setError("El nombre debe tener al menos 2 caracteres");
    return { valido: false, mensaje: "El nombre debe tener al menos 2 caracteres" };
  }
  if (nombre.trim().length > 100) {
    if (setError) setError("El nombre no puede exceder 100 caracteres");
    return { valido: false, mensaje: "El nombre no puede exceder 100 caracteres" };
  }

  // Si pasa las validaciones de formato, mostrar que está validando
  if (setValidando) setValidando(true);
  if (setError) setError(""); // Limpiar error mientras validamos

  // Crear nuevo timeout para validación en tiempo real
  timeoutId = setTimeout(async () => {
    try {
      const result = await validarCampoUnico('nombre', nombre, excludeId);
      if (result.existe) {
        if (setError) setError("⚠ Ya existe un proveedor con este nombre");
        if (setValidando) setValidando(false);
        return { valido: false, mensaje: "⚠ Ya existe un proveedor con este nombre" };
      }
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    } catch (error) {
      console.error("Error validando nombre:", error);
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    }
  }, 500); // 500ms de debounce

  return { valido: true, mensaje: "" }; // Retorno temporal mientras validamos
};

// Validar NIT con formato específico y validación en tiempo real
export const validarNit = (nit, excludeId = null, setError = null, setValidando = null) => {
  // Limpiar timeout anterior
  if (timeoutId) clearTimeout(timeoutId);

  if (!nit || !nit.trim()) {
    if (setError) setError("");
    return { valido: true, mensaje: "" }; // NIT es opcional
  }

  const nitLimpio = nit.trim();

  // Validaciones de formato inmediatas
  if (!nitLimpio.startsWith('3')) {
    if (setError) setError("El NIT debe comenzar con el número 3");
    return { valido: false, mensaje: "El NIT debe comenzar con el número 3" };
  }

  const soloNumeros = nitLimpio.replace(/-/g, '');
  if (soloNumeros.length < 8) {
    if (setError) setError("El NIT debe tener al menos 8 dígitos");
    return { valido: false, mensaje: "El NIT debe tener al menos 8 dígitos" };
  }

  if (soloNumeros.length > 11) {
    if (setError) setError("El NIT no puede tener más de 11 dígitos");
    return { valido: false, mensaje: "El NIT no puede tener más de 11 dígitos" };
  }

  const nitRegex = /^3[0-9-]{7,}$/;
  if (!nitRegex.test(nitLimpio)) {
    if (setError) setError("El NIT solo puede contener números y guiones");
    return { valido: false, mensaje: "El NIT solo puede contener números y guiones" };
  }

  if (nitLimpio.startsWith('-') || nitLimpio.endsWith('-') || nitLimpio.includes('--')) {
    if (setError) setError("Formato de NIT inválido (guiones mal ubicados)");
    return { valido: false, mensaje: "Formato de NIT inválido (guiones mal ubicados)" };
  }

  // Si pasa las validaciones de formato, mostrar que está validando
  if (setValidando) setValidando(true);
  if (setError) setError(""); // Limpiar error mientras validamos

  // Crear nuevo timeout para validación en tiempo real
  timeoutId = setTimeout(async () => {
    try {
      const result = await validarCampoUnico('nit', nit, excludeId);
      if (result.existe) {
        if (setError) setError("⚠ Ya existe un proveedor con este NIT");
        if (setValidando) setValidando(false);
        return { valido: false, mensaje: "⚠ Ya existe un proveedor con este NIT" };
      }
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    } catch (error) {
      console.error("Error validando NIT:", error);
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    }
  }, 500);

  return { valido: true, mensaje: "" };
};

// Validar teléfono con validación en tiempo real
export const validarTelefono = (telefono, excludeId = null, setError = null, setValidando = null) => {
  // Limpiar timeout anterior
  if (timeoutId) clearTimeout(timeoutId);

  if (!telefono) {
    if (setError) setError("El teléfono es obligatorio");
    return { valido: false, mensaje: "El teléfono es obligatorio" };
  }
  
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(telefono)) {
    if (setError) setError("El teléfono debe tener exactamente 10 dígitos");
    return { valido: false, mensaje: "El teléfono debe tener exactamente 10 dígitos" };
  }

  // Si pasa las validaciones de formato, mostrar que está validando
  if (setValidando) setValidando(true);
  if (setError) setError(""); // Limpiar error mientras validamos

  // Crear nuevo timeout para validación en tiempo real
  timeoutId = setTimeout(async () => {
    try {
      const result = await validarCampoUnico('telefono', telefono, excludeId);
      if (result.existe) {
        if (setError) setError("⚠ Ya existe un proveedor con este teléfono");
        if (setValidando) setValidando(false);
        return { valido: false, mensaje: "⚠ Ya existe un proveedor con este teléfono" };
      }
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    } catch (error) {
      console.error("Error validando teléfono:", error);
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    }
  }, 500);

  return { valido: true, mensaje: "" };
};

// Validar correo con validación en tiempo real
export const validarCorreo = (correo, excludeId = null, setError = null, setValidando = null) => {
  // Limpiar timeout anterior
  if (timeoutId) clearTimeout(timeoutId);

  if (!correo) {
    if (setError) setError("El correo electrónico es obligatorio");
    return { valido: false, mensaje: "El correo electrónico es obligatorio" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    if (setError) setError("Formato de correo inválido");
    return { valido: false, mensaje: "Formato de correo inválido" };
  }

  // Si pasa las validaciones de formato, mostrar que está validando
  if (setValidando) setValidando(true);
  if (setError) setError(""); // Limpiar error mientras validamos

  // Crear nuevo timeout para validación en tiempo real
  timeoutId = setTimeout(async () => {
    try {
      const result = await validarCampoUnico('correo', correo, excludeId);
      if (result.existe) {
        if (setError) setError("⚠ Ya existe un proveedor con este correo");
        if (setValidando) setValidando(false);
        return { valido: false, mensaje: "⚠ Ya existe un proveedor con este correo" };
      }
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    } catch (error) {
      console.error("Error validando correo:", error);
      if (setError) setError("");
      if (setValidando) setValidando(false);
      return { valido: true, mensaje: "" };
    }
  }, 500);

  return { valido: true, mensaje: "" };
};

// Validar dirección (SOLO VALIDACIÓN DE FORMATO, sin color rojo)
export const validarDireccion = (direccion, setError = null) => {
  if (!direccion || !direccion.trim()) {
    if (setError) setError("La dirección es obligatoria");
    return { valido: false, mensaje: "La dirección es obligatoria" };
  }
  if (direccion.trim().length < 5) {
    if (setError) setError("La dirección debe tener al menos 5 caracteres");
    return { valido: false, mensaje: "La dirección debe tener al menos 5 caracteres" };
  }
  if (setError) setError("");
  return { valido: true, mensaje: "" };
};