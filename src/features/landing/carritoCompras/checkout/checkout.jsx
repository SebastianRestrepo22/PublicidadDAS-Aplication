import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

// VALIDADOR DE UUID
const isValidUUID = (str) => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// FUNCIÓN PARA EXTRAER COLORID SEGURO
const extractValidColorId = (item) => {
  if (!item?.customization?.color) return null;

  if (typeof item.customization.color === 'string' && isValidUUID(item.customization.color)) {
    return item.customization.color;
  }

  if (item.customization.color?.ColorId && isValidUUID(item.customization.color.ColorId)) {
    return item.customization.color.ColorId;
  }

  if (item.customization.color?.id && isValidUUID(item.customization.color.id)) {
    return item.customization.color.id;
  }

  console.warn(`⚠️ Color no válido para "${item.Nombre}":`, item.customization.color);
  return null;
};

// FUNCIÓN PARA FORMATEAR PRECIOS EN COP
const formatCOP = (value) => {
  if (value === undefined || value === null) return 'COP 0';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return 'COP 0';
  return num.toLocaleString("es-CO", { style: "currency", currency: "COP" });
};

export const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voucher, setVoucher] = useState(null);

  // ====== DATOS BANCARIOS ======
  const DATOS_BANCARIOS_REALES = {
    nombreTitular: "Luis Marino Moreno",
    numeroCuenta: "24079288086",
    tipoCuenta: "Ahorro",
    banco: "Bancolombia",
    qrCode: "/qr-bancolombia-real.png",
    nit: "123456789-0",
    telefonoSoporte: "3001234567",
    emailSoporte: "pagos@tunegocio.com",
    horarioAtencion: "Lunes a Viernes 8am-6pm"
  };

  const API_URL = import.meta.env.VITE_API_URL;

  // Estados para métodos de pago
  const [metodoPago, setMetodoPago] = useState("qr");
  const [datosEntrega, setDatosEntrega] = useState({
    nombreRecibe: "",
    telefono: "",
    direccion: ""
  });
  const [erroresEntrega, setErroresEntrega] = useState({});

  // ====== VALIDACIÓN DE ENTREGA ======
  const validarEntrega = () => {
    const errores = {};
    if (!datosEntrega.nombreRecibe.trim()) errores.nombreRecibe = "Requerido";
    if (!datosEntrega.telefono.trim()) errores.telefono = "Requerido";
    if (!datosEntrega.direccion.trim()) errores.direccion = "Requerida";
    setErroresEntrega(errores);
    return Object.keys(errores).length === 0;
  };

  // ====== FUNCIÓN PARA CALCULAR TOTAL DE FORMA SEGURA ======
  const calcularTotalSeguro = () => {
    const total = getTotal();

    let totalNumerico = 0;

    if (total === null || total === undefined) {
      console.warn('⚠️ getTotal() devolvió null/undefined');
      totalNumerico = 0;
    } else if (typeof total === 'number') {
      totalNumerico = total;
    } else if (typeof total === 'string') {
      const totalLimpio = total.replace(/[$,.]/g, '').trim();
      totalNumerico = parseFloat(totalLimpio) || 0;
    } else {
      totalNumerico = Number(total) || 0;
    }

    return totalNumerico;
  };

  // ====== ENVIAR PEDIDO ======
  const enviarPedido = async () => {
    if (!user) {
      setError("Debes iniciar sesión");
      toast.error("Debes iniciar sesión para continuar");
      return;
    }

    if (metodoPago === "entrega" && !validarEntrega()) {
      setError("Completa todos los campos de entrega");
      toast.error("Completa todos los campos de entrega");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // CONSTRUIR DETALLES CON VALIDACIÓN SEGURA
      const detallesValidados = cart.map(item => {
        const ProductoId = item.ProductoId;
        
        if (!ProductoId) {
          throw new Error(`El ítem "${item.Nombre || item.id}" no tiene ProductoId válido`);
        }

        // EXTRAER COLORID SEGURO
        const ColorId = extractValidColorId(item);

        // DESCRIPCIÓN CON COLOR SI NO ES UUID
        let descripcion = item.options?.descripcion || item.Descripcion || item.customization?.Descripcion || "";

        if (item.customization?.color && !ColorId) {
          const colorName = typeof item.customization.color === 'string'
            ? item.customization.color
            : item.customization.color?.Nombre || item.customization.color?.nombre;

          if (colorName) {
            descripcion += (descripcion ? " | " : "") + `Color: ${colorName}`;
          }
        }

        // EXTRAER URL DE ARCHIVO PERSONALIZADO
        let UrlArchivoPersonalizado = null;
        let tipoArchivo = null;
        let nombreArchivo = null;

        if (item.customization?.archivosAdjuntos?.length > 0) {
          const archivo = item.customization.archivosAdjuntos[0];
          if (archivo.url) {
            UrlArchivoPersonalizado = archivo.url.startsWith('http')
              ? archivo.url
              : `${API_URL}${archivo.url}`;
            tipoArchivo = archivo.tipo || archivo.type || 'desconocido';
            nombreArchivo = archivo.nombre || archivo.name || 'archivo';
          }
        }

        return {
          ProductoId,
          Cantidad: item.quantity || 1,
          Precio: item.Precio || 0,
          Descripcion: descripcion,
          UrlImagen: item.options?.urlImagen || item.UrlImagen || null,
          UrlImagenPersonalizada: UrlArchivoPersonalizado,
          ColorId
        };
      });

      // VALIDACIÓN FINAL
      const detallesFinales = detallesValidados.filter(detalle => {
        if (!detalle.ProductoId) {
          console.error(`❌ Item sin ProductoId omitido:`, detalle);
          return false;
        }
        return true;
      });

      if (detallesFinales.length === 0) {
        throw new Error("No hay items válidos para procesar el pedido");
      }

      // CALCULAR TOTAL DE FORMA SEGURA
      const totalSeguro = calcularTotalSeguro();

      if (isNaN(totalSeguro) || totalSeguro <= 0) {
        console.error('❌ Total inválido después de calcular:', totalSeguro);
        throw new Error("El total del pedido no es válido");
      }

      const payload = {
        ClienteId: user.CedulaId,
        FechaRegistro: new Date().toISOString().split("T")[0],
        Total: totalSeguro,
        Estado: "pendiente",
        MetodoPago: metodoPago === "entrega" ? "contra_entrega" : metodoPago,
        Origen: "cliente",
        detalle: detallesFinales
      };

      // AGREGAR DATOS DE ENTREGA SI ES CONTRA ENTREGA
      if (metodoPago === "entrega") {
        payload.NombreRecibe = datosEntrega.nombreRecibe;
        payload.TelefonoEntrega = datosEntrega.telefono;
        payload.DireccionEntrega = datosEntrega.direccion;
      }

      // ENVIAR AL BACKEND
      const formData = new FormData();
      formData.append("pedido", JSON.stringify(payload));

      cart.forEach((item, index) => {
        if (item.customization?.archivosAdjuntosOriginales) {
          item.customization.archivosAdjuntosOriginales.forEach((file, fileIndex) => {
            if (file instanceof File) {
              formData.append(`archivo_${index}_${fileIndex}`, file);
            }
          });
        }
      });

      const res = await fetch(`${API_URL}/api/pedidos-clientes`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error || errorData.message || `Error ${res.status}: ${res.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await res.json();

      const pedidoId = String(data.PedidoClienteId).trim();
      clearCart();

      // GENERAR VOUCHER PARA PAGOS ELECTRÓNICOS
      if (metodoPago === "qr" || metodoPago === "transferencia") {
        setVoucher({
          id: pedidoId,
          total: totalSeguro,
          totalFormateado: formatCOP(totalSeguro),
          fecha: new Date().toLocaleDateString("es-CO", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          hora: new Date().toLocaleTimeString("es-CO", {
            hour: '2-digit',
            minute: '2-digit'
          }),
          cliente: `${user.Nombre} ${user.Apellido}`,
          email: user.Email || "",
          telefono: user.Telefono || "",
          metodo: metodoPago,
          referencia: `PED${pedidoId.toString().padStart(6, '0')}`,
          fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString("es-CO")
        });
        toast.success("¡Pedido creado! Adjunta tu comprobante para confirmar");
      } else {
        navigate("/pedido-exitoso", {
          state: {
            metodo: "entrega",
            id: pedidoId,
            total: totalSeguro,
            totalFormateado: formatCOP(totalSeguro)
          }
        });
        toast.success("¡Pedido creado! Se procesará al recibir tu entrega");
      }

    } catch (e) {
      console.error("❌ Error completo al crear pedido:", e);
      const errorMsg = e.message || "Ocurrió un error al procesar tu pedido. Verifica los datos e intenta nuevamente.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ====== COMPONENTE: Subir comprobante ======
  const SubirComprobanteBanco = ({ pedidoId, metodo }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        toast.error("Por favor adjunta el comprobante de pago");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("El archivo debe ser menor a 10MB");
        return;
      }

      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error("Solo se permiten imágenes o PDFs");
        return;
      }

      const formData = new FormData();
      formData.append("voucher", file);

      setUploading(true);
      try {

        const res = await fetch(`${API_URL}/api/pedidos-clientes/${pedidoId}/voucher`, {
          method: "POST",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setSuccess(true);
          toast.success("¡Comprobante enviado! Revisaremos tu pago en 24-48 horas");

          setTimeout(() => {
            navigate("/pedido-exitoso", {
              state: {
                metodo,
                id: pedidoId,
                referencia: `PED${pedidoId.toString().padStart(6, '0')}`,
                total: voucher?.total,
                totalFormateado: formatCOP(voucher?.total || 0),
                voucherUrl: data.voucher
              }
            });
          }, 2000);

        } else {
          const errorData = await res.json().catch(() => ({}));
          toast.error(errorData.error || "Error al subir el comprobante");
        }
      } catch (err) {
        console.error("Error subiendo comprobante:", err);
        toast.error("No se pudo conectar al servidor");
      } finally {
        setUploading(false);
      }
    };

    if (success) {
      return (
        <div className="text-center mt-6 p-4 bg-green-50 rounded-xl">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-green-700 font-bold">¡Comprobante enviado exitosamente!</div>
          <p className="text-gray-600 text-sm mt-1">Revisaremos tu pago y te notificaremos por correo.</p>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comprobante de pago (imagen o PDF) *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Sube una imagen o PDF</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="sr-only"
                    required
                  />
                </label>
                <p className="pl-1">o arrastra y suelta</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF hasta 10MB</p>
              {file && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  ✓ Archivo seleccionado: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${uploading ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enviando comprobante...
            </div>
          ) : "Enviar comprobante y finalizar"}
        </button>
      </form>
    );
  };

  // ====== RENDER: Voucher ======
  if (voucher) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {voucher.metodo === "qr" ? "Paga con QR Bancolombia" : "Transferencia Bancaria"}
            </h1>
          </div>

          <div className="inline-flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-blue-700">Pedido: #{voucher.id}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{voucher.fecha}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{voucher.hora}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Información importante
              </h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Tu pedido se procesará solo después de confirmar el pago (24-48 horas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Guarda el comprobante de pago de tu banco</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Contacta a soporte: {DATOS_BANCARIOS_REALES.telefonoSoporte}</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-red-800">Tiempo límite</div>
                  <div className="text-sm text-red-700">Completa el pago antes del {voucher.fechaLimite}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 text-white p-5">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-bold">📤 Sube tu comprobante</h3>
                </div>
                <p className="text-gray-300 mt-1">Después de pagar, adjunta aquí tu comprobante</p>
              </div>

              <div className="p-6">
                <SubirComprobanteBanco pedidoId={voucher.id} metodo={voucher.metodo} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-block bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">Total a pagar</p>
            <p className="text-2xl font-bold text-gray-900">{voucher.totalFormateado || formatCOP(voucher.total)}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al carrito
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Problemas con el pago? Contacta a soporte:{" "}
            <a href={`tel:${DATOS_BANCARIOS_REALES.telefonoSoporte}`} className="text-blue-600 hover:underline">
              {DATOS_BANCARIOS_REALES.telefonoSoporte}
            </a>{" "}
            •{" "}
            <a href={`mailto:${DATOS_BANCARIOS_REALES.emailSoporte}`} className="text-blue-600 hover:underline">
              {DATOS_BANCARIOS_REALES.emailSoporte}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ====== RENDER: Checkout normal ======
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar compra</h1>
          <p className="text-gray-600 mt-1">Selecciona cómo quieres pagar</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-8">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Resumen del pedido */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4L7 13zm1 6a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Resumen del pedido ({cart.length} productos)
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  {item.UrlImagen && (
                    <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.UrlImagen} alt={item.Nombre} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{item.Nombre}</h3>
                      <span className="font-bold text-gray-900">
                        {formatCOP(item.Precio * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                      {item.customization?.color && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Color: {typeof item.customization.color === 'string'
                            ? item.customization.color
                            : item.customization.color?.Nombre || item.customization.color?.nombre || 'N/A'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total a pagar</span>
                <span className="text-3xl font-bold text-black">
                  {formatCOP(calcularTotalSeguro())}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10l4-8H5.4L7 13zm1 6a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Método de pago
            </h2>

            {/* QR */}
            <div
              className={`p-4 mb-4 rounded-xl border-2 cursor-pointer ${metodoPago === "qr" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              onClick={() => setMetodoPago("qr")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${metodoPago === "qr" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                    {metodoPago === "qr" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Pago rápido con QR</div>
                    <div className="text-sm text-gray-600">Escanea con la app de Bancolombia</div>
                  </div>
                </div>
                {metodoPago === "qr" && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">SELECCIONADO</div>
                )}
              </div>
              {metodoPago === "qr" && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-center">
                    <img src={DATOS_BANCARIOS_REALES.qrCode} alt="QR Bancolombia" className="w-36 h-36 object-contain" />
                  </div>
                  <div className="text-xs text-gray-600 mt-3 text-center">
                    Cuenta: {DATOS_BANCARIOS_REALES.numeroCuenta} • {DATOS_BANCARIOS_REALES.tipoCuenta}
                  </div>
                </div>
              )}
            </div>

            {/* Transferencia */}
            <div
              className={`p-4 mb-4 rounded-xl border-2 cursor-pointer ${metodoPago === "transferencia" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              onClick={() => setMetodoPago("transferencia")}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${metodoPago === "transferencia" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                  {metodoPago === "transferencia" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="font-bold text-gray-900">Transferencia bancaria</div>
                  <div className="text-sm text-gray-600">Paga desde cualquier banco</div>
                </div>
              </div>
              {metodoPago === "transferencia" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm space-y-2">
                    <div><span className="font-semibold">Titular:</span> {DATOS_BANCARIOS_REALES.nombreTitular.trim()}</div>
                    <div><span className="font-semibold">Cuenta:</span> {DATOS_BANCARIOS_REALES.numeroCuenta}</div>
                    <div><span className="font-semibold">Tipo:</span> {DATOS_BANCARIOS_REALES.tipoCuenta}</div>
                    <div><span className="font-semibold">Banco:</span> {DATOS_BANCARIOS_REALES.banco}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Contra entrega */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer ${metodoPago === "entrega" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              onClick={() => setMetodoPago("entrega")}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${metodoPago === "entrega" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                  {metodoPago === "entrega" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="font-bold text-gray-900">Pago contra entrega</div>
                  <div className="text-sm text-gray-600">Paga en efectivo al recibir tu pedido</div>
                </div>
              </div>
              {metodoPago === "entrega" && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Datos de entrega</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nombre completo *"
                      value={datosEntrega.nombreRecibe}
                      onChange={(e) => setDatosEntrega({ ...datosEntrega, nombreRecibe: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${erroresEntrega.nombreRecibe ? "border-red-500" : "border-gray-300"}`}
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono *"
                      value={datosEntrega.telefono}
                      onChange={(e) => setDatosEntrega({ ...datosEntrega, telefono: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${erroresEntrega.telefono ? "border-red-500" : "border-gray-300"}`}
                    />
                    <textarea
                      placeholder="Dirección completa *"
                      value={datosEntrega.direccion}
                      onChange={(e) => setDatosEntrega({ ...datosEntrega, direccion: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${erroresEntrega.direccion ? "border-red-500" : "border-gray-300"}`}
                      rows="2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón confirmar */}
          <button
            onClick={enviarPedido}
            disabled={loading || cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all ${loading || cart.length === 0 ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
          >
            {loading ? "Procesando..." : cart.length === 0 ? "Carrito vacío" : "Confirmar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
};