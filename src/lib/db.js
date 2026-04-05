import mysql from 'mysql2/promise'

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: 'acore_auth',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 20,
    charset: 'utf8mb4'
  })
}

// Em dev, persiste o pool no global para sobreviver ao hot reload
// Em prod, usa módulo singleton normalmente
export function getPool() {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mysqlPool) {
      global._mysqlPool = createPool()
    }
    return global._mysqlPool
  }

  if (!global._mysqlPool) {
    global._mysqlPool = createPool()
  }
  return global._mysqlPool
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
