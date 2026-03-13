import React, { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { GetDataservicios } from "../../dashboard/servicios/services/services.servicios";
import { toast } from "react-toastify";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/footer";

const WHATSAPP_NUMBER = "573218319494";

export const ServicioDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [servicio, setServicio] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datosCliente, setDatosCliente] = useState({
    nombre: "",
    telefono: "",
    email: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const res = await GetDataservicios();
        const servicioEncontrado = res.data.find((s) => s.ServicioId === id);

        if (!servicioEncontrado) {
          toast.error("Servicio no encontrado");
          navigate("/servicios");
          return;
        }

        setServicio(servicioEncontrado);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el servicio");
        navigate("/servicios");
      }
    };

    if (id) fetchServicio();
  }, [id, navigate]);

  // Validar formato de teléfono colombiano (10 dígitos, inicia con 3)
  const validarTelefonoColombia = (telefono) => {
    const telefonoLimpio = telefono.replace(/\D/g, '');
    return /^3\d{9}$/.test(telefonoLimpio);
  };

  // Validar formato de email básico
  const validarEmail = (email) => {
    if (!email.trim()) return true; // El email es opcional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validar formulario completo
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar nombre
    if (!datosCliente.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (datosCliente.nombre.trim().length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    // Validar teléfono
    if (!datosCliente.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!validarTelefonoColombia(datosCliente.telefono)) {
      nuevosErrores.telefono = "Ingresa un teléfono válido de Colombia (10 dígitos, inicia con 3)";
    }

    // Validar email (opcional pero debe ser válido si se ingresa)
    if (!validarEmail(datosCliente.email)) {
      nuevosErrores.email = "Ingresa un email válido";
    }

    // Validar descripción
    if (!descripcion.trim()) {
      nuevosErrores.descripcion = "Describe lo que necesitas";
    } else if (descripcion.trim().length < 10) {
      nuevosErrores.descripcion = "La descripción debe tener al menos 10 caracteres";
    }

    setErrors(nuevosErrores);

    // Mostrar toast con el primer error encontrado
    if (Object.keys(nuevosErrores).length > 0) {
      const primerError = Object.values(nuevosErrores)[0];
      toast.error(primerError);
      return false;
    }

    return true;
  };

  // Generar mensaje limpio para WhatsApp
  const generarMensajeWhatsApp = () => {
    const lineas = [
      `Hola, quiero cotizar el servicio: ${servicio.Nombre}`,
      ``,
      `Descripción:`,
      `${descripcion.trim()}`,
      ``,
      `Datos de contacto:`,
      `• ${datosCliente.nombre.trim()}`,
      `• ${datosCliente.telefono.trim()}`,
      datosCliente.email.trim() ? `• ${datosCliente.email.trim()}` : null,
      ``,
      `*Nota: Adjuntaré los archivos de referencia directamente en este chat.*`
    ].filter(linea => linea !== null);

    return lineas.join('\n');
  };

  const redirigirAWhatsApp = () => {
    // Ejecutar validaciones
    if (!validarFormulario()) {
      return; // Se detiene si hay errores
    }

    setIsSubmitting(true);

    try {
      const mensaje = generarMensajeWhatsApp();
      const mensajeEncoded = encodeURIComponent(mensaje);
      
      // ✅ URL corregida: sin espacios y con formato correcto
      const urlWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeEncoded}`;
      
      // Abrir WhatsApp en nueva pestaña
      const ventana = window.open(urlWhatsApp, '_blank');
      
      // Verificar si se bloqueó el popup
      if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
        toast.error("El navegador bloqueó la ventana emergente. Permite los popups para continuar.");
      } else {
        toast.success("Te redirigimos a WhatsApp");
        
        // Limpiar formulario después de enviar (opcional)
        setDescripcion("");
        setDatosCliente({ nombre: "", telefono: "", email: "" });
        setErrors({});
      }
      
    } catch (error) {
      console.error("Error al redirigir:", error);
      toast.error("No se pudo abrir WhatsApp. Verifica tu conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambio en teléfono: solo números y máximo 10 dígitos
  const handleTelefonoChange = (e) => {
    const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDatosCliente(prev => ({ ...prev, telefono: soloNumeros }));
    
    // Limpiar error de teléfono si el usuario está corrigiendo
    if (errors.telefono) {
      setErrors(prev => ({ ...prev, telefono: null }));
    }
  };

  if (!servicio) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-[80px]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado */}
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-800">{servicio.Nombre}</h1>
            <p className="text-gray-600 mt-1">Completa el formulario para cotizar por WhatsApp</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Qué necesitas? *
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => {
                  setDescripcion(e.target.value);
                  if (errors.descripcion) {
                    setErrors(prev => ({ ...prev, descripcion: null }));
                  }
                }}
                placeholder="Describe detalles como cantidades, medidas, plazos, colores, etc."
                rows="4"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.descripcion ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                 {errors.descripcion}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Mínimo 10 caracteres. Sé lo más específico posible.
              </p>
            </div>

            {/* Datos de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  value={datosCliente.nombre}
                  onChange={(e) => {
                    setDatosCliente(prev => ({ ...prev, nombre: e.target.value }));
                    if (errors.nombre) {
                      setErrors(prev => ({ ...prev, nombre: null }));
                    }
                  }}
                  placeholder="Ej: Juan Pérez"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.nombre ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                   {errors.nombre}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tu teléfono *
                </label>
                <input
                  type="tel"
                  value={datosCliente.telefono}
                  onChange={handleTelefonoChange}
                  placeholder="3001234567"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.telefono ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                   {errors.telefono}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Ej: 3001234567 (10 dígitos)
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={datosCliente.email}
                  onChange={(e) => {
                    setDatosCliente(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  placeholder="tu@email.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                   {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Instrucción sobre archivos */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    ¿Tienes archivos de referencia?
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    No los adjuntes aquí. Después de hacer clic en "Cotizar", 
                    WhatsApp se abrirá y podrás enviar tus imágenes, PDFs o documentos 
                    directamente en el chat.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de acción */}
            <button
              type="button"
              onClick={redirigirAWhatsApp}
              disabled={isSubmitting}
              className={`w-full text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Redirigiendo...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Cotizar por WhatsApp
                </>
              )}
            </button>

            {/* Nota final */}
            <p className="text-xs text-center text-slate-500">
              Al continuar, aceptas que tus datos serán usados solo para gestionar tu cotización.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};