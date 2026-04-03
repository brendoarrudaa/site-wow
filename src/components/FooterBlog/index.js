import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Phone, MapPin, AtSign, Mail } from 'lucide-react'

const FooterBlog = () => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    setTheme(window.__theme || 'light')
    window.__onThemeChange(t => setTheme(t))
  }, [])

  const isDark = theme === 'dark'

  return (
    <footer className="bg-[#fcfcfc] dark:bg-[#072741] backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm text-[#1f2937] dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Image
                src={
                  isDark
                    ? '/assets/img/logo-dark.png'
                    : '/assets/img/logo-light.png'
                }
                alt="Movisul"
                width={85}
                height={40}
                sizes="85px"
                priority
                className="block object-contain"
                style={{ width: '85px', height: '40px' }}
              />
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Saúde &amp; Segurança do Trabalho. Soluções completas para
              empresas que valorizam segurança, performance e conformidade.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
              Contato
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <a
                href="tel:66997188890"
                className="flex items-center gap-3 hover:text-[#34c785] dark:hover:text-[#34c785] transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                (66) 99718-8890
              </a>
              <a
                href="tel:66999254544"
                className="flex items-center gap-3 hover:text-[#34c785] dark:hover:text-[#34c785] transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                (66) 99925-4544
              </a>
              <a
                href="mailto:contato@movisul.com.br"
                className="flex items-center gap-3 hover:text-[#34c785] dark:hover:text-[#34c785] transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                contato@movisul.com.br
              </a>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
              Endereço
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <a
                href="https://maps.app.goo.gl/XtXEKcKs2MEipFqZ8"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Rua G, 102 — Rondonópolis/MT</span>
              </a>
              <a
                href="https://www.instagram.com/mmovisul"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#34c785] dark:hover:text-[#34c785] transition-colors"
              >
                <AtSign className="w-4 h-4 shrink-0" />
                @mmovisul
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300/70 dark:border-gray-700 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600 dark:text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} MoviSul — Saúde &amp; Segurança do
            Trabalho. Todos os direitos reservados.
          </p>
          <Link
            href="/politica-de-privacidade"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default FooterBlog
