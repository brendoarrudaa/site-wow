import { useEffect, useState } from 'react'
import { Menu, Sun, Moon } from 'lucide-react'
import AppSidebar from '@/components/Dashboard/AppSidebar'
import ServerStatusBadge from '@/components/Dashboard/ServerStatusBadge'
import { LanguageSelector } from '@/components/LanguageSelector'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<'wow-dark' | 'wow-light'>('wow-dark')

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
