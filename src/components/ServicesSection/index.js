import { useEffect, useRef } from 'react'
import { ShieldCheck, FileText, Monitor, HardHat, GraduationCap, Flame } from 'lucide-react'

const services = [
  {
    Icon: ShieldCheck,
    title: 'Gestão de Riscos',
    subtitle: 'PGR, GRO, PCMSO',
    description:
      'PGR, GRO, PCMSO e programas completos de gerenciamento de riscos ocupacionais.',
    color: '#0f4c81'
  },
  {
    Icon: FileText,
    title: 'Laudos Técnicos',
    subtitle: 'Análises e Perícias',
    description:
      'LTCAT, Laudos de Insalubridade, Periculosidade, Análise Ergonômica e muito mais.',
    color: '#2a9d6e'
  },
  {
    Icon: Monitor,
    title: 'Gestão de eSocial (SST)',
    subtitle: 'SST Compliant',
    description:
      'Envio dos eventos S-2210, S-2220 e S-2240 com gestão integrada e especializada.',
    color: '#0f4c81'
  },
  {
    Icon: HardHat,
    title: 'Consultoria em Segurança',
    subtitle: 'Segurança do Trabalho',
    description:
      'Assessoria técnica completa para conformidade com normas regulamentadoras.',
    color: '#2a9d6e'
  },
  {
    Icon: GraduationCap,
    title: 'Treinamentos e Capacitação',
    subtitle: 'Capacitação Profissional',
    description:
      'Mais de 60 cursos e treinamentos regulamentares, do NR-01 ao NR-35.',
    color: '#0f4c81'
  },
  {
    Icon: Flame,
    title: 'Projetos de Prevenção',
    subtitle: 'Prevenção e Proteção',
    description:
      'PSCIP, SPDA, brigadas de incêndio e projetos de segurança contra incêndio.',
    color: '#2a9d6e'
  }
]

const ServicesSection = () => {
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
    <section id="services" ref={sectionRef} className="py-14 sm:py-20 lg:py-28 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f4c81]/5 dark:bg-[#63b3ed]/10 text-sm font-semibold text-[#0f4c81] dark:text-[#63b3ed] uppercase tracking-widest mb-4">
            Serviços
          </span>
          <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-gray-100">
            Soluções completas em <span className="text-[#0f4c81] dark:text-[#63b3ed]">SST</span>
          </h2>
          <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out mt-4 text-lg text-[#4a5568] dark:text-gray-400">
            Cobrimos todas as necessidades da sua empresa em Saúde e Segurança do Trabalho
            com profissionais credenciados.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ Icon, title, subtitle, description, color }, index) => (
            <div
              key={index}
              className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out"
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-transparent hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${color}05, ${color}10)`
                  }}
                />
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a202c] dark:text-gray-100 mb-1">{title}</h3>
                  <span className="text-sm font-medium text-[#2a9d6e] mb-3 block">{subtitle}</span>
                  <p className="text-[#718096] dark:text-gray-400 leading-relaxed text-sm">{description}</p>
                </div>
              </div>
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

export default ServicesSection
