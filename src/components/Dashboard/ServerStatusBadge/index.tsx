import { useState } from "react"
import { Users, Wifi, WifiOff } from "lucide-react"
import { mockServerStatus } from "@/lib/mock-data"

const ServerStatusBadge = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const status = mockServerStatus

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
              {status.playersOnline.toLocaleString()}
            </span>
            <span className="hidden sm:inline"> / {status.maxPlayers.toLocaleString()}</span>
          </span>
        </div>

        <span
          className={`badge gap-1 text-xs font-medium ${
            status.online
              ? "border-success bg-success/10 text-success"
              : "badge-error"
          }`}
        >
          {status.online ? (
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
        <div className="absolute bottom-full right-0 z-50 mb-2 min-w-[180px] rounded-lg border border-base-300 bg-base-100 px-3 py-2 shadow-lg">
          <p className="text-sm">
            <span className="font-semibold">Realm:</span> {status.realmName}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Uptime:</span> {status.uptime}
          </p>
          {status.nextMaintenance && (
            <p className="text-sm">
              <span className="font-semibold">Manutenção:</span> {status.nextMaintenance}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default ServerStatusBadge
