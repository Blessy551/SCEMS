const mysql = require('mysql2/promise');
require('dotenv').config();

const requiredEnvKeys = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvKeys = requiredEnvKeys.filter((key) => {
  const value = process.env[key];
  return typeof value !== 'string' || value.trim() === '';
});

console.log('DB CONFIG:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  hasPassword: !!process.env.DB_PASSWORD
});

if (missingEnvKeys.length > 0) {
  throw new Error(`Missing required database environment variables: ${missingEnvKeys.join(', ')}`);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
