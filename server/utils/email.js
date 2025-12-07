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

export const sendWelcomeEmail = async (to, password) => {
  try {
    await transporter.sendMail({
      from: '"Mi App" <no-reply@miapp.com>',
      to,
      subject: "Bienvenido a la plataforma",
      text: `Hola! Tu cuenta ha sido creada. Tu contraseña es: ${password}`,
      html: `
        <p>Hola 👋,</p>
        <p>Tu cuenta ha sido creada correctamente.</p>
        <p><b>Contraseña:</b> ${password}</p>
        <p>Por favor cámbiala en tu primer inicio de sesión.</p>
      `
    });
    console.log("Correo enviado a:", to);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return false;
  }
};

// backend/utils/email.js
// ... tu código actual ...

//  NUEVA FUNCIÓN: notificar cambio de estado de pedido
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
      subject = `✅ Pedido #${pedidoId} aprobado`;
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
