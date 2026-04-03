import { useEffect, useRef } from 'react'

const clients = [
  'Vale Florestar',
  'Suzano',
  'Hydro Mineração',
  'Guerdal',
  'Bracell',
  'ADM do Brasil'
]

const ClientsSection = () => {
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
    <section id="clients" ref={sectionRef} className="py-14 sm:py-20 lg:py-28 bg-[#f7fafc] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a9d6e]/10 text-sm font-semibold text-[#2a9d6e] uppercase tracking-widest mb-4">
          Clientes
        </span>
        <h2 className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out text-3xl sm:text-4xl font-bold text-[#1a202c] dark:text-gray-100 mb-4">
          Empresas que confiam na{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0f4c81] to-[#2a9d6e]">
            MoviSul
          </span>
        </h2>
        <p className="fade-up opacity-0 translate-y-6 transition-all duration-700 delay-200 ease-out text-lg text-[#4a5568] dark:text-gray-400 max-w-2xl mx-auto mb-12">
          Atendemos grandes empresas dos setores de mineração, construção, logística,
          agroindústria e área florestal.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {clients.map((client, i) => (
            <div
              key={i}
              className="fade-up opacity-0 translate-y-6 transition-all duration-700 ease-out group flex items-center justify-center py-8 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#0f4c81]/20"
              style={{ transitionDelay: `${(i + 3) * 80}ms` }}
            >
              <span className="font-bold text-[#718096] dark:text-gray-400 group-hover:text-[#0f4c81] dark:group-hover:text-[#63b3ed] text-sm tracking-wide transition-colors duration-200">
                {client}
              </span>
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

export default ClientsSection
