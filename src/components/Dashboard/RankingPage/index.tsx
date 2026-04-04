import { useEffect, useState } from "react"
import { Search, Trophy, Swords, Users, Crown, Loader2 } from "lucide-react"
import RankingTable, {
  ArenaPlayer,
  HKPlayer,
} from "@/components/Dashboard/RankingTable"

type Tab = "2v2" | "3v3" | "hk"

const RankingPage = () => {
  const [tab, setTab] = useState<Tab>("2v2")
  const [search, setSearch] = useState("")
  const [faction, setFaction] = useState("all")
  const [loading, setLoading] = useState(true)

  const [arena2v2, setArena2v2] = useState<ArenaPlayer[]>([])
  const [arena3v3, setArena3v3] = useState<ArenaPlayer[]>([])
  const [hk, setHk] = useState<HKPlayer[]>([])

  // Fetch player's character names to highlight
  const [myCharNames, setMyCharNames] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((data) => {
        if (data.arena2v2) setArena2v2(data.arena2v2)
        if (data.arena3v3) setArena3v3(data.arena3v3)
        if (data.hk) setHk(data.hk)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch("/api/account/characters")
      .then((r) => r.json())
      .then((data) => {
        if (data.characters) {
          setMyCharNames(data.characters.map((c: { name: string }) => c.name))
        }
      })
      .catch(() => {})
  }, [])

  const filterArena = (players: ArenaPlayer[]) =>
    players.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchFaction =
        faction === "all" ||
        (faction === "horda" && p.faction === "Horda") ||
        (faction === "alianca" && p.faction === "Aliança")
      return matchSearch && matchFaction
    })

  const filterHK = (players: HKPlayer[]) =>
    players.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchFaction =
        faction === "all" ||
        (faction === "horda" && p.faction === "Horda") ||
        (faction === "alianca" && p.faction === "Aliança")
      return matchSearch && matchFaction
    })

  const highlightName = myCharNames[0] ?? ""

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "2v2", label: "Arena 2v2", icon: Users },
    { key: "3v3", label: "Arena 3v3", icon: Trophy },
    { key: "hk", label: "Honorable Kills", icon: Swords },
  ]

  const filtered2v2 = filterArena(arena2v2)
  const filtered3v3 = filterArena(arena3v3)
  const filteredHK = filterHK(hk)

  const activeCount =
    tab === "2v2"
      ? filtered2v2.length
      : tab === "3v3"
      ? filtered3v3.length
      : filteredHK.length

  // Find user position in each ranking
  const myPos2v2 = arena2v2.find((p) => myCharNames.includes(p.name))
  const myPos3v3 = arena3v3.find((p) => myCharNames.includes(p.name))
  const myPosHK = hk.find((p) => myCharNames.includes(p.name))

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
            value: myPos2v2?.rating ?? "—",
            pos: myPos2v2?.position,
            icon: Users,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Arena 3v3",
            value: myPos3v3?.rating ?? "—",
            pos: myPos3v3?.position,
            icon: Trophy,
            color: "bg-secondary/10 text-secondary",
          },
          {
            label: "Honorable Kills",
            value: myPosHK?.kills?.toLocaleString() ?? "—",
            pos: myPosHK?.position,
            icon: Swords,
            color: "bg-error/10 text-error",
          },
        ].map(({ label, value, pos, icon: Icon, color }) => (
          <div key={label} className="card-fantasy flex items-center gap-4 p-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">{label}</p>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-base-content/20" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{value}</p>
                  {pos && (
                    <span className="badge badge-outline badge-xs mt-1">
                      #{pos} no ranking
                    </span>
                  )}
                </>
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
              tab === key
                ? "bg-base-100 shadow-sm"
                : "text-base-content/60 hover:text-base-content"
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
          <span className="badge badge-outline text-xs">
            {activeCount} jogadores
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-base-content/30">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : tab === "hk" ? (
          <RankingTable
            hkPlayers={filteredHK}
            type="hk"
            highlightPlayer={highlightName}
          />
        ) : (
          <RankingTable
            arenaPlayers={tab === "2v2" ? filtered2v2 : filtered3v3}
            type="arena"
            highlightPlayer={highlightName}
          />
        )}
      </div>

      {/* Hall da Fama */}
      {!loading && (arena2v2.length > 0 || arena3v3.length > 0 || hk.length > 0) && (
        <div className="card-fantasy p-6">
          <h3 className="mb-1 flex items-center gap-2 font-bold">
            <Crown className="h-5 w-5 text-primary" />
            Hall da Fama
          </h3>
          <p className="mb-4 text-sm text-base-content/60">
            Os melhores jogadores de cada categoria
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Arena 2v2",
                icon: Users,
                name: arena2v2[0]?.name,
                value: arena2v2[0]?.rating,
                cls: arena2v2[0]?.class,
                color: "",
              },
              {
                label: "Arena 3v3",
                icon: Trophy,
                name: arena3v3[0]?.name,
                value: arena3v3[0]?.rating,
                cls: arena3v3[0]?.class,
                color: "border-primary/50 bg-primary/5",
              },
              {
                label: "Honorable Kills",
                icon: Swords,
                name: hk[0]?.name,
                value: hk[0]?.kills?.toLocaleString(),
                cls: hk[0]?.class,
                color: "",
              },
            ].map(({ label, icon: Icon, name, value, cls, color }) =>
              name ? (
                <div
                  key={label}
                  className={`rounded-lg border border-base-300 p-4 text-center ${color}`}
                >
                  <Icon className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-2 text-sm text-base-content/50">{label}</p>
                  <p className="mt-1 text-lg font-bold">{name}</p>
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <span className="badge badge-ghost badge-sm mt-2">{cls}</span>
                </div>
              ) : (
                <div
                  key={label}
                  className="rounded-lg border border-dashed border-base-300 p-4 text-center text-base-content/30"
                >
                  <Icon className="mx-auto h-8 w-8 opacity-20" />
                  <p className="mt-2 text-sm">{label}</p>
                  <p className="mt-1 text-sm">Sem dados</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RankingPage
