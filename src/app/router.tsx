import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/shared/AppLayout'
import { LoadingState } from '@/components/shared/States'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { DashboardPage } from './DashboardPage'
import { ProtectedRoute, RoleRoute } from './guards'

const PersonasPage = lazy(() =>
  import('@/features/personas/components/PersonasPage').then((m) => ({
    default: m.PersonasPage,
  })),
)
const PersonaFormPage = lazy(() =>
  import('@/features/personas/components/PersonaFormPage').then((m) => ({
    default: m.PersonaFormPage,
  })),
)
const PersonaDetailPage = lazy(() =>
  import('@/features/personas/components/PersonaDetailPage').then((m) => ({
    default: m.PersonaDetailPage,
  })),
)
const AportesPage = lazy(() =>
  import('@/features/aportes/components/AportesPage').then((m) => ({
    default: m.AportesPage,
  })),
)
const AporteFormPage = lazy(() =>
  import('@/features/aportes/components/AporteFormPage').then((m) => ({
    default: m.AporteFormPage,
  })),
)
const AporteDetailPage = lazy(() =>
  import('@/features/aportes/components/AporteDetailPage').then((m) => ({
    default: m.AporteDetailPage,
  })),
)
const ReciboPage = lazy(() =>
  import('@/features/recibos/components/ReciboPage').then((m) => ({
    default: m.ReciboPage,
  })),
)
const UsuariosPage = lazy(() =>
  import('@/features/usuarios/components/UsuariosPage').then((m) => ({
    default: m.UsuariosPage,
  })),
)
const UsuarioFormPage = lazy(() =>
  import('@/features/usuarios/components/UsuarioFormPage').then((m) => ({
    default: m.UsuarioFormPage,
  })),
)
const CierresPage = lazy(() =>
  import('@/features/cierres/components/CierresPage').then((m) => ({
    default: m.CierresPage,
  })),
)

function NoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground">
        La dirección ingresada no corresponde a ninguna sección del sistema.
      </p>
    </main>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingState mensaje="Cargando…" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="personas" element={<PersonasPage />} />
            <Route
              path="personas/nueva"
              element={
                <RoleRoute roles={['admin', 'registro']}>
                  <PersonaFormPage modo="nueva" />
                </RoleRoute>
              }
            />
            <Route path="personas/:id" element={<PersonaDetailPage />} />
            <Route
              path="personas/:id/editar"
              element={
                <RoleRoute roles={['admin', 'registro']}>
                  <PersonaFormPage modo="editar" />
                </RoleRoute>
              }
            />
            <Route path="aportes" element={<AportesPage />} />
            <Route
              path="aportes/nuevo"
              element={
                <RoleRoute roles={['admin', 'registro']}>
                  <AporteFormPage />
                </RoleRoute>
              }
            />
            <Route path="aportes/:id" element={<AporteDetailPage />} />
            <Route path="recibos/:id" element={<ReciboPage />} />
            <Route path="cierres" element={<CierresPage />} />
            <Route
              path="usuarios"
              element={
                <RoleRoute roles={['admin']}>
                  <UsuariosPage />
                </RoleRoute>
              }
            />
            <Route
              path="usuarios/nuevo"
              element={
                <RoleRoute roles={['admin']}>
                  <UsuarioFormPage modo="nuevo" />
                </RoleRoute>
              }
            />
            <Route
              path="usuarios/:id/editar"
              element={
                <RoleRoute roles={['admin']}>
                  <UsuarioFormPage modo="editar" />
                </RoleRoute>
              }
            />
            {/* Auditoría oculta por ahora (se sigue registrando en segundo plano). */}
            <Route path="auditoria" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </Suspense>
  )
}
