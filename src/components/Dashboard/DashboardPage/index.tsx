import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"
import {
  Bell,
  LogOut,
  ShoppingBag,
  Swords,
  Trophy,
  MessageSquare,
  Loader2,
  X,
  AlertCircle,
  Clock,
} from "lucide-react"
import { mockShopItems } from "@/lib/mock-data"
import StatsCards from "@/components/Dashboard/StatsCards"
import ServerStatusBadge from "@/components/Dashboard/ServerStatusBadge"

export interface RealCharacter {
  guid: number
  name: string
  race: string
  class: string
  level: number
  gold: number
  silver: number
  copper: number
  online: boolean
}

interface RealTicket {
  id: number
  subject: string
  status: "open" | "in-progress" | "resolved" | "closed"
  category: string
  priority: "low" | "medium" | "high"
  created_at: string
  updated_at: string
  messageCount: number
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

const HORDE_RACES = new Set([
  "Orc",
  "Morto-Vivo",
  "Tauren",
  "Troll",
  "Elfo Sangrento",
  "Goblin",
])

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

const PRIORITY_COLORS: Record<string, string> = {
  high: "text-error",
  medium: "text-warning",
  low: "text-success",
}

const PRIORITY_LABELS: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug",
  account: "Conta",
  character: "Personagem",
  report: "Denúncia",
  suggestion: "Sugestão",
  other: "Outro",
}

interface DashboardPageProps {
  username: string
  email: string
}

const DashboardPage = ({ username, email }: DashboardPageProps) => {
  const router = useRouter()
  const [characters, setCharacters] = useState<RealCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<RealTicket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const featuredItems = mockShopItems.filter((item) => item.featured).slice(0, 3)
  const openTickets = tickets.filter(
    (t) => t.status === "open" || t.status === "in-progress"
  )

  useEffect(() => {
    fetch("/api/account/characters")
      .then((r) => r.json())
      .then((data) => {
        if (data.characters) setCharacters(data.characters)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch("/api/account/tickets")
      .then((r) => r.json())
      .then((data) => {
        if (data.tickets) setTickets(data.tickets)
      })
      .catch(() => {})
      .finally(() => setTicketsLoading(false))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [notifOpen])

  const handleLogout = async () => {
    await fetch("/api/account/logout", { method: "POST" })
    router.push("/cadastro")
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
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
            <p className="text-sm text-base-content/60">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ServerStatusBadge />

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
            </button>
            {openTickets.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-error-content pointer-events-none">
                {openTickets.length}
              </span>
            )}

            {/* Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-base-300 bg-base-100 shadow-2xl">
                <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
                  <span className="text-sm font-semibold">Notificações</span>
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => setNotifOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {ticketsLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-base-content/40 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando…
                    </div>
                  ) : openTickets.length === 0 ? (
                    <div className="py-8 text-center text-sm text-base-content/40">
                      <Bell className="mx-auto mb-2 h-8 w-8 opacity-20" />
                      Nenhuma notificação
                    </div>
                  ) : (
                    openTickets.map((ticket) => (
                      <Link
                        key={ticket.id}
                        href={`/dashboard/tickets?id=${ticket.id}`}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 border-b border-base-300/50 px-4 py-3 transition-colors hover:bg-base-200 last:border-b-0"
                      >
                        <div className="mt-0.5 shrink-0">
                          {ticket.status === "in-progress" ? (
                            <Clock className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-error" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{ticket.subject}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-base-content/50">
                            <span>{CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
                            <span>·</span>
                            <span className={PRIORITY_COLORS[ticket.priority]}>
                              {PRIORITY_LABELS[ticket.priority]}
                            </span>
                            <span>·</span>
                            <span>{formatDate(ticket.updated_at)}</span>
                          </div>
                        </div>
                        <span
                          className={`mt-0.5 shrink-0 badge badge-sm text-[10px] ${
                            ticket.status === "in-progress"
                              ? "badge-primary"
                              : "badge-outline"
                          }`}
                        >
                          {ticket.status === "in-progress" ? "Em andamento" : "Aberto"}
                        </span>
                      </Link>
                    ))
                  )}
                </div>

                {openTickets.length > 0 && (
                  <div className="border-t border-base-300 px-4 py-2">
                    <Link
                      href="/dashboard/tickets"
                      onClick={() => setNotifOpen(false)}
                      className="block text-center text-xs text-primary hover:underline"
                    >
                      Ver todos os tickets
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="btn btn-outline btn-sm gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards characters={characters} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Characters — 2 cols */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif">Seus Personagens</h2>
            {!loading && (
              <span className="badge badge-ghost text-xs">
                {characters.length} {characters.length === 1 ? "personagem" : "personagens"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-base-content/40">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando personagens…
            </div>
          ) : characters.length === 0 ? (
            <div className="card border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/40">
              <Swords className="mx-auto mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm">Nenhum personagem encontrado.</p>
              <p className="mt-1 text-xs">Entre no jogo e crie seu primeiro personagem!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {characters.map((character) => {
                const classColor = CLASS_COLORS[character.class] ?? "text-base-content"
                const accentBg = classColor.replace("text-", "bg-")
                const faction = HORDE_RACES.has(character.race) ? "Horda" : "Aliança"

                return (
                  <div
                    key={character.guid}
                    className="card relative overflow-hidden border border-base-300 bg-base-100 transition-all hover:border-primary/50"
                  >
                    {/* Class color accent bar */}
                    <div className={`absolute left-0 top-0 h-full w-1 ${accentBg}`} />

                    <div className="card-body p-4 pl-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{character.name}</h3>
                            {character.online && (
                              <span className="inline-flex h-2 w-2 rounded-full bg-success" title="Online" />
                            )}
                          </div>
                          <p className={`text-sm ${classColor}`}>
                            {character.class} — {character.race}
                          </p>
                        </div>

                        <span
                          className={`badge badge-outline text-xs ${
                            faction === "Horda"
                              ? "border-red-500 text-red-500"
                              : "border-blue-500 text-blue-500"
                          }`}
                        >
                          {faction}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {/* Level progress */}
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-base-content/60">Level</span>
                            <span className="font-medium">{character.level} / 80</span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-base-300">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(character.level / 80) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Gold */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-base-content/60">Gold</span>
                          <span className="ml-auto font-medium text-primary">
                            {character.gold.toLocaleString()}g{" "}
                            <span className="text-base-content/40 text-xs">
                              {character.silver}s {character.copper}c
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                {!ticketsLoading && openTickets.length > 0 && (
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
          {!ticketsLoading && openTickets.length > 0 && (
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
                      #{ticket.id} — {formatDate(ticket.updated_at)}
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
