import { Trophy, Medal, Award, Shield } from "lucide-react"
import { RankingPlayer, classColors } from "@/lib/mock-data"

interface RankingTableProps {
  players: RankingPlayer[]
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

const RankingTable = ({ players, type, highlightPlayer }: RankingTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-base-300">
      <div className="overflow-x-auto">
        <table className="table w-full text-sm">
          <thead>
            <tr className="border-b border-base-300 bg-base-200">
              <th className="w-14 px-4 py-3 text-left font-medium text-base-content/60">Pos.</th>
              <th className="px-4 py-3 text-left font-medium text-base-content/60">Jogador</th>
              <th className="hidden px-4 py-3 text-left font-medium text-base-content/60 sm:table-cell">
                Classe
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-base-content/60 md:table-cell">
                Facção
              </th>
              {type === "arena" ? (
                <>
                  <th className="px-4 py-3 text-right font-medium text-base-content/60">Rating</th>
                  <th className="hidden px-4 py-3 text-right font-medium text-base-content/60 lg:table-cell">
                    W/L
                  </th>
                </>
              ) : (
                <th className="px-4 py-3 text-right font-medium text-base-content/60">HKs</th>
              )}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const isHighlighted = player.name === highlightPlayer
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
                      <Shield className={`h-4 w-4 shrink-0 ${classColors[player.class]}`} />
                      <div>
                        <span className={`font-medium ${isHighlighted ? "text-primary" : ""}`}>
                          {player.name}
                        </span>
                        {player.guild && (
                          <p className="text-xs text-base-content/50">{player.guild}</p>
                        )}
                      </div>
                      {isHighlighted && (
                        <span className="badge badge-outline border-primary text-[10px] text-primary">
                          Você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`hidden px-4 py-3 sm:table-cell ${classColors[player.class]}`}>
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
                  {type === "arena" ? (
                    <>
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        {player.rating}
                      </td>
                      <td className="hidden px-4 py-3 text-right lg:table-cell">
                        <span className="text-success">{player.wins}</span>
                        <span className="text-base-content/40"> / </span>
                        <span className="text-error">{player.losses}</span>
                      </td>
                    </>
                  ) : (
                    <td className="px-4 py-3 text-right font-bold">
                      {player.rating.toLocaleString()}
                    </td>
                  )}
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
