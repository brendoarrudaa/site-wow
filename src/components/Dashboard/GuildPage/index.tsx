import { Shield, Users, Trophy, Skull, Crown, Clock, Star } from "lucide-react"
import { mockGuild, mockUser, classColors } from "@/lib/mock-data"

const GuildPage = () => {
  const userGuild = mockUser.characters.find((c) => c.guild)?.guild

  if (!userGuild) {
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
            Você não está em nenhuma guild atualmente.
            Entre no jogo e junte-se a uma para ver as informações aqui.
          </p>
        </div>
      </div>
    )
  }

  const guild = mockGuild
  const onlineCount = guild.members.filter((m) => m.lastOnline === "Online").length
  const maxLevelCount = guild.members.filter((m) => m.level === 80).length
  const officialCount = guild.members.filter(
    (m) => m.rank === "Oficial" || m.rank === "Líder"
  ).length
  const userRank = mockUser.characters.find((c) => c.guild)?.guildRank ?? "Membro"

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
                <span className={`badge badge-outline text-xs ${
                  guild.faction === "Horda"
                    ? "border-red-500 text-red-500"
                    : "border-blue-500 text-blue-500"
                }`}>
                  {guild.faction}
                </span>
              </div>
              <p className="mt-1 text-base-content/60">
                Level {guild.level} — {guild.members.length} membros
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-base-100/80 px-4 py-2">
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-base-content/50">Conquistas</p>
                <p className="text-xl font-bold text-primary">{guild.achievements}</p>
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
              <span className="badge badge-outline text-xs">{guild.members.length} membros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full text-sm">
                <thead>
                  <tr className="border-b border-base-300 bg-base-200 text-xs text-base-content/50">
                    <th className="px-4 py-3 text-left font-medium">Membro</th>
                    <th className="px-4 py-3 text-left font-medium">Rank</th>
                    <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">Classe</th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guild.members.map((member, i) => (
                    <tr
                      key={i}
                      className="border-b border-base-300 transition-colors last:border-0 hover:bg-base-200/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${classColors[member.class].replace("text-", "bg-")}`}>
                            {member.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className={`text-xs sm:hidden ${classColors[member.class]}`}>
                              {member.class}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {member.rank === "Líder" && <Crown className="h-4 w-4 text-primary" />}
                          {member.rank === "Oficial" && <Star className="h-4 w-4 text-secondary" />}
                          <span className={member.rank === "Líder" ? "font-medium text-primary" : ""}>
                            {member.rank}
                          </span>
                        </div>
                      </td>
                      <td className={`hidden px-4 py-3 sm:table-cell ${classColors[member.class]}`}>
                        {member.class}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {member.lastOnline === "Online" ? (
                          <span className="badge badge-success badge-sm gap-1">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success-content" />
                            Online
                          </span>
                        ) : (
                          <span className="badge badge-outline badge-sm gap-1 text-base-content/50">
                            <Clock className="h-3 w-3" />
                            {member.lastOnline}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Boss kills */}
          <div className="card-fantasy p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <Skull className="h-5 w-5 text-error" />
              Boss Kills
            </h3>
            <p className="mb-4 text-xs text-base-content/50">Progresso em raids</p>
            <div className="space-y-4">
              {guild.bossKills.map((boss, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{boss.name}</span>
                    <span className="text-primary font-bold">{boss.kills}x</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-base-300">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(boss.kills * 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guild stats */}
          <div className="card-fantasy p-4 space-y-3">
            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Estatísticas
            </h3>
            {[
              { label: "Membros Online", value: onlineCount, color: "text-success" },
              { label: "Membros Level 80", value: maxLevelCount, color: "" },
              { label: "Oficiais", value: officialCount, color: "" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
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
                <p className="text-lg font-bold text-primary">{userRank}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuildPage
