import Link from 'next/link'

const CookiesAlert = ({ setOpen }) => {
  const handleAccept = () => {
    if (localStorage) {
      localStorage.setItem('accept-cookies', 'true')
    }
    setOpen(true)
  }

  const handleReject = () => {
    if (localStorage) {
      localStorage.setItem('accept-cookies', 'false')
    }
    setOpen(false)
  }

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-[856px] flex flex-col md:flex-row items-center gap-3 rounded bg-white dark:bg-gray-900 px-4 py-3 shadow-lg border-b-4 border-[#0f4c81]">
      <div className="text-xs md:text-sm text-[#4a5568] dark:text-gray-300">
        <p>
          Nós usamos cookies e outras tecnologias semelhantes para melhorar sua
          experiência em nossos serviços, personalizar publicidade e recomendar
          conteúdo de seu interesse.
        </p>
        <p className="mt-2">
          Para mais informações, leia a nossa{' '}
          <Link
            href="/politica-de-privacidade"
            className="text-[#0f4c81] dark:text-[#63b3ed] hover:underline"
          >
            Política de Privacidade
          </Link>
        </p>
      </div>
      <div className="flex gap-2 shrink-0 md:flex-col">
        <button
          className="px-4 py-1.5 text-sm rounded-full bg-[#0f4c81] hover:bg-[#0d3f6b] text-white transition-colors cursor-pointer"
          onClick={handleAccept}
        >
          Aceitar
        </button>
        <button
          className="px-4 py-1.5 text-sm rounded-full border border-[#0f4c81] text-[#0f4c81] dark:border-[#63b3ed] dark:text-[#63b3ed] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={handleReject}
        >
          Recusar
        </button>
      </div>
    </div>
  )
}

export default CookiesAlert
