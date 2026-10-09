import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { auditar } from '@/features/auditoria/services/auditoriaService'
import { useAuth } from '@/features/auth/components/AuthProvider'
import type { PersonaFormValues } from '../schemas/personaSchema'
import { createPersona } from '../services/personaService'
import { PersonaForm } from './PersonaForm'

/** Si el texto parece CI (solo alfanumérico, sin espacios) se prellena el CI. */
function prefill(texto: string): PersonaFormValues {
  const limpio = texto.trim()
  const base = { nombre: '', ci: '', direccion: '', telefono: '', estado: true }
  if (/^[A-Za-z0-9]{3,20}$/.test(limpio)) {
    return { ...base, ci: limpio }
  }
  return { ...base, nombre: limpio }
}

export function PersonaQuickCreateDialog({
  textoInicial,
  onCreada,
  onCerrar,
}: {
  textoInicial: string
  onCreada: (id: string, nombre: string, ci: string) => void
  onCerrar: () => void
}) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !guardando) {
        onCerrar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar, guardando])

  const guardar = async (values: PersonaFormValues) => {
    setGuardando(true)
    try {
      const id = await createPersona(values)
      if (user !== null) {
        auditar({
          usuarioId: user.uid,
          accion: 'persona.crear',
          entidad: 'personas',
          entidadId: id,
          descripcion: values.nombre,
        })
      }
      await queryClient.invalidateQueries({ queryKey: ['personas'] })
      onCreada(id, values.nombre.trim(), values.ci.trim().toUpperCase())
    } finally {
      setGuardando(false)
    }
  }

  const cerrar = () => {
    if (!guardando) {
      onCerrar()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={cerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registro-rapido-titulo"
        className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-lg border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="registro-rapido-titulo" className="text-lg font-semibold">
          Registrar nueva persona
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Al guardar quedará seleccionada en el aporte.
        </p>
        <div className="mt-4">
          <PersonaForm
            valoresIniciales={prefill(textoInicial)}
            textoBoton="Registrar y seleccionar"
            onCancelar={cerrar}
            onSubmit={guardar}
          />
        </div>
      </div>
    </div>
  )
}
