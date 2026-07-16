import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'dax_db',
  waitForConnections: true,
  connectionLimit: 10,
  ...(isProduction && { ssl: { rejectUnauthorized: true } }),
})
