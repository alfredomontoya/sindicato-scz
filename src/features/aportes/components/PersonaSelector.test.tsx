import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { useState, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPersona } from '@/features/personas/services/personaService'
import { AporteForm } from './AporteForm'
import { PersonaSelector } from './PersonaSelector'

vi.mock('@/features/personas/services/personaService', async (importOriginal) => {
  const mod =
    await importOriginal<
      typeof import('@/features/personas/services/personaService')
    >()
  return {
    ...mod,
    listPersonas: vi.fn(async () => ({
      personas: [],
      lastVisible: null,
      hasMore: false,
    })),
    createPersona: vi.fn(async () => 'nueva-id-1'),
  }
})

vi.mock('@/features/auditoria/services/auditoriaService', async (importOriginal) => {
  const mod =
    await importOriginal<
      typeof import('@/features/auditoria/services/auditoriaService')
    >()
  return { ...mod, auditar: vi.fn() }
})

vi.mock('@/features/auth/components/AuthProvider', () => ({
  useAuth: () => ({
    user: { uid: 'u1' } as unknown as User,
    profile: null,
    loading: false,
    signIn: async () => {},
    signOut: async () => {},
  }),
}))

function Harness({ children }: { children?: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  const [id, setId] = useState('')
  return (
    <QueryClientProvider client={client}>
      <PersonaSelector personaId={id} onChange={(nuevo) => setId(nuevo)} />
      <p data-testid="seleccionado">{id}</p>
      {children}
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PersonaSelector registro rápido', () => {
  it('crea la persona inexistente y la deja seleccionada', async () => {
    render(<Harness />)

    fireEvent.change(screen.getByLabelText('Buscar persona por nombre o CI'), {
      target: { value: 'CRISTIAN MARCELO PIZARROSO' },
    })

    const registrar = await screen.findByRole('button', {
      name: /Registrar a «CRISTIAN MARCELO PIZARROSO»/,
    })
    fireEvent.click(registrar)

    const dialogo = await screen.findByRole('dialog', {
      name: 'Registrar nueva persona',
    })
    expect(dialogo).toBeDefined()

    fireEvent.change(screen.getByLabelText('CI *'), {
      target: { value: '9988776' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar y seleccionar' }),
    )

    await screen.findByText('CI: 9988776')
    expect(createPersona).toHaveBeenCalledOnce()
    expect(createPersona).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'CRISTIAN MARCELO PIZARROSO',
        ci: '9988776',
      }),
    )
    expect(screen.getByTestId('seleccionado').textContent).toBe('nueva-id-1')
  })

  it('funciona dentro del formulario de aporte (sin interferencia del form exterior)', async () => {
    const alGuardar = vi.fn(async () => {})
    const [client] = [new QueryClient()]
    render(
      <QueryClientProvider client={client}>
        <AporteForm onSubmit={alGuardar} />
      </QueryClientProvider>,
    )

    fireEvent.change(screen.getByLabelText('Buscar persona por nombre o CI'), {
      target: { value: 'CRISTIAN MARCELO PIZARROSO' },
    })
    fireEvent.click(
      await screen.findByRole('button', {
        name: /Registrar a «CRISTIAN MARCELO PIZARROSO»/,
      }),
    )
    fireEvent.change(screen.getByLabelText('CI *'), {
      target: { value: '9988776' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar y seleccionar' }),
    )

    await screen.findByText('CI: 9988776')
    expect(createPersona).toHaveBeenCalledOnce()
    // El aporte NO debe haberse enviado solo (persona recién elegida).
    expect(alGuardar).not.toHaveBeenCalled()
  })
})
