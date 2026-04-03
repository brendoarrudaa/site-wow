import { useEffect, useRef } from 'react'
import { Award, Clock, Globe, Users, Target } from 'lucide-react'

const stats = [
  { Icon: Award, number: '+120', label: 'Projetos executados' },
  { Icon: Clock, number: '+16', label: 'Anos de experiência' },
  { Icon: Globe, number: '20+', label: 'Estados atendidos' },
  { Icon: Users, number: '6+', label: 'Especialistas na equipe' },
  { Icon: Target, number: '0', label: 'Acidentes com afastamento' }
]

const DifferentialsSection = () => {
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
      id="diferenciais"
      ref={sectionRef}
      className="py-14 sm:py-20 lg:py-28 bg-linear-to-br from-[#0a2e4f] via-[#0f4c81] to-[#1a3a5c] relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-semibold text-[#34c785] uppercase tracking-widest mb-4">
          Nossos números
        </span>
        <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-16">
          Resultados que comprovam nossa excelência
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {stats.map(({ Icon, number, label }, i) => (
            <div
              key={i}
              className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out flex flex-col items-center gap-3"
              style={{ transitionDelay: `${(i + 2) * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/10 border border-white/20">
                <Icon className="w-6 h-6 text-[#34c785]" strokeWidth={1.5} />
              </div>
              <span className="text-4xl md:text-5xl font-extrabold text-white">{number}</span>
              <span className="text-sm text-white/60">{label}</span>
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

export default DifferentialsSection
