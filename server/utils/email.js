import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  rateLimit: true,
  rateDelta: 1000,
  rateLimit: 10,
});

transporter.verify(function (error) {
  if (error) {
    console.error("⚠️ Error de conexión SMTP:", error);
  } else {
    console.log("Servidor SMTP listo para enviar correos");
  }
});



/* =========================================================
   RESET PASSWORD EMAIL
========================================================= */

export const sendResetPasswordEmail = async (correo, token) => {
  try {

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const info = await transporter.sendMail({
      from: `"Gestión de Usuarios" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "🚀 ¡Bienvenido! Establece tu contraseña",

      html: `
      <div style="font-family: Arial; max-width:600px;margin:auto;padding:20px">

      <h2>Bienvenido</h2>

      <p>Tu cuenta fue creada correctamente.</p>

      <p>Haz clic para crear tu contraseña:</p>

      <a href="${resetUrl}" 
      style="background:#667eea;color:white;padding:12px 20px;border-radius:6px;text-decoration:none">
      Establecer contraseña
      </a>

      <p style="margin-top:20px;font-size:12px">
      Este enlace expira en 1 hora.
      </p>

      </div>
      `,

      text: `
Tu cuenta fue creada.

Establece tu contraseña aquí:

${resetUrl}

El enlace expira en 1 hora.
`,
    });

    console.log("Correo de bienvenida enviado a:", correo);
    return true;

  } catch (error) {
    console.error("Error enviando correo:", error.message);
    return false;
  }
};





/* =========================================================
   ESTADO DE PEDIDO
========================================================= */

export const sendPedidoEstadoEmail = async (
  to,
  nombreCliente,
  pedidoId,
  nuevoEstado,
  motivo = ""
) => {

  const estadoConfig = {

    pendiente: {
      emoji: "📄",
      titulo: "Hemos recibido tu pedido",
      color: "#f39c12",
      mensaje: "Tu pedido está siendo revisado.",
    },

    aprobado: {
      emoji: "✅",
      titulo: "Pedido aprobado",
      color: "#27ae60",
      mensaje: "Tu pedido fue aprobado y pasará a producción.",
    },

    entregado: {
      emoji: "📦",
      titulo: "Pedido entregado",
      color: "#2980b9",
      mensaje: "Tu pedido fue entregado.",
    },

    cancelado: {
      emoji: "❌",
      titulo: "Pedido cancelado",
      color: "#c0392b",
      mensaje: motivo || "Tu pedido fue cancelado.",
    },

  };

  const config = estadoConfig[nuevoEstado];

  const html = `
  <div style="font-family:Arial;max-width:600px;margin:auto">

  <div style="background:${config.color};padding:25px;color:white;text-align:center">
  <h2>${config.emoji} ${config.titulo}</h2>
  </div>

  <div style="padding:20px">

  <p>Hola <b>${nombreCliente}</b></p>

  <p>${config.mensaje}</p>

  <p><b>Pedido:</b> #${pedidoId}</p>

  <p><b>Estado:</b> ${nuevoEstado}</p>

  </div>

  </div>
  `;

  try {

    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Pedido #${pedidoId} actualizado`,
      html,
    });

    console.log(`Correo estado '${nuevoEstado}' enviado a ${to}`);

    return true;

  } catch (error) {

    console.error("Error enviando correo:", error.message);

    return false;

  }
};





/* =========================================================
   VOUCHER DE PAGO
========================================================= */

export const sendVoucherEmail = async (
  to,
  nombreCliente,
  pedidoId,
  total
) => {

  const totalFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP"
  }).format(total);

  const html = `
  <div style="font-family:Arial;max-width:600px;margin:auto">

  <h2>Voucher de pago</h2>

  <p>Hola ${nombreCliente}</p>

  <p>Pedido: <b>#${pedidoId}</b></p>

  <p>Total a pagar: <b>${totalFormateado}</b></p>

  </div>
  `;

  try {

    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Voucher de pago #${pedidoId}`,
      html
    });

    console.log(`Voucher enviado a ${to}`);

  } catch (error) {

    console.error("Error enviando voucher:", error.message);

  }
};





/* =========================================================
   FACTURA DE VENTA
========================================================= */

export const sendVentaFacturaEmail = async (
  to,
  nombreCliente,
  ventaId,
  total,
  detalles
) => {

  const formatterCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  });

  const totalFormateado = formatterCOP.format(total);

  const subtotal = total / 1.19;

  const iva = total - subtotal;

  const facturaNumero = ventaId.toString().slice(-8);

  const fechaActual = new Date().toLocaleDateString("es-CO");



  const detallesHtml = detalles.map(det => `
  <tr>
  <td style="padding:8px;border-bottom:1px solid #eee">${det.Nombre}</td>
  <td style="padding:8px;text-align:center">${det.Cantidad}</td>
  <td style="padding:8px;text-align:right">${formatterCOP.format(det.PrecioUnitario)}</td>
  <td style="padding:8px;text-align:right">${formatterCOP.format(det.Subtotal)}</td>
  </tr>
  `).join("");


  const html = `
  <div style="font-family:Arial;max-width:700px;margin:auto">

  <h2>Factura de venta</h2>

  <p>Factura No: ${facturaNumero}</p>

  <p>Cliente: ${nombreCliente}</p>

  <p>Fecha: ${fechaActual}</p>

  <table width="100%" style="border-collapse:collapse">

  <tr style="background:#1e3c72;color:white">
  <th>Descripción</th>
  <th>Cant</th>
  <th>Valor</th>
  <th>Total</th>
  </tr>

  ${detallesHtml}

  </table>

  <p>Subtotal: ${formatterCOP.format(subtotal)}</p>
  <p>IVA: ${formatterCOP.format(iva)}</p>

  <h3>Total: ${totalFormateado}</h3>

  </div>
  `;

  try {

    await transporter.sendMail({
      from: `"PublicidadDAS Facturación" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Factura #${facturaNumero}`,
      html
    });

    console.log(`Factura enviada a ${to}`);

    return true;

  } catch (error) {

    console.error("Error enviando factura:", error.message);

    return false;

  }
};





/* =========================================================
   FACTURA ANULADA
========================================================= */

export const sendVentaAnuladaEmail = async (
  to,
  nombreCliente,
  ventaId,
  total
) => {

  const totalFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP"
  }).format(total);

  const html = `
  <div style="font-family:Arial;max-width:600px;margin:auto">

  <h2>Venta anulada</h2>

  <p>Hola ${nombreCliente}</p>

  <p>La factura <b>#${ventaId}</b> fue anulada.</p>

  <p>Monto: ${totalFormateado}</p>

  </div>
  `;

  try {

    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Venta anulada #${ventaId}`,
      html
    });

    console.log(`Anulación enviada a ${to}`);

    return true;

  } catch (error) {

    console.error("Error enviando anulación:", error.message);

    return false;

  }
};