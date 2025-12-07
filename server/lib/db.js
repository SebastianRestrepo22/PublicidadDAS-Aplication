import mysql from 'mysql2/promise';
import 'dotenv/config';

let connection;

export const connectDB = async () => {
  try {
    if (!connection) {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      console.log('Conexión exitosa con MySQL usando mysql2');
    }

    // Si necesitas crear tablas manualmente, puedes hacerlo aquí:
    // await connection.execute(`CREATE TABLE IF NOT EXISTS users (...)`);

    return connection;
  } catch (error) {
    console.error('Error de conexión con MySQL:', error);
    process.exit(1);
  }
};

export const connectionToDatabase = async () => {
    if(!connection){
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }
    return connection;
};

export default connectDB;
