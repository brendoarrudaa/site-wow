import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
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
} from "lucide-react"

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

interface SessionUser {
  username: string
  email: string
}

const AppSidebar = () => {
  const router = useRouter()
  const { pathname } = router
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [openTickets, setOpenTickets] = useState(0)

  useEffect(() => {
    fetch("/api/account/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})

    fetch("/api/account/tickets")
      .then((r) => r.json())
      .then((data) => {
        if (data.tickets) {
          const open = data.tickets.filter(
            (t: { status: string }) =>
              t.status === "open" || t.status === "in-progress"
          ).length
          setOpenTickets(open)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch("/api/account/logout", { method: "POST" })
    router.push("/cadastro")
  }

  const username = user?.username || ""
  const email = user?.email || ""

  return (
    <aside className="flex h-full w-64 flex-col border-r border-base-300 bg-base-200">
      {/* Logo */}
      <div className="border-b border-base-300 p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-content shadow-md">
            <Swords className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">Azeroth Legacy</span>
            <span className="text-xs text-base-content/50">WotLK 3.3.5a</span>
          </div>
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Nav groups */}
        <nav className="mt-4 px-2">
          <NavGroup
            label="Principal"
            items={mainNavItems}
            pathname={pathname}
            openTickets={0}
          />
          <NavGroup
            label="Jogo"
            items={gameNavItems}
            pathname={pathname}
            openTickets={0}
          />
          <NavGroup
            label="Suporte"
            items={supportNavItems}
            pathname={pathname}
            openTickets={openTickets}
          />
        </nav>
      </div>

      {/* User footer */}
      <div className="relative border-t border-base-300 p-2">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-base-300"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-content text-sm font-bold">
            {username ? username.slice(0, 2).toUpperCase() : "??"}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {username || "…"}
            </span>
            <span className="truncate text-xs text-base-content/50">
              {email || "—"}
            </span>
          </div>
          <ChevronUp
            className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
              userMenuOpen ? "" : "rotate-180"
            }`}
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
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-sm text-error transition-colors hover:bg-base-200"
            >
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
  items: {
    title: string
    href: string
    icon: React.ElementType
    badge?: string
  }[]
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
        const ticketBadge =
          item.title === "Tickets" && openTickets > 0 ? openTickets : null
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
