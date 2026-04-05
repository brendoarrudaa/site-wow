import { useEffect, useState } from 'react'
import { Users, Wifi, WifiOff } from 'lucide-react'

interface StatusData {
  name: string
  status: 'online' | 'offline'
  population: number
  maxPopulation: number
  uptime: string
}

const ServerStatusBadge = () => {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    const load = () =>
      fetch('/api/server/status')
        .then(r => r.json())
        .then(setStatus)
        .catch(() => {})

    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!status) return null

  const online = status.status === 'online'

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
    >
      <div className="flex cursor-default items-center gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-base-content/50" />
          <span className="text-sm text-base-content/60">
            <span className="font-semibold text-base-content">
              {status.population.toLocaleString()}
            </span>
            <span className="hidden sm:inline">
              {' '}
              / {status.maxPopulation.toLocaleString()}
            </span>
          </span>
        </div>

        <span
          className={`badge rounded-lg gap-1 text-xs font-medium p-2 ${
            online ? 'border-success bg-success/10 text-success' : 'badge-error'
          }`}
        >
          {online ? (
            <>
              <Wifi className="h-3 w-3" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              Offline
            </>
          )}
        </span>
      </div>

      {tooltipOpen && (
        <div className="absolute right-0 z-50 mb-2 min-w-[180px] rounded-lg border border-base-300 bg-base-100 px-3 py-2 shadow-lg">
          <p className="text-sm">
            <span className="font-semibold">Realm:</span> {status.name}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Uptime:</span> {status.uptime}
          </p>
        </div>
      )}
    </div>
  )
}

export default ServerStatusBadge
