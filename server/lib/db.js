// server/lib/db.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

// Creamos el pool UNA SOLA VEZ (singleton)
const dbPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10, // Ajusta según tus necesidades
  queueLimit: 0
});

// Tu función connectDB sigue existiendo
const connectDB = async () => {
  return dbPool; // El pool ya es promisificado
};

export default connectDB;


// // server/lib/db.js
// import mysql from 'mysql2/promise';
// import 'dotenv/config';

// // Función que crea una NUEVA conexión en cada llamada
// const connectDB = async () => {
//   return await mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     connectTimeout: 10000,
//   });
// };

// // Exporta por defecto
// export default connectDB;