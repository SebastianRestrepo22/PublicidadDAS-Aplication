import jwt from "jsonwebtoken";
import connectDB from "../lib/db.js";

const JWT_KEY = process.env.JWT_KEY || "-secret-token";
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. Token requerido." });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded; // Ahora req.user contiene el payload (incluyendo CedulaId)

    const connection = await connectDB();
    const [rows] = await connection.execute(
      "SELECT CedulaId FROM usuarios WHERE CedulaId = ?",
      [decoded.CedulaId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: "Usuario no registrado" });
    }

    next();
  } catch (error) {
    console.error("Token inválido:", error.message);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};