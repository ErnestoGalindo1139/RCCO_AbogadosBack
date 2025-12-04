import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false, // desactiva si tu servidor no usa SSL
    trustServerCertificate: true,
  },
};

export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    console.log('✅ Conexión exitosa a SQL Server');
    return pool;
  } catch (err) {
    console.error('❌ Error al conectar a SQL Server:', err.message);
  }
};

// 👇 Esta línea es la clave
export { sql };
