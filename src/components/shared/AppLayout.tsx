import { LogOut } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { can } from '@/features/auth/permissions'
import { useAuth } from '@/features/auth/components/AuthProvider'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

function linkClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
  }`
}

const ROL_ETIQUETA: Record<string, string> = {
  admin: 'Admin',
  registro: 'Registro',
  consulta: 'Consulta',
}

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const salir = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <header className="no-print flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Inicio">
          <img
            src="/escudo-santa-cruz-simple.png"
            alt="Escudo de Santa Cruz"
            className="h-12 w-auto"
          />
          <span>
            <span className="block text-lg font-semibold leading-tight">
              Control de aportes
            </span>
            {profile !== null && (
              <span className="block text-sm text-muted-foreground">
                {profile.nombre} · {ROL_ETIQUETA[profile.rol] ?? profile.rol}
              </span>
            )}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            Panel
          </NavLink>
          <NavLink to="/personas" className={linkClass}>
            Personas
          </NavLink>
          <NavLink to="/aportes" className={linkClass}>
            Aportes
          </NavLink>
          <NavLink to="/cierres" className={linkClass}>
            Cierres
          </NavLink>
          {can(profile?.rol, 'usuarios.gestionar') && (
            <NavLink to="/usuarios" className={linkClass}>
              Usuarios
            </NavLink>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void salir()
            }}
          >
            <LogOut className="size-4" aria-hidden />
            Salir
          </Button>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
