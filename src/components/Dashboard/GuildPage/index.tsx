import { useEffect, useState } from "react"
import { Shield, Users, Crown, Clock, Star, Loader2, MessageSquare } from "lucide-react"

interface GuildMember {
  name: string
  class: string
  race: string
  level: number
  rank: string
  online: boolean
  isLeader: boolean
}

interface GuildData {
  name: string
  faction: "Horda" | "Aliança"
  motd: string
  memberCount: number
  myRank: string
  members: GuildMember[]
}

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

const GuildPage = () => {
  const [guild, setGuild] = useState<GuildData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/account/guild")
      .then((r) => r.json())
      .then((data) => {
        if (data.guild) setGuild(data.guild)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-serif glow-text">Minha Guild</h1>
          <p className="text-sm text-base-content/60">Informações sobre sua guilda</p>
        </div>
        <div className="flex items-center justify-center py-16 text-base-content/30">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando…
        </div>
      </div>
    )
  }

  if (!guild) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-serif glow-text">Minha Guild</h1>
          <p className="text-sm text-base-content/60">Informações sobre sua guilda</p>
        </div>
        <div className="card-fantasy flex flex-col items-center justify-center py-16 text-center">
          <Shield className="h-16 w-16 text-base-content/20" />
          <h3 className="mt-4 text-xl font-semibold">Sem Guild</h3>
          <p className="mt-2 max-w-sm text-base-content/60">
            Você não está em nenhuma guild atualmente. Entre no jogo e junte-se a
            uma para ver as informações aqui.
          </p>
        </div>
      </div>
    )
  }

  const onlineCount = guild.members.filter((m) => m.online).length
  const maxLevelCount = guild.members.filter((m) => m.level === 80).length
  const leaderCount = guild.members.filter((m) => m.isLeader).length
  const officerLike = guild.members.filter(
    (m) => m.isLeader || m.rank.toLowerCase().includes("ofic")
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">Minha Guild</h1>
        <p className="text-sm text-base-content/60">Informações sobre sua guilda</p>
      </div>

      {/* Guild banner */}
      <div className="card-fantasy overflow-hidden">
        <div className="bg-linear-to-r from-primary/20 to-secondary/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-base-100">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold font-serif">{guild.name}</h2>
                <span
                  className={`badge badge-outline text-xs ${
                    guild.faction === "Horda"
                      ? "border-red-500 text-red-500"
                      : "border-blue-500 text-blue-500"
                  }`}
                >
                  {guild.faction}
                </span>
              </div>
              <p className="mt-1 text-base-content/60">
                {guild.memberCount} membros
              </p>
              {guild.motd && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-base-100/60 px-3 py-2">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <p className="text-sm text-base-content/70 italic">
                    {guild.motd}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-base-100/80 px-4 py-2">
              <Users className="h-5 w-5 text-success" />
              <div>
                <p className="text-xs text-base-content/50">Online</p>
                <p className="text-xl font-bold text-success">{onlineCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Members table */}
        <div className="lg:col-span-2">
          <div className="card-fantasy overflow-hidden">
            <div className="flex items-center justify-between border-b border-base-300 p-4">
              <h3 className="flex items-center gap-2 font-bold">
                <Users className="h-5 w-5 text-primary" />
                Membros
              </h3>
              <span className="badge badge-outline text-xs">
                {guild.memberCount} membros
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full text-sm">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200 text-xs text-base-content/50">
                    <th className="px-4 py-3 text-left font-medium">Membro</th>
                    <th className="px-4 py-3 text-left font-medium">Rank</th>
                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                      Classe
                    </th>
                    <th className="hidden px-4 py-3 text-center font-medium md:table-cell">
                      Level
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guild.members.map((member, i) => {
                    const classColor =
                      CLASS_COLORS[member.class] ?? "text-base-content"
                    const accentBg = classColor.replace("text-", "bg-")

                    return (
                      <tr
                        key={i}
                        className="border-b border-base-300 transition-colors last:border-0 hover:bg-base-200/50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${accentBg}`}
                            >
                              {member.name.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p
                                className={`text-xs sm:hidden ${classColor}`}
                              >
                                {member.class}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {member.isLeader && (
                              <Crown className="h-4 w-4 text-primary" />
                            )}
                            <span
                              className={
                                member.isLeader
                                  ? "font-medium text-primary"
                                  : ""
                              }
                            >
                              {member.rank}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`hidden px-4 py-3 sm:table-cell ${classColor}`}
                        >
                          {member.class}
                        </td>
                        <td className="hidden px-4 py-3 text-center md:table-cell">
                          {member.level}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {member.online ? (
                            <span className="badge badge-success badge-sm gap-1">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-content" />
                              Online
                            </span>
                          ) : (
                            <span className="badge badge-outline badge-sm text-base-content/50">
                              Offline
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Guild stats */}
          <div className="card-fantasy p-4 space-y-3">
            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Estatísticas
            </h3>
            {[
              {
                label: "Membros Online",
                value: onlineCount,
                color: "text-success",
              },
              { label: "Membros Level 80", value: maxLevelCount, color: "" },
              { label: "Total de Membros", value: guild.memberCount, color: "" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-base-content/60">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Your rank */}
          <div className="card-fantasy border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-base-content/50">Seu Rank</p>
                <p className="text-lg font-bold text-primary">{guild.myRank}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuildPage
