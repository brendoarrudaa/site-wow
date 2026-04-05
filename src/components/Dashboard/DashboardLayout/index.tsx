import { useEffect, useState } from 'react'
import { Menu, Sun, Moon, ShieldAlert, ShieldOff } from 'lucide-react'
import AppSidebar from '@/components/Dashboard/AppSidebar'
import ServerStatusBadge from '@/components/Dashboard/ServerStatusBadge'
import { LanguageSelector } from '@/components/LanguageSelector'
import { GmModeProvider, useGmMode } from '@/lib/GmModeContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <GmModeProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </GmModeProvider>
  )
}

const DashboardLayoutInner = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<'wow-dark' | 'wow-light'>('wow-dark')
  const [isAdmin, setIsAdmin] = useState(false)
  const { gmMode, setGmMode } = useGmMode()

  // Restore persisted preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('wow-theme') as
      | 'wow-dark'
      | 'wow-light'
      | null
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedTheme) setTheme(savedTheme)
    if (savedCollapsed === 'true') setCollapsed(true)
  }, [])

  // Check if user is GM
  useEffect(() => {
    fetch('/api/account/session')
      .then(r => r.json())
      .then(data => { if (data.isAdmin) setIsAdmin(true) })
      .catch(() => {})
  }, [])

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('wow-theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme(t => (t === 'wow-dark' ? 'wow-light' : 'wow-dark'))

  const toggleCollapse = () =>
    setCollapsed(v => {
      localStorage.setItem('sidebar-collapsed', String(!v))
      return !v
    })

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AppSidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-base-300 bg-base-100/95 px-4 backdrop-blur">
          {/* Mobile menu */}
          <button
            className="btn btn-ghost btn-sm btn-square lg:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center justify-end gap-2">
            {/* GM Mode Toggle */}
            {isAdmin && (
              <label
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  gmMode
                    ? 'border-warning/40 bg-warning/10 text-warning'
                    : 'border-base-300 bg-base-200 text-base-content/50'
                }`}
                title={gmMode ? 'Modo GM ativo — clique para ver como usuário' : 'Modo usuário ativo — clique para voltar ao modo GM'}
              >
                {gmMode ? (
                  <ShieldAlert className="h-3.5 w-3.5" />
                ) : (
                  <ShieldOff className="h-3.5 w-3.5" />
                )}
                <span>{gmMode ? 'GM' : 'Usuário'}</span>
                <input
                  type="checkbox"
                  className="toggle toggle-xs toggle-warning"
                  checked={gmMode}
                  onChange={e => setGmMode(e.target.checked)}
                />
              </label>
            )}

            <ServerStatusBadge />

            <div className="h-5 w-px bg-base-300" />

            {/* Language toggle */}
            <LanguageSelector />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm btn-square"
              title={theme === 'wow-dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'wow-dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
