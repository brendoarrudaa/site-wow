import { useEffect, useRef } from 'react'
import { Search, FileCheck, Wrench, HeadphonesIcon } from 'lucide-react'

const steps = [
  {
    Icon: Search,
    step: '01',
    title: 'Diagnóstico personalizado',
    desc: 'Entendemos seu cenário e necessidades específicas com uma análise completa.'
  },
  {
    Icon: FileCheck,
    step: '02',
    title: 'Proposta sob medida',
    desc: 'Você recebe um plano técnico e financeiro completo, ajustado à sua realidade.'
  },
  {
    Icon: Wrench,
    step: '03',
    title: 'Execução técnica',
    desc: 'Entregamos o serviço com equipe credenciada e equipamentos certificados.'
  },
  {
    Icon: HeadphonesIcon,
    step: '04',
    title: 'Acompanhamento contínuo',
    desc: 'Relatórios, manutenção e apoio contínuo para resultados duradouros.'
  }
]

const HowItWorksSection = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('animate-in')
        })
      },
      { threshold: 0.1 }
    )
    const elements = sectionRef.current?.querySelectorAll('.fade-up')
    elements?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-14 sm:py-20 lg:py-28 bg-linear-to-br from-[#0a2e4f] via-[#0f4c81] to-[#1a3a5c] relative overflow-hidden"
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold text-[#34c785] uppercase tracking-widest mb-4">
            Como funciona
          </span>
          <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-3xl sm:text-4xl font-bold text-white mb-4">
            Do diagnóstico ao{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#34c785] to-[#2a9d6e]">
              resultado
            </span>
          </h2>
          <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out text-lg text-white/60 max-w-xl mx-auto">
            Um processo simples e eficiente para garantir a segurança da sua empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map(({ Icon, step, title, desc }, i) => (
            <div
              key={i}
              className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out relative text-center group"
              style={{ transitionDelay: `${(i + 3) * 150}ms` }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-white/15" />
              )}
              <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5 text-[#34c785] group-hover:bg-[#2a9d6e] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-bold text-[#34c785] uppercase tracking-widest mb-2 block">
                Passo {step}
              </span>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  )
}

export default HowItWorksSection
