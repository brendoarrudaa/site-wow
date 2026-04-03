import net from 'net'
import { getPool } from '@/lib/db'

const WORLD_HOST = process.env.WORLD_HOST || '127.0.0.1'
const WORLD_PORT = parseInt(process.env.WORLD_PORT || '8085')
const MAX_POPULATION = parseInt(process.env.SERVER_MAX_POPULATION || '1000')

const REALM_TYPE = { 0: 'Normal', 1: 'PvP', 4: 'Normal', 6: 'RP', 8: 'RP-PvP' }

function checkTcp(host, port, timeout = 3000) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port })
    const timer = setTimeout(() => { socket.destroy(); resolve(false) }, timeout)
    socket.on('connect', () => { clearTimeout(timer); socket.destroy(); resolve(true) })
    socket.on('error', () => { clearTimeout(timer); resolve(false) })
  })
}

function formatUptime(seconds) {
  if (!seconds || seconds <= 0) return '—'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  parts.push(`${m}m`)
  return parts.join(' ')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  // Cache 15 segundos para não sobrecarregar
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')

  try {
    const pool = getPool()

    const [isOnline, realmRows, uptimeRows, playerRows] = await Promise.all([
      checkTcp(WORLD_HOST, WORLD_PORT),
      pool.query('SELECT name, icon, flag FROM acore_auth.realmlist WHERE id = 1'),
      pool.query(
        'SELECT starttime FROM acore_auth.uptime WHERE realmid = 1 ORDER BY starttime DESC LIMIT 1'
      ),
      pool.query(
        'SELECT COUNT(*) AS count FROM acore_characters.characters WHERE online = 1'
      ),
    ])

    const realm = realmRows[0][0]
    const latestUptime = uptimeRows[0][0]
    const population = playerRows[0][0].count

    const uptimeSeconds = latestUptime
      ? Math.floor(Date.now() / 1000) - latestUptime.starttime
      : 0

    // flag 2 = offline forçado pelo admin, ignora TCP
    const forcedOffline = realm && (realm.flag & 2) !== 0
    const status = forcedOffline ? 'offline' : isOnline ? 'online' : 'offline'

    return res.status(200).json({
      name: realm?.name || 'Azeroth Legacy',
      type: REALM_TYPE[realm?.icon] || 'PvP',
      status,
      population,
      maxPopulation: MAX_POPULATION,
      uptime: formatUptime(uptimeSeconds),
    })
  } catch (err) {
    console.error('[server/status]', err)
    return res.status(200).json({
      name: 'Azeroth Legacy',
      type: 'PvP',
      status: 'offline',
      population: 0,
      maxPopulation: MAX_POPULATION,
      uptime: '—',
    })
  }
}
