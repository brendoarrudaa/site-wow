import { Swords, Trophy, Coins, Loader2 } from "lucide-react"
import { RealCharacter } from "@/components/Dashboard/DashboardPage"

interface StatsCardsProps {
  characters: RealCharacter[]
  loading: boolean
}

const StatsCards = ({ characters, loading }: StatsCardsProps) => {
  const totalGold = characters.reduce((sum, c) => sum + c.gold, 0)
  const highestLevel = characters.length > 0 ? Math.max(...characters.map((c) => c.level)) : 0
  const onlineCount = characters.filter((c) => c.online).length

  const stats = [
    {
      label: "Personagens",
      value: characters.length.toString(),
      icon: Swords,
      colorIcon: "text-primary",
      colorBg: "bg-primary/10",
    },
    {
      label: "Maior Level",
      value: highestLevel > 0 ? highestLevel.toString() : "—",
      icon: Trophy,
      colorIcon: "text-primary",
      colorBg: "bg-primary/10",
    },
    {
      label: "Gold Total",
      value: totalGold.toLocaleString() + "g",
      icon: Coins,
      colorIcon: "text-primary",
      colorBg: "bg-primary/10",
    },
    {
      label: "Online Agora",
      value: onlineCount.toString(),
      icon: Swords,
      colorIcon: "text-success",
      colorBg: "bg-success/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card border border-base-300 bg-base-100">
          <div className="card-body flex-row items-center gap-4 p-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.colorBg}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.colorIcon}`} />
            </div>
            <div>
              <p className="text-sm text-base-content/60">{stat.label}</p>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-base-content/30" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
