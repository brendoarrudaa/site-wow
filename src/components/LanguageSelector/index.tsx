import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from '@/lib/i18n'
import { useTranslation, setLocale } from '@/hooks/useTranslation'

interface LanguageSelectorProps {
  className?: string
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { locale } = useTranslation()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  if (!mounted) {
    return <span className={`inline-block w-8 h-8 ${className ?? ''}`} />
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 text-sm"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">
          {locale.toUpperCase().replace('-', '')}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border/80 bg-card/95 p-1.5 shadow-xl z-50">
          {SUPPORTED_LOCALES.map((loc: Locale) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center gap-2 ${
                loc === locale
                  ? 'text-primary font-medium bg-primary/8'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span className="text-base">{LOCALE_FLAGS[loc]}</span>
              {LOCALE_LABELS[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const LOCALE_FLAGS: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸'
}
