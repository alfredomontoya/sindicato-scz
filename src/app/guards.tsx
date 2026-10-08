import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router'
import { LoadingState } from '@/components/shared/States'
import { useAuth } from '@/features/auth/components/AuthProvider'
import type { RolUsuario } from '@/types'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return <LoadingState mensaje="Cargando sesión…" />
  }
  if (user === null) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export function RoleRoute({
  roles,
  children,
}: {
  roles: RolUsuario[]
  children: ReactNode
}) {
  const { profile, loading } = useAuth()
  if (loading) {
    return <LoadingState mensaje="Cargando sesión…" />
  }
  if (profile === null || !roles.includes(profile.rol)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
