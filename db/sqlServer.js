import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const pool = new sql.ConnectionPool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
});

export const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Connected to SQL Server');
    return pool;
  } catch (err) {
    console.error('DB Connection Error:', err);
    throw err;
  }
};

export default pool;
