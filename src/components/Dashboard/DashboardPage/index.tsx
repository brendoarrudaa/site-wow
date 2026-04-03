import Link from "next/link"
import { useRouter } from "next/router"
import { Bell, LogOut, ShoppingBag, Swords, Trophy, MessageSquare } from "lucide-react"
import { mockUser, mockTickets, mockShopItems } from "@/lib/mock-data"
import StatsCards from "@/components/Dashboard/StatsCards"
import CharacterCard from "@/components/Dashboard/CharacterCard"

const rarityLabel: Record<string, string> = {
  legendary: "Lendário",
  epic: "Épico",
  rare: "Raro",
  uncommon: "Incomum",
  common: "Comum",
}

const rarityClass: Record<string, string> = {
  legendary: "badge-warning",
  epic: "text-purple-400 border-purple-400",
  rare: "text-blue-400 border-blue-400",
  uncommon: "text-green-400 border-green-400",
  common: "text-base-content/50 border-base-content/30",
}

interface DashboardPageProps {
  username: string
  email: string
}

const DashboardPage = ({ username, email }: DashboardPageProps) => {
  const router = useRouter()
  const featuredItems = mockShopItems.filter((item) => item.featured).slice(0, 3)
  const openTickets = mockTickets.filter(
    (t) => t.status === "open" || t.status === "in-progress"
  )

  const handleLogout = async () => {
    await fetch("/api/account/logout", { method: "POST" })
    router.push("/cadastro")
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-content text-xl font-bold shadow-lg">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif glow-text">
              Bem-vindo, <span className="text-primary">{username}</span>
            </h1>
            <p className="text-sm text-base-content/60">
              Gerencie seus personagens e aproveite o servidor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="btn btn-ghost btn-sm btn-square">
              <Bell className="h-4 w-4" />
            </button>
            {openTickets.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-error-content">
                {openTickets.length}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards user={mockUser} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Characters — 2 cols */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif">Seus Personagens</h2>
            <span className="badge badge-ghost text-xs">
              {mockUser.characters.length} personagens
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mockUser.characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        </div>

        {/* Sidebar panel — 1 col */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card-fantasy p-4">
            <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Ações Rápidas
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/loja"
                className="btn btn-outline btn-sm justify-start gap-2"
              >
                <ShoppingBag className="h-4 w-4 text-primary" />
                Visitar Loja
              </Link>
              <Link
                href="/dashboard/servicos"
                className="btn btn-outline btn-sm justify-start gap-2"
              >
                <Swords className="h-4 w-4 text-secondary" />
                Serviços de Personagem
              </Link>
              <Link
                href="/dashboard/ranking"
                className="btn btn-outline btn-sm justify-start gap-2"
              >
                <Trophy className="h-4 w-4 text-primary" />
                Ver Rankings
              </Link>
              <Link
                href="/dashboard/tickets"
                className="btn btn-outline btn-sm justify-start gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Abrir Ticket
                {openTickets.length > 0 && (
                  <span className="badge badge-error badge-sm ml-auto">
                    {openTickets.length}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Featured shop items */}
          <div className="card-fantasy p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                Destaques da Loja
              </h3>
              <Link
                href="/dashboard/loja"
                className="text-xs text-primary hover:underline"
              >
                Ver tudo
              </Link>
            </div>
            <div className="space-y-3">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 p-2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-300">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-base-content/50">
                      {item.price.toLocaleString()} {item.currency}
                    </p>
                  </div>
                  <span
                    className={`badge badge-outline badge-sm shrink-0 text-[10px] ${rarityClass[item.rarity]}`}
                  >
                    {rarityLabel[item.rarity]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Open tickets */}
          {openTickets.length > 0 && (
            <div className="card-fantasy border-error/30 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                <MessageSquare className="h-4 w-4 text-error" />
                Tickets Abertos
              </h3>
              <div className="space-y-2">
                {openTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/dashboard/tickets?id=${ticket.id}`}
                    className="block rounded-lg border border-base-300 p-2 transition-colors hover:bg-base-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{ticket.subject}</p>
                      <span
                        className={`badge badge-sm shrink-0 text-[10px] ${
                          ticket.status === "in-progress" ? "badge-primary" : "badge-outline"
                        }`}
                      >
                        {ticket.status === "in-progress" ? "Em Progresso" : "Aberto"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-base-content/50">
                      #{ticket.id} — {ticket.updatedAt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
