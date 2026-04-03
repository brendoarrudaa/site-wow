import Link from "next/link"
import { useRouter } from "next/router"
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  Trophy,
  Shield,
  MessageSquare,
  Settings,
  User,
  LogOut,
  Swords,
  ChevronUp,
  Coins,
  Sparkles,
  MoreVertical,
} from "lucide-react"
import { mockUser, mockTickets } from "@/lib/mock-data"
import { useState } from "react"

const mainNavItems = [
  { title: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { title: "Loja", href: "/dashboard/loja", icon: ShoppingBag, badge: "Novo" },
  { title: "Serviços", href: "/dashboard/servicos", icon: Wrench },
]

const gameNavItems = [
  { title: "Ranking PvP", href: "/dashboard/ranking", icon: Trophy },
  { title: "Minha Guild", href: "/dashboard/guild", icon: Shield },
  { title: "Armory", href: "/dashboard/armory", icon: Swords },
]

const supportNavItems = [
  { title: "Tickets", href: "/dashboard/tickets", icon: MessageSquare },
  { title: "Configurações", href: "/dashboard/conta", icon: Settings },
]

const AppSidebar = () => {
  const { pathname } = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const openTickets = mockTickets.filter(
    (t) => t.status === "open" || t.status === "in-progress"
  ).length

  return (
    <aside className="flex h-full w-64 flex-col border-r border-base-300 bg-base-200">
      {/* Logo */}
      <div className="border-b border-base-300 p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-content shadow-md">
            <Swords className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">Frostmourne</span>
            <span className="text-xs text-base-content/50">WotLK 3.3.5a</span>
          </div>
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Points display */}
        <div className="mx-3 mt-4 rounded-lg border border-base-300 bg-base-100 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-sm text-base-content/60">Pontos de Doação</span>
            </div>
            <span className="font-bold text-primary">
              {mockUser.donationPoints.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-sm text-base-content/60">Pontos de Voto</span>
            </div>
            <span className="font-bold text-secondary">{mockUser.votePoints}</span>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="mt-4 px-2">
          <NavGroup label="Principal" items={mainNavItems} pathname={pathname} openTickets={0} />
          <NavGroup label="Jogo" items={gameNavItems} pathname={pathname} openTickets={0} />
          <NavGroup label="Suporte" items={supportNavItems} pathname={pathname} openTickets={openTickets} />
        </nav>
      </div>

      {/* User footer */}
      <div className="relative border-t border-base-300 p-2">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-base-300"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-content text-sm font-bold">
            {mockUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{mockUser.username}</span>
            <span className="truncate text-xs text-base-content/50">{mockUser.email}</span>
          </div>
          <ChevronUp
            className={`ml-auto h-4 w-4 shrink-0 transition-transform ${userMenuOpen ? "" : "rotate-180"}`}
          />
        </button>

        {userMenuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-1 rounded-lg border border-base-300 bg-base-100 shadow-lg">
            <Link
              href="/dashboard/conta"
              className="flex items-center gap-2 rounded-t-lg px-3 py-2 text-sm transition-colors hover:bg-base-200"
              onClick={() => setUserMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              Minha Conta
            </Link>
            <Link
              href="/dashboard/conta"
              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-base-200"
              onClick={() => setUserMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
            <div className="my-1 h-px bg-base-300" />
            <button className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm text-error transition-colors hover:bg-base-200">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

interface NavGroupProps {
  label: string
  items: { title: string; href: string; icon: React.ElementType; badge?: string }[]
  pathname: string
  openTickets: number
}

const NavGroup = ({ label, items, pathname, openTickets }: NavGroupProps) => (
  <div className="mb-4">
    <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-base-content/40">
      {label}
    </p>
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = pathname === item.href
        const ticketBadge = item.title === "Tickets" && openTickets > 0 ? openTickets : null
        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-content"
                  : "text-base-content hover:bg-base-300"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-content">
                  {item.badge}
                </span>
              )}
              {ticketBadge && (
                <span className="ml-auto rounded-full bg-error px-1.5 py-0.5 text-[10px] font-semibold text-error-content">
                  {ticketBadge}
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  </div>
)

export default AppSidebar
