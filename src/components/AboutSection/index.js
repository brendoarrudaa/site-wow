import { useEffect, useRef } from 'react'
import { Shield, Eye, Users, TrendingUp } from 'lucide-react'

const pillars = [
  {
    Icon: Shield,
    title: 'Proteção à vida',
    desc: 'Zero acidentes com afastamentos em nossos projetos'
  },
  {
    Icon: Eye,
    title: 'Visão prática',
    desc: 'Atuação no campo, não apenas em relatórios'
  },
  {
    Icon: Users,
    title: 'Equipe multidisciplinar',
    desc: 'Engenheiros, médicos, técnicos e fisioterapeutas'
  },
  {
    Icon: TrendingUp,
    title: 'Melhoria contínua',
    desc: 'Filosofia Kaizen aplicada à segurança'
  }
]

const AboutSection = () => {
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
    <section id="about" ref={sectionRef} className="py-14 sm:py-20 lg:py-28 bg-[#f7fafc] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f4c81]/5 dark:bg-[#63b3ed]/10 text-sm font-semibold text-[#0f4c81] dark:text-[#63b3ed] uppercase tracking-widest mb-4">
              Sobre a MoviSul
            </span>
            <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-gray-100 mb-6">
              Uma história de{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0f4c81] to-[#2a9d6e]">
                crescimento
              </span>{' '}
              e excelência
            </h2>
            <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out text-[#4a5568] dark:text-gray-400 leading-relaxed mb-6">
              A MoviSul é especialista em Gestão de Saúde e Segurança do Trabalho,
              atuando em diversos estados do Brasil com soluções práticas, tecnológicas e
              eficientes. Nosso diferencial está na atuação direta no campo, identificando
              riscos reais e promovendo melhorias contínuas nos processos.
            </p>
            <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-300 ease-out text-[#4a5568] dark:text-gray-400 leading-relaxed">
              Com base em um trabalho de alto nível e uma orientação voltada à melhoria
              contínua, a MoviSul cresceu significativamente, atendendo grandes players
              como Vale Florestar, Suzano, Hydro Mineração, Bracell e ADM do Brasil.
            </p>
          </div>

          {/* Pillars grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map(({ Icon, title, desc }, i) => (
              <div
                key={i}
                className="fade-up opacity-0 translate-y-6 transition-[opacity,transform,box-shadow,border-color] duration-700 ease-out group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#0f4c81]/20 flex flex-col gap-3"
                style={{ transitionDelay: `${(i + 3) * 100}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[#0f4c81]/8 dark:bg-[#63b3ed]/10 flex items-center justify-center text-[#0f4c81] dark:text-[#63b3ed] group-hover:bg-[#0f4c81] group-hover:text-white transition-all duration-300">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#1a202c] dark:text-gray-100">{title}</h3>
                <p className="text-sm text-[#718096] dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
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

export default AboutSection
