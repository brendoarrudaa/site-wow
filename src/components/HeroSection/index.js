import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/assets/img/hero-bg.jpg"
        alt="Equipe MoviSul em campo"
        fill
        priority
        className="object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-[#0a2e4f]/90 via-[#0f4c81]/80 to-[#0a2e4f]/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-32 sm:py-32">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#2a9d6e]/20 border border-[#2a9d6e]/30 px-4 py-1.5 text-sm font-medium text-[#34c785]">
              <CheckCircle className="w-4 h-4" />
              Mais de 120 projetos executados em empresas nacionais
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white mb-6">
            Gestão Inteligente em{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#34c785] to-[#2a9d6e]">
              Saúde e Segurança
            </span>{' '}
            do Trabalho
          </h1>

          <p className="text-lg md:text-xl text-white/75 max-w-2xl mb-10 leading-relaxed">
            Soluções completas para empresas que valorizam segurança,
            performance e conformidade. Atuação em todo o Brasil com mais de 16
            anos de experiência.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/#contato"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2a9d6e] hover:bg-[#238a5e] text-white font-semibold px-8 py-4 text-base shadow-lg shadow-[#2a9d6e]/30 transition-colors duration-200"
            >
              Receber diagnóstico gratuito em 24h
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-4 text-base transition-colors duration-200"
            >
              Conheça nossos serviços
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <a
          href="/#about"
          className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        >
          <span className="text-xs tracking-wider">SCROLL</span>
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  )
}

export default HeroSection
