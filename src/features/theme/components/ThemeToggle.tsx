import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../ThemeProvider'

export function ThemeToggle() {
  const { tema, oscuro, setTema } = useTheme()
  const siguiente = oscuro ? 'claro' : 'oscuro'

  return (
    <button
      type="button"
      onClick={() => setTema(siguiente)}
      aria-label={
        oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      }
      title={`Tema actual: ${tema}. Clic para modo ${siguiente}.`}
      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {oscuro ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  )
}
