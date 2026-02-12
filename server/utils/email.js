// backend/utils/email.js
import nodemailer from "nodemailer";

// ✅ CONFIGURACIÓN ÚNICA Y ESTABLE PARA GMAIL (PUERTO 465)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,  // tuemail@gmail.com
    pass: process.env.EMAIL_PASS,  // ¡CONTRASEÑA DE APLICACIÓN DE 16 DÍGITOS!
  },
  pool: true,      // ✅ Reutiliza conexiones (evita "socket close")
  maxConnections: 5,
  rateLimit: true, // ✅ Evita bloqueos por exceso de envíos
  rateDelta: 1000,
  rateLimit: 10,
});

// ✅ Verificar conexión al iniciar la app (opcional pero recomendado)
transporter.verify(function (error, success) {
  if (error) {
    console.error("⚠️ Error de conexión SMTP:", error);
  } else {
    console.log("✅ Servidor SMTP listo para enviar correos");
  }
});

export const sendResetPasswordEmail = async (correo, token) => {
  try {
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    const info = await transporter.sendMail({
      from: `"Gestión de Usuarios" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "🚀 ¡Bienvenido! Establece tu contraseña",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Establecer Contraseña</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f7fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 30px; }
            .welcome-text { font-size: 18px; margin-bottom: 20px; color: #2d3748; }
            .highlight { background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 15px; margin: 25px 0; border-radius: 4px; }
            .button-container { text-align: center; margin: 35px 0; }
            .reset-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4); }
            .reset-button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(102, 126, 234, 0.5); }
            .link-alternative { font-size: 14px; color: #718096; margin-top: 15px; word-break: break-all; }
            .expiry-note { background-color: #fffaf0; border: 1px solid #fed7d7; border-radius: 8px; padding: 15px; margin-top: 30px; text-align: center; color: #c53030; }
            .steps { margin: 30px 0; padding-left: 20px; }
            .steps li { margin-bottom: 12px; color: #4a5568; }
            .footer { background-color: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
            .security-note { font-size: 12px; color: #a0aec0; margin-top: 15px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐 Gestión de Usuarios</div>
              <h1 style="margin: 10px 0 0 0; font-weight: 300;">¡Tu cuenta ha sido creada!</h1>
            </div>
            
            <div class="content">
              <p class="welcome-text">Hola,</p>
              
              <p>Nos complace informarte que tu cuenta en nuestro sistema ha sido creada exitosamente. 
              Para completar tu registro y acceder a todas las funcionalidades, debes establecer tu contraseña.</p>
              
              <div class="highlight">
                <strong>📋 Información importante:</strong>
                <p>Este enlace es personal e intransferible. Por seguridad, no lo compartas con nadie.</p>
              </div>
              
              <div class="button-container">
                <a href="${resetUrl}" class="reset-button">
                  🚀 Establecer mi contraseña
                </a>
                <p class="link-alternative">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                  <a href="${resetUrl}" style="color: #4299e1;">${resetUrl}</a>
                </p>
              </div>
              
              <div class="expiry-note">
                ⏰ <strong>IMPORTANTE:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
              </div>
              
              <h3 style="color: #2d3748; margin-top: 30px;">¿Qué hacer a continuación?</h3>
              <ol class="steps">
                <li>Haz clic en el botón "Establecer mi contraseña"</li>
                <li>Crea una contraseña segura (mínimo 8 caracteres)</li>
                <li>Confirma tu nueva contraseña</li>
                <li>¡Listo! Podrás acceder a tu cuenta inmediatamente</li>
              </ol>
              
              <p style="color: #4a5568; margin-top: 25px;">
                <strong>💡 Consejo de seguridad:</strong><br>
                Usa una contraseña que combine letras mayúsculas, minúsculas, números y símbolos.
              </p>
            </div>
            
            <div class="footer">
              <p>Este correo fue enviado automáticamente como parte del proceso de creación de cuenta.</p>
              <p>Si no solicitaste crear una cuenta, puedes ignorar este mensaje con seguridad.</p>
              <p class="security-note">
                🔒 Por tu seguridad, nunca te pediremos tu contraseña por correo electrónico.
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #cbd5e0;">
                © ${new Date().getFullYear()} Gestión de Usuarios. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
¡BIENVENIDO/A A GESTIÓN DE USUARIOS!

Nos complace informarte que tu cuenta ha sido creada exitosamente. 
Para completar tu registro y acceder a todas las funcionalidades, debes establecer tu contraseña.

ENLACE PARA ESTABLECER CONTRASEÑA:
${resetUrl}

📋 INFORMACIÓN IMPORTANTE:
- Este enlace es personal e intransferible
- Por seguridad, no lo compartas con nadie
- ⏰ El enlace expira en 1 hora

PASOS A SEGUIR:
1. Haz clic en el enlace de arriba
2. Crea una contraseña segura (mínimo 8 caracteres)
3. Confirma tu nueva contraseña
4. ¡Listo! Podrás acceder a tu cuenta inmediatamente

💡 CONSEJO DE SEGURIDAD:
Usa una contraseña que combine letras mayúsculas, minúsculas, números y símbolos.

---
🔒 Por tu seguridad, nunca te pediremos tu contraseña por correo electrónico.

Este correo fue enviado automáticamente como parte del proceso de creación de cuenta.
Si no solicitaste crear una cuenta, puedes ignorar este mensaje con seguridad.

© ${new Date().getFullYear()} Gestión de Usuarios. Todos los derechos reservados.
      `,
    });

    console.log("✅ Correo de bienvenida enviado a:", correo);
    return true;
  } catch (error) {
    console.error("❌ Error enviando correo de bienvenida:", error.message);
    // No lances error para no bloquear el flujo principal
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
    case "entregado":
      subject = `📦 Pedido #${pedidoId} entregado`;
      html = `
        <p>¡Gracias por tu confianza, ${nombreCliente}!</p>
        <p>Tu pedido <strong>#${pedidoId}</strong> ha sido entregado satisfactoriamente.</p>
        <p>Esperamos verte pronto nuevamente.</p>
      `;
      break;
    case "cancelado":
      subject = `❌ Pedido #${pedidoId} cancelado`;
      html = `
        <p>Hola ${nombreCliente},</p>
        <p>Informamos que tu pedido <strong>#${pedidoId}</strong> ha sido cancelado.</p>
        ${motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ""}
        <p>Si tienes dudas, contáctanos.</p>
      `;
      break;
    default:
      return; // No enviar para estados no manejados
  }

  try {
    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
            <h1 style="color: #2d3748; margin: 0;">Tu Empresa</h1>
          </div>
          <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            ${html}
          </div>
          <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
            <p>Este es un mensaje automático. No respondas a este correo.</p>
            <p>© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Correo de estado '${nuevoEstado}' enviado a ${to} para pedido ${pedidoId}`);
  } catch (error) {
    console.error(`❌ Error al enviar correo de estado '${nuevoEstado}':`, error.message);
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e2e8f0;">
        <h1 style="color: #2d3748; margin: 0;">Tu Empresa</h1>
      </div>
      
      <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
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
      </div>

      <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
        <p>Este es un mensaje automático. No respondas a este correo.</p>
        <p>© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Voucher de pago enviado a ${to} para pedido ${pedidoId}`);
  } catch (error) {
    console.error("❌ Error al enviar voucher por correo:", error.message);
  }
};