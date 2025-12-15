// src/components/checkout/Checkout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../../context/CartContext";
import { useAuth } from "../../../../context/AuthContext";

export const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voucher, setVoucher] = useState(null);

  // ====== DATOS BANCARIOS CON TU QR REAL ======
  const DATOS_BANCARIOS_REALES = {
    nombreTitular: "Luis Marino Moreno ",
    numeroCuenta: "24079288086",
    tipoCuenta: "Ahorro",
    banco: "Bancolombia",
    qrCode: "/qr-bancolombia-real.png",
    nit: "123456789-0",
    telefonoSoporte: "3001234567",
    emailSoporte: "pagos@tunegocio.com",
    horarioAtencion: "Lunes a Viernes 8am-6pm"
  };

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

  // ====== ENVIAR PEDIDO ======
  const enviarPedido = async () => {
    if (!user) {
      setError("Debes iniciar sesión");
      return;
    }

    if (metodoPago === "entrega" && !validarEntrega()) {
      setError("Completa todos los campos de entrega");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      ClienteId: user.CedulaId,
      FechaRegistro: new Date().toISOString().split("T")[0],
      Total: getTotal(),
      Estado: "pendiente",
      detalle: cart.map(item => ({
        ProductoServicioId: item.ProductoServicioId,
        Cantidad: item.quantity,
        Alto: item.options?.alto,
        Ancho: item.options?.ancho,
        Descripcion: item.options?.descripcion,
        UrlImagen: item.options?.urlImagen || item.UrlImagen
      }))
    };

    if (metodoPago === "entrega") {
      payload.metodoPago = "contra_entrega";
      payload.datosEntrega = datosEntrega;
    } else {
      payload.metodoPago = metodoPago;
    }

    try {
      const res = await fetch("http://localhost:3000/api/pedidos-clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al crear el pedido");
      }

      const data = await res.json();
      const pedidoId = data.PedidoClienteId;

      clearCart();

      if (metodoPago === "qr" || metodoPago === "transferencia") {
        setVoucher({
          id: pedidoId,
          total: getTotal(),
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
      } else {
        navigate("/pedido-exitoso", { state: { metodo: "entrega", id: pedidoId } });
      }

    } catch (e) {
      console.error(e);
      setError(e.message || "Ocurrió un error al enviar el pedido");
    } finally {
      setLoading(false);
    }
  };

  // ====== COMPONENTE: Subir comprobante (SIN banco ni número de transacción) ======
  const SubirComprobanteBanco = ({ pedidoId }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) {
        setError("Por favor adjunta el comprobante");
        return;
      }

      const formData = new FormData();
      formData.append("comprobante", file);
      formData.append("pedidoId", pedidoId);

      setUploading(true);
      try {
        const res = await fetch("http://localhost:3000/api/comprobantes", {
          method: "POST",
          body: formData
        });

        if (res.ok) {
          setSuccess(true);
          setTimeout(() => {
            navigate("/pedido-exitoso", { 
              state: { 
                metodo: voucher.metodo, 
                id: pedidoId,
                referencia: voucher.referencia
              } 
            });
          }, 2000);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.error || "Error al subir el comprobante");
        }
      } catch (err) {
        setError("No se pudo conectar al servidor");
      } finally {
        setUploading(false);
      }
    };

    if (success) {
      return (
        <div className="text-center mt-6 p-4 bg-green-50 rounded-xl">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-green-700 font-bold">¡Comprobante enviado exitosamente!</div>
          <p className="text-gray-600 text-sm mt-1">Revisaremos tu pago y te notificaremos.</p>
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
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
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
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, PDF hasta 10MB
              </p>
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
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${uploading ? "bg-gray-400" : "bg-black hover:bg-gray-800 hover:shadow-lg"}`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.644z"></path>
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
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {voucher.metodo === "qr" ? "Paga con QR Bancolombia" : "Transferencia Bancaria"}
            </h1>
          </div>
          
          <div className="inline-flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-blue-700">
              Pedido: <span className="font-bold">#{voucher.id}</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{voucher.fecha}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{voucher.hora}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1: Información importante y Tiempo límite */}
          <div className="lg:col-span-1 space-y-6">
            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <span>Si tienes problemas con el pago, contacta a: {DATOS_BANCARIOS_REALES.telefonoSoporte}</span>
                </li>
              </ul>
            </div>

            {/* Tiempo límite */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {/* Columna 2: Sube tu comprobante */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 text-white p-5">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-bold">📤 Sube tu comprobante</h3>
                </div>
                <p className="text-gray-300 mt-1">Después de pagar, adjunta aquí tu comprobante para confirmar tu pedido</p>
              </div>
              
              <div className="p-6">
                <SubirComprobanteBanco pedidoId={voucher.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Botón de volver */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al carrito
          </button>
        </div>

        {/* Contacto */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            ¿Problemas con el pago? Contacta a soporte:{" "}
            <a href={`tel:${DATOS_BANCARIOS_REALES.telefonoSoporte}`} className="text-blue-600 hover:underline font-medium">
              {DATOS_BANCARIOS_REALES.telefonoSoporte}
            </a>{" "}
            •{" "}
            <a href={`mailto:${DATOS_BANCARIOS_REALES.emailSoporte}`} className="text-blue-600 hover:underline font-medium">
              {DATOS_BANCARIOS_REALES.emailSoporte}
            </a>
          </p>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====== RENDER: Checkout normal ======
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen">
      {/* Título con flecha de retorno */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4L7 13zm1 6a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z"
                />
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
                        {(item.Precio * item.quantity).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP"
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                      {item.options?.alto && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Alto: {item.options.alto}</span>
                      )}
                      {item.options?.ancho && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Ancho: {item.options.ancho}</span>
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
                  {getTotal().toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Métodos de pago - más ancho */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Método de pago
            </h2>

            {/* Opción 1: QR */}
            <div
              className={`p-4 mb-4 rounded-xl border-2 cursor-pointer transition-colors ${
                metodoPago === "qr" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setMetodoPago("qr")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      metodoPago === "qr" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {metodoPago === "qr" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Pago rápido con QR</div>
                    <div className="text-sm text-gray-600">Escanea con la app de Bancolombia para pagar al instante</div>
                  </div>
                </div>
                {metodoPago === "qr" && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    SELECCIONADO
                  </div>
                )}
              </div>
              {metodoPago === "qr" && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-center">
                    <img
                      src={DATOS_BANCARIOS_REALES.qrCode}
                      alt="QR Bancolombia"
                      className="w-36 h-36 object-contain"
                      onError={(e) => {
                        e.target.src = "/placeholder-qr.png";
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-3 text-center">
                    Cuenta: {DATOS_BANCARIOS_REALES.numeroCuenta} • {DATOS_BANCARIOS_REALES.tipoCuenta}
                  </div>
                </div>
              )}
            </div>

            {/* Opción 2: Transferencia */}
            <div
              className={`p-4 mb-4 rounded-xl border-2 cursor-pointer transition-colors ${
                metodoPago === "transferencia" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setMetodoPago("transferencia")}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    metodoPago === "transferencia" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}
                >
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
                    <div>
                      <span className="font-semibold">Titular:</span> {DATOS_BANCARIOS_REALES.nombreTitular.trim()}
                    </div>
                    <div>
                      <span className="font-semibold">Cuenta:</span> {DATOS_BANCARIOS_REALES.numeroCuenta}
                    </div>
                    <div>
                      <span className="font-semibold">Tipo:</span> {DATOS_BANCARIOS_REALES.tipoCuenta}
                    </div>
                    <div>
                      <span className="font-semibold">Banco:</span> {DATOS_BANCARIOS_REALES.banco}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Opción 3: Contra entrega */}
            <div
              className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                metodoPago === "entrega" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setMetodoPago("entrega")}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    metodoPago === "entrega" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  }`}
                >
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
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre completo *"
                        value={datosEntrega.nombreRecibe}
                        onChange={(e) => setDatosEntrega({ ...datosEntrega, nombreRecibe: e.target.value })}
                        className={`w-full p-3 rounded-lg border ${
                          erroresEntrega.nombreRecibe ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {erroresEntrega.nombreRecibe && (
                        <p className="text-red-500 text-sm mt-1">{erroresEntrega.nombreRecibe}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Teléfono *"
                        value={datosEntrega.telefono}
                        onChange={(e) => setDatosEntrega({ ...datosEntrega, telefono: e.target.value })}
                        className={`w-full p-3 rounded-lg border ${
                          erroresEntrega.telefono ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {erroresEntrega.telefono && (
                        <p className="text-red-500 text-sm mt-1">{erroresEntrega.telefono}</p>
                      )}
                    </div>
                    <div>
                      <textarea
                        placeholder="Dirección completa *"
                        value={datosEntrega.direccion}
                        onChange={(e) => setDatosEntrega({ ...datosEntrega, direccion: e.target.value })}
                        className={`w-full p-3 rounded-lg border ${
                          erroresEntrega.direccion ? "border-red-500" : "border-gray-300"
                        }`}
                        rows="2"
                      />
                      {erroresEntrega.direccion && (
                        <p className="text-red-500 text-sm mt-1">{erroresEntrega.direccion}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de confirmar */}
          <button
            onClick={enviarPedido}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all ${
              loading ? "bg-gray-400" : "bg-black hover:bg-gray-800 hover:shadow-xl"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.644z"></path>
                </svg>
                Procesando...
              </div>
            ) : "Confirmar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
};