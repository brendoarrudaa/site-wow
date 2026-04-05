import { createContext, useContext, useEffect, useState } from 'react'

interface GmModeContextValue {
  gmMode: boolean
  setGmMode: (v: boolean) => void
}

const GmModeContext = createContext<GmModeContextValue>({
  gmMode: true,
  setGmMode: () => {}
})

export const GmModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [gmMode, setGmModeState] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('gm-mode')
    if (saved === 'false') setGmModeState(false)
  }, [])

  const setGmMode = (v: boolean) => {
    localStorage.setItem('gm-mode', String(v))
    setGmModeState(v)
  }

  return (
    <GmModeContext.Provider value={{ gmMode, setGmMode }}>
      {children}
    </GmModeContext.Provider>
  )
}

export const useGmMode = () => useContext(GmModeContext)
