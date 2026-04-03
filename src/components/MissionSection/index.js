import { useEffect, useRef } from 'react'
import { Target } from 'lucide-react'

const MissionSection = () => {
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
    <section ref={sectionRef} className="py-14 sm:py-20 lg:py-28 bg-[#f7fafc] dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-[#0f4c81] to-[#2a9d6e] flex items-center justify-center mb-6">
            <Target className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
        </div>

        <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d6e]/10 text-sm font-semibold text-[#2a9d6e] uppercase tracking-widest mb-4">
          Nossa Missão
        </span>

        <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-gray-100 mb-8">
          Gerar resultados{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0f4c81] to-[#2a9d6e]">
            concretos
          </span>
        </h2>

        <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-300 ease-out text-xl text-[#4a5568] dark:text-gray-400 leading-relaxed">
          &ldquo;Gerar resultados concretos através da análise prática dos processos,
          promovendo ambientes mais seguros, produtivos e sustentáveis. Não fazemos
          gestão distante — vamos ao campo, ao chão de fábrica, às frentes de serviço.&rdquo;
        </p>
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

export default MissionSection
