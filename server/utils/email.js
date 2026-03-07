import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,  // tuemail@gmail.com
    pass: process.env.EMAIL_PASS,  // ¡CONTRASEÑA DE APLICACIÓN DE 16 DÍGITOS!
  },
  pool: true,      //  Reutiliza conexiones (evita "socket close")
  maxConnections: 5,
  rateLimit: true, //  Evita bloqueos por exceso de envíos
  rateDelta: 1000,
  rateLimit: 10,
});

//  Verificar conexión al iniciar la app (opcional pero recomendado)
transporter.verify(function (error, success) {
  if (error) {
    console.error("⚠️ Error de conexión SMTP:", error);
  } else {
    console.log(" Servidor SMTP listo para enviar correos");
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

    console.log(" Correo de bienvenida enviado a:", correo);
    return true;
  } catch (error) {
    console.error("❌ Error enviando correo de bienvenida:", error.message);
    // No lances error para no bloquear el flujo principal
    return false;
  }
};

// NUEVA FUNCIÓN: notificar cambio de estado de pedido
// src/utils/email.js - Mejorar la función sendPedidoEstadoEmail

export const sendPedidoEstadoEmail = async (to, nombreCliente, pedidoId, nuevoEstado, motivo = "") => {
  // Configuración de mensajes según el estado
  const estadoConfig = {
    pendiente: {
      emoji: "📄",
      titulo: "¡Hemos recibido tu pedido!",
      color: "#f39c12",
      mensaje: "Tu pedido ha sido recibido y está siendo revisado por nuestro equipo.",
      siguiente: "Te notificaremos cuando sea aprobado.",
      accion: "Seguir pedido"
    },
    aprobado: {
      emoji: "",
      titulo: "¡Pedido aprobado!",
      color: "#27ae60",
      mensaje: "¡Buenas noticias! Tu pedido ha sido aprobado y pasará a producción.",
      siguiente: "Pronto recibirás noticias sobre su progreso.",
      accion: "Ver detalles"
    },
    entregado: {
      emoji: "📦",
      titulo: "¡Pedido entregado!",
      color: "#2980b9",
      mensaje: "Tu pedido ha sido entregado satisfactoriamente.",
      siguiente: "Esperamos que disfrutes tu compra. ¡Gracias por confiar en nosotros!",
      accion: "Calificar servicio"
    },
    cancelado: {
      emoji: "❌",
      titulo: "Pedido cancelado",
      color: "#c0392b",
      mensaje: "Lamentamos informarte que tu pedido ha sido cancelado.",
      siguiente: motivo ? `Motivo: ${motivo}` : "Si tienes dudas, contáctanos.",
      accion: "Contactar soporte"
    }
  };

  const config = estadoConfig[nuevoEstado] || estadoConfig.pendiente;

  // URL para ver el pedido (ajusta según tu frontend)
  const pedidoUrl = `http://localhost:5173/pedidos/${pedidoId}`;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Actualización de pedido #${pedidoId}</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f7f9;">
      <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header con color según estado -->
        <div style="background: ${config.color}; padding: 30px 20px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">${config.emoji}</div>
          <h1 style="color: white; margin: 0; font-size: 28px;">${config.titulo}</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Pedido #${pedidoId}</p>
        </div>
        
        <!-- Contenido -->
        <div style="padding: 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hola <strong>${nombreCliente}</strong>,</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #555; line-height: 1.6;">
              ${config.mensaje}
            </p>
          </div>
          
          <p style="color: #666; margin: 20px 0; font-size: 16px;">${config.siguiente}</p>
          
          <!-- Botón de acción -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pedidoUrl}" 
               style="background-color: ${config.color}; color: white; padding: 14px 35px; 
                      text-decoration: none; border-radius: 50px; font-weight: bold; 
                      font-size: 16px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                      transition: transform 0.2s;">
              ${config.accion} →
            </a>
          </div>
          
          <!-- Resumen del pedido -->
          <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">Resumen del pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Número de pedido:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">#${pedidoId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Fecha:</td>
                <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('es-CO')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Estado actual:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background-color: ${config.color}20; color: ${config.color}; 
                               padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                    ${nuevoEstado.toUpperCase()}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Nota de ayuda -->
          <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #2c3e50; font-size: 14px;">
              <strong>💡 ¿Necesitas ayuda?</strong><br>
              Si tienes alguna pregunta, responde a este correo o contáctanos al 
              <a href="tel:+573001234567" style="color: ${config.color}; text-decoration: none;">+57 300 123 4567</a>
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            Este es un mensaje automático. Por favor no respondas a este correo.<br>
            © ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.<br>
            <a href="#" style="color: #999; text-decoration: none;">Términos y condiciones</a> | 
            <a href="#" style="color: #999; text-decoration: none;">Política de privacidad</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Versión texto plano para clientes de correo que no soportan HTML
  const text = `
    Actualización de pedido #${pedidoId}
    
    Hola ${nombreCliente},
    
    ${config.mensaje}
    
    ${config.siguiente}
    
    Para ver los detalles de tu pedido, visita: ${pedidoUrl}
    
    Número de pedido: #${pedidoId}
    Fecha: ${new Date().toLocaleDateString('es-CO')}
    Estado: ${nuevoEstado.toUpperCase()}
    
    ¿Necesitas ayuda? Contáctanos al +57 300 123 4567
    
    ---
    Este es un mensaje automático. Por favor no respondas a este correo.
    © ${new Date().getFullYear()} Tu Empresa
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Tu Empresa" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${config.emoji} Actualización de pedido #${pedidoId} - ${nuevoEstado}`,
      html,
      text
    });

    console.log(` Correo de estado '${nuevoEstado}' enviado a ${to} para pedido ${pedidoId}`);
    console.log('📧 Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar correo de estado '${nuevoEstado}':`, error.message);
    return false;
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
    console.log(` Voucher de pago enviado a ${to} para pedido ${pedidoId}`);
  } catch (error) {
    console.error("❌ Error al enviar voucher por correo:", error.message);
  }
};

