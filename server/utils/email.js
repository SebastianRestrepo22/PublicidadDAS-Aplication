// backend/utils/email.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // si usas Gmail
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // de .env
    pass: process.env.EMAIL_PASS  // contraseña de aplicación
  }
});

export const sendResetPasswordEmail = async (correo, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Ajusta a tu SMTP
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Link apuntando al frontend (React)
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const info = await transporter.sendMail({
      from: '"Mi App" <tu_correo@ejemplo.com>',
      to: correo,
      subject: "Restablecer contraseña",
      html: `
        <p>Haz clic en el enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>El enlace expira en 1 hora.</p>
      `,
    });

    console.log("Correo enviado: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error enviando correo:", error);
    return false;
  }
};

// NUEVA FUNCIÓN: notificar cambio de estado de pedido
export const sendPedidoEstadoEmail = async (to, nombreCliente, pedidoId, nuevoEstado, motivo = "") => {
  let subject = "";
  let html = "";

  switch (nuevoEstado) {
    case "pendiente":
      subject = `📄 Pedido #${pedidoId} recibido`;
      html = `
        <p>Hola ${nombreCliente} 👋,</p>
        <p>Hemos recibido tu pedido <strong>#${pedidoId}</strong> y está en revisión.</p>
        <p>Te notificaremos cuando sea aprobado.</p>
      `;
      break;
    case "aprobado":
      subject = `✅ Pedido #${pedidoId} aprobado`;
      html = `
        <p>¡Hola ${nombreCliente}!</p>
        <p>Tu pedido <strong>#${pedidoId}</strong> ha sido aprobado.</p>
        <p>Ahora pasará a producción.</p>
      `;
      break;
    case "en_produccion":
      subject = `🏭 Pedido #${pedidoId} en producción`;
      html = `
        <p>¡Hola ${nombreCliente}!</p>
        <p>Tu pedido <strong>#${pedidoId}</strong> ha sido aprobado y ya está en producción.</p>
        <p>Pronto recibirás más actualizaciones.</p>
      `;
      break;
    case "terminado":
      subject = `🎨 Pedido #${pedidoId} terminado`;
      html = `
        <p>¡Tu diseño está listo!</p>
        <p>El pedido <strong>#${pedidoId}</strong> ha sido terminado y está listo para entrega.</p>
      `;
      break;
    case "entregado":
      subject = `📦 Pedido #${pedidoId} entregado`;
      html = `
        <p>¡Gracias por tu confianza!</p>
        <p>Tu pedido <strong>#${pedidoId}</strong> ha sido entregado satisfactoriamente.</p>
      `;
      break;
    case "requiere_correccion":
      subject = `⚠️ Corrección necesaria en pedido #${pedidoId}`;
      html = `
        <p>Hola ${nombreCliente},</p>
        <p>Revisamos tu pedido <strong>#${pedidoId}</strong>, pero necesitamos una corrección:</p>
        <p><em>"${motivo}"</em></p>
        <p>Por favor, actualiza tu boceto y reenvíalo desde tu panel de cliente.</p>
      `;
      break;
    default:
      return; // No enviar correo para estados desconocidos
  }

  try {
    await transporter.sendMail({
      from: '"Tu Empresa" <no-reply@tuempresa.com>',
      to,
      subject,
      html,
    });
    console.log(`Correo de estado enviado a ${to} para pedido ${pedidoId}`);
  } catch (error) {
    console.error("Error al enviar correo de estado:", error);
    // No detener la app si falla el correo
  }
};

// Envía el voucher de pago al cliente
export const sendVoucherEmail = async (to, nombreCliente, pedidoId, total) => {
  const totalFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2
  }).format(total);

  const subject = `📄 Voucher de pago - Pedido #${pedidoId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333;">¡Gracias por tu pedido!</h2>
        <p style="color: #666;">Aquí tienes tu orden de pago</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
        <h3 style="margin-top: 0; color: #222;">Detalles del pedido</h3>
        <p><strong>Pedido:</strong> ${pedidoId}</p>
        <p><strong>Monto a pagar:</strong> ${totalFormateado}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CO")}</p>
        <p><strong>Cliente:</strong> ${nombreCliente}</p>
      </div>

      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
        <h3 style="margin-top: 0; color: #0d47a1;">Instrucciones de pago</h3>
        <ol style="padding-left: 20px;">
          <li>Realiza una transferencia por el monto exacto: <strong>${totalFormateado}</strong>.</li>
          <li>En el <strong>concepto o referencia</strong> de la transferencia, escribe: 
            <span style="background-color: #bbdefb; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
              ${pedidoId}
            </span>
          </li>
          <li>Adjunta el comprobante bancario en tu panel de cliente para que podamos verificarlo.</li>
        </ol>
      </div>

      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
        <p>Este es un mensaje automático. Por favor, no respondas a este correo.</p>
        <p>© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Tu Empresa" <no-reply@tuempresa.com>',
      to,
      subject,
      html,
    });
    console.log(`Voucher de pago enviado a ${to} para pedido ${pedidoId}`);
  } catch (error) {
    console.error("Error al enviar voucher por correo:", error);
  }
};