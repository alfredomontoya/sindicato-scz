import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from './AuthProvider'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'

const inputClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [errorAuth, setErrorAuth] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (!loading && user !== null) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setErrorAuth(null)
    try {
      await signIn(values.email, values.password)
      navigate('/', { replace: true })
    } catch (error) {
      setErrorAuth(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sindicato SCZ · Control de aportes voluntarios
        </p>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(onSubmit)(e)
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@sindicato.bo"
            className={inputClass}
            {...register('email')}
          />
          {errors.email !== undefined && (
            <p role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
            {...register('password')}
          />
          {errors.password !== undefined && (
            <p role="alert" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {errorAuth !== null && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorAuth}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting || loading}>
          <LogIn className="size-4" aria-hidden />
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </main>
  )
}
