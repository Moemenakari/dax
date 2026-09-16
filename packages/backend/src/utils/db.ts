import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const dbHost = process.env.DB_HOST || 'localhost'
const needsSSL = process.env.NODE_ENV === 'production' || dbHost.includes('tidbcloud.com')

export const db = mysql.createPool({
  host:     dbHost,
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'dax_db',
  waitForConnections: true,
  connectionLimit: 10,
  ...(needsSSL && { ssl: { rejectUnauthorized: true } }),
})
