import { useEffect, useRef } from 'react'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Diego Maciel',
    role: 'Gerente de Segurança — Norsk Hydro',
    text: 'MoviSul é uma empresa experiente e eficiente, especialista em segurança e saúde ocupacional. Demonstrou domínio de ferramentas de gestão, implementou controles e soluções eficazes que minimizaram riscos e melhoraram práticas de segurança.'
  },
  {
    name: 'Cicero Viana',
    role: 'Gestor de HSSE & Sustentabilidade',
    text: 'MoviSul é uma empresa comprometida e com excelente capacidade de comunicação. Muito eficaz na gestão de Saúde e Segurança do Trabalho. Empresa pontual, prestativa e proativa.'
  }
]

const TestimonialsSection = () => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d6e]/10 text-sm font-semibold text-[#2a9d6e] uppercase tracking-widest mb-4">
            Depoimentos
          </span>
          <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-gray-100">
            O que nossos clientes <span className="text-[#0f4c81] dark:text-[#63b3ed]">dizem</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg"
              style={{ transitionDelay: `${(i + 2) * 150}ms` }}
            >
              <Quote
                size={40}
                strokeWidth={1}
                className="absolute top-6 right-6 text-[#0f4c81]/10 dark:text-[#63b3ed]/10"
              />
              <p className="text-[#4a5568] dark:text-gray-400 leading-relaxed mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0f4c81] to-[#2a9d6e] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#1a202c] dark:text-gray-100 text-sm">{t.name}</p>
                  <p className="text-xs text-[#718096] dark:text-gray-400">{t.role}</p>
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

export default TestimonialsSection
