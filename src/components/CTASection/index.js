import { useEffect, useRef } from 'react'
import { ArrowRight, Phone } from 'lucide-react'

const CTASection = () => {
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
      id="contato"
      ref={sectionRef}
      className="py-14 sm:py-20 lg:py-28 bg-linear-to-br from-[#0a2e4f] via-[#0f4c81] to-[#1a3a5c] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2a9d6e]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Pronto para elevar o nível de segurança da sua empresa?
        </h2>
        <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-lg text-white/70 mb-10 leading-relaxed">
          Solicite um diagnóstico gratuito e receba uma proposta personalizada em até 24
          horas. Sem compromisso.
        </p>

        <div className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/5566997188890?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20diagn%C3%B3stico%20gratuito."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2a9d6e] hover:bg-[#238a5e] text-white font-semibold px-8 py-4 text-base shadow-lg shadow-[#2a9d6e]/30 transition-colors duration-200"
          >
            Falar com especialista
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="tel:66997188890"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-4 text-base transition-colors duration-200"
          >
            <Phone className="w-5 h-5" />
            (66) 99718-8890
          </a>
        </div>

        <div className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-300 ease-out mt-8 flex items-center justify-center gap-6 text-white/40 text-sm flex-wrap">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c785]" />
            Diagnóstico gratuito
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c785]" />
            Resposta em 24h
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34c785]" />
            Sem compromisso
          </span>
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

export default CTASection