// ENVÍA FACTURA DE VENTA
export const sendVentaFacturaEmail = async (to, nombreCliente, ventaId, total, detalles) => {
  // Formateo de moneda colombiana
  const formatterCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const totalFormateado = formatterCOP.format(total);
  
  // Calcular subtotal e IVA (19%)
  const subtotal = total / 1.19;
  const iva = total - subtotal;
  
  // Número de factura formateado (últimos 8 dígitos del UUID)
  const facturaNumero = ventaId.toString().replace(/-/g, '').slice(-8).toUpperCase();
  
  // Fecha actual formateada
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generar HTML de los detalles
  const detallesHtml = detalles.map((det, index) => {
    // Determinar variante (color o tamaño)
    let varianteTexto = '';
    
    if (det.TipoItem === 'producto' && det.ColorId) {
      const colorNombre = det.ColorNombre || 'Color no especificado';
      const colorHex = det.ColorHex || '#ccc';
      varianteTexto = `
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
          <span style="display: inline-block; width: 16px; height: 16px; border-radius: 50%; background-color: ${colorHex}; border: 1px solid #ddd;"></span>
          <span style="font-size: 12px; color: #666;">${colorNombre}</span>
        </div>`;
    } else if (det.TipoItem === 'servicio' && det.ServicioTamanoId) {
      const tamanoNombre = det.NombreTamano || 'Tamaño no especificado';
      varianteTexto = `
        <div style="margin-top: 5px;">
          <span style="background-color: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">${tamanoNombre}</span>
        </div>`;
    }

    // Descripción personalizada
    const descripcionExtra = det.DescripcionPersonalizada 
      ? `<div style="font-size: 11px; color: #666; margin-top: 5px; font-style: italic;">📝 ${det.DescripcionPersonalizada}</div>` 
      : '';

    // Imagen si existe (para servicios)
    const imagenHtml = det.UrlImagenPersonalizada && det.TipoItem === 'servicio'
      ? `<div style="margin-top: 8px;"><img src="${det.UrlImagenPersonalizada}" alt="Referencia" style="max-width: 60px; max-height: 60px; border-radius: 4px; border: 1px solid #eee;"></div>`
      : '';

    return `
    <tr style="${index % 2 === 0 ? 'background-color: #fafafa;' : ''}">
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaecef;">
        <div style="font-weight: 500; color: #2c3e50;">${det.NombreSnapshot || det.Nombre}</div>
        ${varianteTexto}
        ${descripcionExtra}
        ${imagenHtml}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaecef; text-align: center; color: #2c3e50;">${det.Cantidad}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaecef; text-align: right; color: #2c3e50;">${formatterCOP.format(det.PrecioUnitario)}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaecef; text-align: right; font-weight: 500; color: #2c3e50;">${formatterCOP.format(det.Subtotal)}</td>
    </tr>
  `}).join('');

  const subject = `Factura Electrónica de Venta No. ${facturaNumero} - PublicidadDAS`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura de Venta - PublicidadDAS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica', 'Arial', sans-serif; background-color: #f0f2f5;">
      <div style="max-width: 800px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
        
        <!-- ENCABEZADO CON LOGO Y DATOS DE LA EMPRESA -->
        <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 700;">PublicidadDAS</h1>
              <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Soluciones en Publicidad y Marketing</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; margin-bottom: 5px;">NIT: 901.234.567-8</div>
              <div style="font-size: 14px;">Régimen Común</div>
            </div>
          </div>
        </div>

        <!-- TÍTULO FACTURA Y NÚMERO -->
        <div style="padding: 25px 30px; border-bottom: 2px solid #eaecef;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <h2 style="margin: 0; color: #1e3c72; font-size: 24px;">FACTURA DE VENTA</h2>
              <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Documento equivalente a factura</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px 25px; border-radius: 8px; text-align: center;">
              <div style="font-size: 13px; color: #666; margin-bottom: 5px;">FACTURA No.</div>
              <div style="font-size: 22px; font-weight: bold; color: #1e3c72; letter-spacing: 1px;">${facturaNumero}</div>
            </div>
          </div>
        </div>

        <!-- INFORMACIÓN DEL CLIENTE Y FECHA -->
        <div style="padding: 25px 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border-bottom: 2px solid #eaecef;">
          <div>
            <h3 style="margin: 0 0 15px; color: #1e3c72; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <div style="margin-bottom: 8px;">
                <span style="color: #666; font-size: 13px;">Nombre:</span>
                <span style="font-weight: 500; margin-left: 10px; color: #2c3e50;">${nombreCliente}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: #666; font-size: 13px;">Email:</span>
                <span style="margin-left: 10px; color: #2c3e50;">${to}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style="margin: 0 0 15px; color: #1e3c72; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Detalles</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              <div style="margin-bottom: 8px;">
                <span style="color: #666; font-size: 13px;">Fecha emisión:</span>
                <span style="font-weight: 500; margin-left: 10px; color: #2c3e50;">${fechaActual}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <span style="color: #666; font-size: 13px;">Forma de pago:</span>
                <span style="font-weight: 500; margin-left: 10px; color: #2c3e50;">Pago inmediato</span>
              </div>
              <div>
                <span style="color: #666; font-size: 13px;">Estado:</span>
                <span style="background-color: #27ae60; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px;">PAGADA</span>
              </div>
            </div>
          </div>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
          <p style="margin: 0; color: #2e7d32;"> Esta factura ya fue cancelada</p>

        <!-- TABLA DE PRODUCTOS/SERVICIOS -->
        <div style="padding: 25px 30px;">
          <h3 style="margin: 0 0 20px; color: #1e3c72; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Detalle de productos y servicios</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #1e3c72;">
                <th style="padding: 15px 8px; text-align: left; color: white; font-size: 13px; font-weight: 600; border-radius: 8px 0 0 8px;">Descripción</th>
                <th style="padding: 15px 8px; text-align: center; color: white; font-size: 13px; font-weight: 600;">Cant.</th>
                <th style="padding: 15px 8px; text-align: right; color: white; font-size: 13px; font-weight: 600;">Valor Unit.</th>
                <th style="padding: 15px 8px; text-align: right; color: white; font-size: 13px; font-weight: 600; border-radius: 0 8px 8px 0;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${detallesHtml}
            </tbody>
          </table>
        </div>

        <!-- RESUMEN DE VALORES -->
        <div style="padding: 0 30px 25px; display: flex; justify-content: flex-end;">
          <div style="width: 350px; background: #f8f9fa; padding: 20px; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #d0d7de;">
              <span style="color: #4a5568;">Subtotal:</span>
              <span style="font-weight: 500;">${formatterCOP.format(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #d0d7de;">
              <span style="color: #4a5568;">IVA (19%):</span>
              <span style="font-weight: 500;">${formatterCOP.format(iva)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 2px solid #1e3c72;">
              <span style="font-size: 18px; font-weight: bold; color: #1e3c72;">TOTAL:</span>
              <span style="font-size: 22px; font-weight: bold; color: #1e3c72;">${totalFormateado}</span>
            </div>
          </div>
        </div>

        <!-- INFORMACIÓN LEGAL Y PIE DE PÁGINA -->
        <div style="background-color: #f8f9fa; padding: 25px 30px; border-top: 2px solid #eaecef;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
            <div>
              <h4 style="margin: 0 0 10px; color: #1e3c72; font-size: 14px;">Información de interés</h4>
              <p style="margin: 0 0 5px; color: #4a5568; font-size: 12px;">✔️ Esta factura se asimila a una factura electrónica para efectos legales.</p>
              <p style="margin: 0 0 5px; color: #4a5568; font-size: 12px;">✔️ Los productos y servicios aquí descritos cumplen con las especificaciones acordadas.</p>
              <p style="margin: 0; color: #4a5568; font-size: 12px;">✔️ Cualquier reclamo debe realizarse dentro de los 5 días hábiles siguientes.</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 5px; color: #4a5568; font-size: 12px;">Resolución DIAN No. 1876000000005</p>
              <p style="margin: 0 0 5px; color: #4a5568; font-size: 12px;">Fecha de autorización: 2024-01-01</p>
              <p style="margin: 0; color: #4a5568; font-size: 12px;">Rango autorizado: 1 al 1000</p>
            </div>
          </div>
          <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #d0d7de;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
              PublicidadDAS - NIT 901.234.567-8 | Dirección: Calle 123 #45-67, Bogotá | Tel: (601) 234 5678
            </p>
            <p style="margin: 5px 0 0; color: #94a3b8; font-size: 11px;">
              © ${new Date().getFullYear()} PublicidadDAS - Todos los derechos reservados.
            </p>
            <p style="margin: 5px 0 0; color: #94a3b8; font-size: 10px;">
              Este documento es una representación de una factura de venta. Conservar para efectos contables y tributarios.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"PublicidadDAS - Facturación" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(` Factura enviada a ${to} para venta ${ventaId}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar factura por correo:", error.message);
    return false;
  }
};

// ENVÍA NOTIFICACIÓN DE ANULACIÓN
export const sendVentaAnuladaEmail = async (to, nombreCliente, ventaId, total) => {
  const totalFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(total);

  const subject = `⚠️ Venta anulada #${ventaId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #e74c3c;">
        <h1 style="color: #2d3748; margin: 0;">Tu Empresa</h1>
        <p style="color: #666; margin-top: 5px;">Notificación de anulación</p>
      </div>
      
      <div style="padding: 30px; background: white; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #c0392b;">Venta anulada</h2>
          <p style="color: #666;">Hola, ${nombreCliente}</p>
        </div>

        <div style="background-color: #fdeded; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #e74c3c;">
          <h3 style="margin-top: 0; color: #c0392b;">Información importante</h3>
          <p><strong>Factura No.:</strong> ${ventaId}</p>
          <p><strong>Monto:</strong> ${totalFormateado}</p>
          <p><strong>Fecha de anulación:</strong> ${new Date().toLocaleDateString("es-CO")}</p>
        </div>

        <div style="background-color: #fef9e7; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; color: #7d6608;">
            <strong>⚠️ La factura anterior No. ${ventaId} ha sido anulada y no es válida para ningún efecto legal o contable.</strong>
          </p>
          <p style="margin-top: 10px; color: #666;">
            Si realizaste algún pago, será reembolsado en los próximos días hábiles.
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #718096; font-size: 14px;">
        <p>Este es un mensaje automático.</p>
        <p>© ${new Date().getFullYear()} Tu Empresa.</p>
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
    console.log(` Anulación enviada a ${to} para venta ${ventaId}`);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar anulación:", error.message);
    return false;
  }
};