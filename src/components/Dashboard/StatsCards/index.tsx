import { Swords, Trophy, Coins, Clock } from "lucide-react"
import { User } from "@/lib/mock-data"

interface StatsCardsProps {
  user: User
}

const StatsCards = ({ user }: StatsCardsProps) => {
  const totalGold = user.characters.reduce((sum, char) => sum + char.gold, 0)
  const highestLevel = Math.max(...user.characters.map((char) => char.level))

  const totalMinutes = user.characters.reduce((sum, char) => {
    const match = char.playedTime.match(/(\d+)d\s*(\d+)h\s*(\d+)m/)
    if (!match) return sum
    return (
      sum +
      parseInt(match[1]) * 24 * 60 +
      parseInt(match[2]) * 60 +
      parseInt(match[3])
    )
  }, 0)

  const totalDays = Math.floor(totalMinutes / (24 * 60))
  const totalHours = Math.floor((totalMinutes % (24 * 60)) / 60)

  const stats = [
    {
      label: "Personagens",
      value: user.characters.length.toString(),
      icon: Swords,
      colorIcon: "text-primary",
      colorBg: "bg-primary/10",
    },
    {
      label: "Maior Level",
      value: highestLevel.toString(),
      icon: Trophy,
      colorIcon: "text-primary",
      colorBg: "bg-primary/10",
    },
    {
      label: "Gold Total",
      value: totalGold.toLocaleString(),
      icon: Coins,
      colorIcon: "text-primary",
      colorBg: "bg-primary/10",
    },
    {
      label: "Tempo Jogado",
      value: `${totalDays}d ${totalHours}h`,
      icon: Clock,
      colorIcon: "text-secondary",
      colorBg: "bg-secondary/10",
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
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
