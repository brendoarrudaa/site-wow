import Link from 'next/link'
import { siteConfig } from '@/data/site-config'
import { Shield, Users, Swords } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src="/assets/img/hero-bg.jpg"
          alt="Azeroth Legacy"
          className="w-full h-full object-cover scale-105"
          width={1920}
          height={1080}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="relative page-container py-24 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-glow" />
            <span className="text-xs font-medium text-gold tracking-widest uppercase">
              {siteConfig.expansion}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] glow-text">
            A era mais épica do WoW,{' '}
            <span className="text-gradient-gold">feita do jeito certo</span>
          </h1>

          <p className="mt-6 text-lg lg:text-xl text-secondary-foreground/90 leading-relaxed max-w-xl">
            Servidor brasileiro de WotLK 3.3.5a com scripts Blizzlike, rates
            equilibradas e uma comunidade que leva o jogo a sério. Sem atalhos.
            Sem pay-to-win.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/como-jogar"
              className="btn btn-lg bg-gold text-black hover:bg-gold/90 border-0 text-base px-8 h-12"
            >
              Começar a Jogar
            </Link>
            <Link
              href="/download"
              className="btn btn-lg btn-outline border-gold text-gold hover:bg-gold hover:text-black hover:border-gold text-base px-8 h-12"
            >
              Baixar Cliente
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/70" />
              <span className="text-black">Anti-Cheat Ativo</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary/70" />
              <span className="text-black">Comunidade BR</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="hidden sm:flex items-center gap-2">
              <Swords className="h-4 w-4 text-primary/70" />
              <span className="text-black">PvE & PvP Blizzlike</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
