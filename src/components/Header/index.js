'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#about', label: 'Sobre' },
  { href: '/#diferenciais', label: 'Diferenciais' },
  { href: '/#services', label: 'Serviços' },
  { href: '/#contato', label: 'Contato' },
  { href: '/blog', label: 'Blog' }
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setTheme(window.__theme || 'light')
    window.__onThemeChange(t => setTheme(t))
  }, [])

  function toggleTheme() {
    window.__setPreferredTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#fcfcfc] dark:bg-[#072741] backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm'
          : 'bg-[#fcfcfc] dark:bg-[#072741] backdrop-blur-lg border-b border-gray-100/50 dark:border-gray-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={
              isDark
                ? '/assets/img/logo-dark.png'
                : '/assets/img/logo-light.png'
            }
            alt="Movisul"
            width={85}
            height={40}
            sizes="85px"
            priority
            className="block object-contain"
            style={{ width: '85px', height: '40px' }}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[#4a5568] dark:text-gray-300 hover:text-[#0f4c81] dark:hover:text-[#63b3ed] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded-full text-[#4a5568] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <Link
            href="/#contato"
            className="btn p-4 rounded-full bg-[#0f4c81] hover:bg-[#0d3f6b] text-white border-0 px-6 text-sm shadow-md"
          >
            Falar com especialista
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded-full text-[#4a5568] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="text-[#1a202c] dark:text-gray-200 p-1 transition-transform duration-300"
            aria-label="Menu"
          >
            <span
              className={`block transition-all duration-300 ${open ? 'rotate-90 opacity-80' : 'rotate-0 opacity-100'}`}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800`}
      >
        <div className="px-4 pb-4 space-y-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium text-[#4a5568] dark:text-gray-300 hover:text-[#0f4c81] dark:hover:text-[#63b3ed] py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contato"
            onClick={() => setOpen(false)}
            className="btn btn-sm rounded-full bg-[#0f4c81] text-white border-0 w-full mt-2 text-sm"
          >
            Falar com especialista
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
