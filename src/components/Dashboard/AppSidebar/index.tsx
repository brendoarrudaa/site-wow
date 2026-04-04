import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Wallet,
  Gavel,
  Store,
  CheckCircle,
  Truck,
  FileText
} from 'lucide-react'

type NotifKey = 'tickets' | 'approvals' | 'deliveries' | 'audit'

interface Notifs {
  tickets: number
  approvals: number
  deliveries: number
  audit: number
}

const NOTIF_COLOR: Record<NotifKey, string> = {
  tickets: 'bg-info text-info-content',
  approvals: 'bg-info text-info-content',
  deliveries: 'bg-info text-info-content',
  audit: 'bg-info text-info-content'
}

const mainNavItems = [
  { title: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'Carteira',
    href: '/dashboard/carteira',
    icon: Wallet,
    badge: 'Novo'
  },
  { title: 'Loja', href: '/dashboard/loja', icon: ShoppingBag },
  { title: 'Leilão GM', href: '/dashboard/leilao', icon: Gavel, badge: 'Novo' },
  {
    title: 'Marketplace',
    href: '/dashboard/mercado',
    icon: Store,
    badge: 'Novo'
  },
  { title: 'Serviços', href: '/dashboard/servicos', icon: Wrench }
]

const gameNavItems = [
  { title: 'Ranking PvP', href: '/dashboard/ranking', icon: Trophy },
  { title: 'Minha Guild', href: '/dashboard/guild', icon: Shield },
  { title: 'Armory', href: '/dashboard/armory', icon: Swords }
]

const adminNavItems: {
  title: string
  href: string
  icon: React.ElementType
  notifKey?: NotifKey
}[] = [
  { title: 'Painel GM', href: '/dashboard/admin-gm', icon: Shield },
  {
    title: 'Aprovações',
    href: '/dashboard/admin-aprovacoes',
    icon: CheckCircle,
    notifKey: 'approvals'
  },
  {
    title: 'Entregas',
    href: '/dashboard/admin-entregas',
    icon: Truck,
    notifKey: 'deliveries'
  },
  {
    title: 'Auditoria',
    href: '/dashboard/admin-auditoria',
    icon: FileText,
    notifKey: 'audit'
  }
]

const supportNavItems: {
  title: string
  href: string
  icon: React.ElementType
  notifKey?: NotifKey
}[] = [
  {
    title: 'Tickets',
    href: '/dashboard/tickets',
    icon: MessageSquare,
    notifKey: 'tickets'
  },
  { title: 'Configurações', href: '/dashboard/conta', icon: Settings }
]

interface SessionUser {
  username: string
  email: string
}

interface AppSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const AppSidebar = ({ collapsed, onToggleCollapse }: AppSidebarProps) => {
  const router = useRouter()
  const { pathname } = router
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notifs, setNotifs] = useState<Notifs>({
    tickets: 0,
    approvals: 0,
    deliveries: 0,
    audit: 0
  })

  useEffect(() => {
    fetch('/api/account/session')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user)
        if (data.isAdmin) setIsAdmin(true)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/sidebar-counts')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setNotifs({
            tickets: data.tickets ?? 0,
            approvals: data.approvals ?? 0,
            deliveries: data.deliveries ?? 0,
            audit: data.audit ?? 0
          })
        }
      })
      .catch(() => {})
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/account/logout', { method: 'POST' })
    router.push('/cadastro')
  }

  const username = user?.username || ''
  const email = user?.email || ''

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-base-300 bg-base-200 transition-all duration-200 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-base-300 px-3">
        <Link
          href="/dashboard"
          className={`flex min-w-0 items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-content shadow-md">
            <Swords className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold text-primary leading-tight">
                Azeroth Legacy
              </span>
              <span className="text-[10px] text-base-content/50">
                WotLK 3.3.5a
              </span>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto hidden shrink-0 rounded-md p-1 text-base-content/40 transition-colors hover:bg-base-300 hover:text-base-content lg:flex"
            title="Recolher menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-[54px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-base-300 bg-base-200 text-base-content/60 shadow-sm transition-colors hover:bg-primary hover:text-primary-content lg:flex"
          title="Expandir menu"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Scrollable nav */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <nav className="mt-3 px-2">
          {isAdmin && (
            <NavGroup
              label="Admin"
              items={adminNavItems}
              pathname={pathname}
              notifs={notifs}
              collapsed={collapsed}
            />
          )}
          <NavGroup
            label="Principal"
            items={mainNavItems}
            pathname={pathname}
            notifs={notifs}
            collapsed={collapsed}
          />
          <NavGroup
            label="Jogo"
            items={gameNavItems}
            pathname={pathname}
            notifs={notifs}
            collapsed={collapsed}
          />
          <NavGroup
            label="Suporte"
            items={supportNavItems}
            pathname={pathname}
            notifs={notifs}
            collapsed={collapsed}
          />
        </nav>
      </div>

      {/* User footer */}
      <div className="relative border-t border-base-300 p-2">
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-base-300 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? username || 'Usuário' : undefined}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-content text-xs font-bold">
            {username ? username.slice(0, 2).toUpperCase() : '??'}
          </div>
          {!collapsed && (
            <>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {username || '…'}
                </span>
                <span className="truncate text-xs text-base-content/50">
                  {email || '—'}
                </span>
              </div>
              <ChevronUp
                className={`ml-auto h-4 w-4 shrink-0 transition-transform ${
                  userMenuOpen ? '' : 'rotate-180'
                }`}
              />
            </>
          )}
        </button>

        {userMenuOpen && (
          <div
            className={`absolute bottom-full mb-1 rounded-lg border border-base-300 bg-base-100 shadow-lg ${
              collapsed ? 'left-14 w-48' : 'left-2 right-2'
            }`}
          >
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
    notifKey?: NotifKey
  }[]
  pathname: string
  notifs: Notifs
  collapsed: boolean
}

const NavGroup = ({
  label,
  items,
  pathname,
  notifs,
  collapsed
}: NavGroupProps) => (
  <div className="mb-4">
    {!collapsed && (
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-base-content/40">
        {label}
      </p>
    )}
    {collapsed && <div className="mb-1 mx-2 h-px bg-base-300/60" />}
    <ul className="flex flex-col gap-0.5">
      {items.map(item => {
        const isActive = pathname === item.href
        const count = item.notifKey ? notifs[item.notifKey] : 0
        const color = item.notifKey ? NOTIF_COLOR[item.notifKey] : ''

        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-primary text-primary-content'
                  : 'text-base-content hover:bg-base-300'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.title}</span>
              )}

              {/* Expanded: static badge (Admin/Novo) when no notif count */}
              {!collapsed && item.badge && count === 0 && (
                <span className="ml-auto rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {item.badge}
                </span>
              )}

              {/* Expanded: notif count badge */}
              {!collapsed && count > 0 && (
                <span
                  className={`ml-auto rounded-full w-4 h-4 text-center text-[10px] font-semibold ${color}`}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}

              {/* Collapsed: dot badge */}
              {collapsed && count > 0 && (
                <span
                  className={`absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${color}`}
                >
                  {count > 9 ? '9+' : count}
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
