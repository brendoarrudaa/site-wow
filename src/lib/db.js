import mysql from 'mysql2/promise'

let pool

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: 'acore_auth',
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    })
  }
  return pool
}

export async function query(sql, params) {
  const pool = getPool()
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function getConnection() {
  const pool = getPool()
  return pool.getConnection()
}
