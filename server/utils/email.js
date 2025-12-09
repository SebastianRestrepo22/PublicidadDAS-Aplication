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

