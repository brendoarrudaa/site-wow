import { Trophy, Medal, Award, Shield } from "lucide-react"

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "text-red-500",
  Druid: "text-orange-400",
  Hunter: "text-green-400",
  Mage: "text-cyan-400",
  Paladin: "text-pink-400",
  Priest: "text-white",
  Rogue: "text-yellow-400",
  Shaman: "text-blue-400",
  Warlock: "text-purple-400",
  Warrior: "text-amber-600",
}

export interface ArenaPlayer {
  position: number
  name: string
  class: string
  faction: "Horda" | "Aliança"
  rating: number
  wins: number
  losses: number
  guild: string | null
}

export interface HKPlayer {
  position: number
  name: string
  class: string
  faction: "Horda" | "Aliança"
  kills: number
  guild: string | null
}

interface RankingTableProps {
  arenaPlayers?: ArenaPlayer[]
  hkPlayers?: HKPlayer[]
  type: "arena" | "hk"
  highlightPlayer?: string
}

const getPositionIcon = (position: number) => {
  if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
  if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />
  if (position === 3) return <Award className="h-5 w-5 text-amber-600" />
  return <span className="text-base-content/50">{position}</span>
}

const getPositionBg = (position: number) => {
  if (position === 1) return "bg-yellow-500/10"
  if (position === 2) return "bg-gray-400/10"
  if (position === 3) return "bg-amber-600/10"
  return ""
}

const RankingTable = ({
  arenaPlayers,
  hkPlayers,
  type,
  highlightPlayer,
}: RankingTableProps) => {
  const isEmpty =
    (type === "arena" && (!arenaPlayers || arenaPlayers.length === 0)) ||
    (type === "hk" && (!hkPlayers || hkPlayers.length === 0))

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-base-content/40">
        <Shield className="h-10 w-10 opacity-20 mb-2" />
        <p className="text-sm">Nenhum jogador encontrado neste ranking.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-base-300">
      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="border-b border-base-300 bg-base-200">
              <th className="w-14 px-4 py-3 text-left font-medium text-base-content/60">
                Pos.
              </th>
              <th className="px-4 py-3 text-left font-medium text-base-content/60">
                Jogador
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-base-content/60 sm:table-cell">
                Classe
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-base-content/60 md:table-cell">
                Facção
              </th>
              {type === "arena" ? (
                <>
                  <th className="px-4 py-3 text-right font-medium text-base-content/60">
                    Rating
                  </th>
                  <th className="hidden px-4 py-3 text-right font-medium text-base-content/60 lg:table-cell">
                    W/L
                  </th>
                </>
              ) : (
                <th className="px-4 py-3 text-right font-medium text-base-content/60">
                  HKs
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {type === "arena" &&
              arenaPlayers?.map((player) => {
                const isHighlighted = player.name === highlightPlayer
                const classColor = CLASS_COLORS[player.class] ?? "text-base-content"
                return (
                  <tr
                    key={`${player.position}-${player.name}`}
                    className={`border-b border-base-300 transition-colors last:border-0 hover:bg-base-200/50 ${getPositionBg(
                      player.position
                    )} ${isHighlighted ? "bg-primary/10 hover:bg-primary/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        {getPositionIcon(player.position)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 shrink-0 ${classColor}`} />
                        <div>
                          <span className={`font-medium ${isHighlighted ? "text-primary" : ""}`}>
                            {player.name}
                          </span>
                          {player.guild && (
                            <p className="text-xs text-base-content/50">
                              {player.guild}
                            </p>
                          )}
                        </div>
                        {isHighlighted && (
                          <span className="badge badge-outline border-primary text-[10px] text-primary">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`hidden px-4 py-3 sm:table-cell ${classColor}`}>
                      {player.class}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span
                        className={`badge badge-outline text-xs ${
                          player.faction === "Horda"
                            ? "border-red-500 text-red-500"
                            : "border-blue-500 text-blue-500"
                        }`}
                      >
                        {player.faction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {player.rating}
                    </td>
                    <td className="hidden px-4 py-3 text-right lg:table-cell">
                      <span className="text-success">{player.wins}</span>
                      <span className="text-base-content/40"> / </span>
                      <span className="text-error">{player.losses}</span>
                    </td>
                  </tr>
                )
              })}
            {type === "hk" &&
              hkPlayers?.map((player) => {
                const isHighlighted = player.name === highlightPlayer
                const classColor = CLASS_COLORS[player.class] ?? "text-base-content"
                return (
                  <tr
                    key={`${player.position}-${player.name}`}
                    className={`border-b border-base-300 transition-colors last:border-0 hover:bg-base-200/50 ${getPositionBg(
                      player.position
                    )} ${isHighlighted ? "bg-primary/10 hover:bg-primary/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        {getPositionIcon(player.position)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 shrink-0 ${classColor}`} />
                        <div>
                          <span className={`font-medium ${isHighlighted ? "text-primary" : ""}`}>
                            {player.name}
                          </span>
                          {player.guild && (
                            <p className="text-xs text-base-content/50">
                              {player.guild}
                            </p>
                          )}
                        </div>
                        {isHighlighted && (
                          <span className="badge badge-outline border-primary text-[10px] text-primary">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`hidden px-4 py-3 sm:table-cell ${classColor}`}>
                      {player.class}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span
                        className={`badge badge-outline text-xs ${
                          player.faction === "Horda"
                            ? "border-red-500 text-red-500"
                            : "border-blue-500 text-blue-500"
                        }`}
                      >
                        {player.faction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {player.kills.toLocaleString()}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RankingTable
