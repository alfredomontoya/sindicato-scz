import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Tema = 'claro' | 'oscuro' | 'sistema'

interface ThemeContextValue {
  tema: Tema
  oscuro: boolean
  setTema: (tema: Tema) => void
}

const CLAVE = 'sindicato-tema'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function leerInicial(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'claro' || guardado === 'oscuro' || guardado === 'sistema') {
      return guardado
    }
  } catch {
    // localStorage no disponible: se usa el sistema.
  }
  return 'sistema'
}

function prefiereOscuro(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaEstado] = useState<Tema>(leerInicial)
  const oscuro = tema === 'oscuro' || (tema === 'sistema' && prefiereOscuro())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
  }, [oscuro])

  useEffect(() => {
    if (tema !== 'sistema' || typeof window.matchMedia !== 'function') {
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const aplicar = () => document.documentElement.classList.toggle('dark', mq.matches)
    mq.addEventListener('change', aplicar)
    return () => mq.removeEventListener('change', aplicar)
  }, [tema])

  const setTema = useCallback((nuevo: Tema) => {
    setTemaEstado(nuevo)
    try {
      localStorage.setItem(CLAVE, nuevo)
    } catch {
      // Sin almacenamiento: la preferencia solo dura la sesión.
    }
  }, [])

  const value = useMemo(() => ({ tema, oscuro, setTema }), [tema, oscuro, setTema])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (ctx === null) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return ctx
}
