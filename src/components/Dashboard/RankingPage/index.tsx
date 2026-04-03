import { useState } from "react"
import { Search, Trophy, Swords, Users, Crown } from "lucide-react"
import {
  mockArena2v2Ranking,
  mockArena3v3Ranking,
  mockHKRanking,
  mockUser,
} from "@/lib/mock-data"
import RankingTable from "@/components/Dashboard/RankingTable"

type Tab = "2v2" | "3v3" | "hk"

const RankingPage = () => {
  const [tab, setTab] = useState<Tab>("2v2")
  const [search, setSearch] = useState("")
  const [faction, setFaction] = useState("all")

  const userCharName = mockUser.characters[0]?.name ?? ""

  const filterPlayers = (players: typeof mockArena2v2Ranking) =>
    players.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchFaction =
        faction === "all" ||
        (faction === "horda" && p.faction === "Horda") ||
        (faction === "alianca" && p.faction === "Aliança")
      return matchSearch && matchFaction
    })

  const user2v2 = mockArena2v2Ranking.find((p) => p.name === userCharName)
  const user3v3 = mockArena3v3Ranking.find((p) => p.name === userCharName)
  const userHK = mockHKRanking.find((p) => p.name === userCharName)

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "2v2", label: "Arena 2v2", icon: Users },
    { key: "3v3", label: "Arena 3v3", icon: Trophy },
    { key: "hk", label: "Honorable Kills", icon: Swords },
  ]

  const activeData =
    tab === "2v2"
      ? filterPlayers(mockArena2v2Ranking)
      : tab === "3v3"
      ? filterPlayers(mockArena3v3Ranking)
      : filterPlayers(mockHKRanking)

  const activeType = tab === "hk" ? "hk" : "arena"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">Ranking PvP</h1>
        <p className="text-sm text-base-content/60">
          Veja os melhores jogadores do servidor em arena e PvP
        </p>
      </div>

      {/* User stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Arena 2v2",
            value: mockUser.characters[0]?.arenaRating2v2 ?? 0,
            pos: user2v2?.position,
            icon: Users,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Arena 3v3",
            value: mockUser.characters[0]?.arenaRating3v3 ?? 0,
            pos: user3v3?.position,
            icon: Trophy,
            color: "bg-secondary/10 text-secondary",
          },
          {
            label: "Honorable Kills",
            value: (mockUser.characters[0]?.honorableKills ?? 0).toLocaleString(),
            pos: userHK?.position,
            icon: Swords,
            color: "bg-error/10 text-error",
          },
        ].map(({ label, value, pos, icon: Icon, color }) => (
          <div key={label} className="card-fantasy flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              {pos && (
                <span className="badge badge-outline badge-xs mt-1">#{pos} no ranking</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-fantasy flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            placeholder="Buscar jogador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-9 text-sm"
          />
        </div>
        <select
          value={faction}
          onChange={(e) => setFaction(e.target.value)}
          className="select select-bordered select-sm w-36"
        >
          <option value="all">Todas Facções</option>
          <option value="horda">Horda</option>
          <option value="alianca">Aliança</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-base-300 bg-base-200 p-1 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === key ? "bg-base-100 shadow-sm" : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{key.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-fantasy overflow-hidden p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold">
            {tabs.find((t) => t.key === tab)?.label}
          </h3>
          <span className="badge badge-outline text-xs">{activeData.length} jogadores</span>
        </div>
        <RankingTable
          players={activeData}
          type={activeType as "arena" | "hk"}
          highlightPlayer={userCharName}
        />
      </div>

      {/* Hall da Fama */}
      <div className="card-fantasy p-6">
        <h3 className="mb-1 flex items-center gap-2 font-bold">
          <Crown className="h-5 w-5 text-primary" />
          Hall da Fama
        </h3>
        <p className="mb-4 text-sm text-base-content/60">Os melhores jogadores de cada categoria</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Arena 2v2", icon: Users, data: mockArena2v2Ranking[0], color: "" },
            { label: "Arena 3v3", icon: Trophy, data: mockArena3v3Ranking[0], color: "border-primary/50 bg-primary/5" },
            { label: "Honorable Kills", icon: Swords, data: mockHKRanking[0], color: "" },
          ].map(({ label, icon: Icon, data, color }) => (
            <div key={label} className={`rounded-lg border border-base-300 p-4 text-center ${color}`}>
              <Icon className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm text-base-content/50">{label}</p>
              <p className="mt-1 text-lg font-bold">{data?.name}</p>
              <p className="text-2xl font-bold text-primary">
                {label === "Honorable Kills"
                  ? data?.rating.toLocaleString()
                  : data?.rating}
              </p>
              <span className="badge badge-ghost badge-sm mt-2">{data?.class}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RankingPage
