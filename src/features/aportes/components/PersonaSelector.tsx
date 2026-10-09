import { UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { PersonaQuickCreateDialog } from '@/features/personas/components/PersonaQuickCreateDialog'
import { usePersonas } from '@/features/personas/hooks/usePersonas'
import { formatearNombre } from '@/utils/nombres'

/**
 * Selector de persona con búsqueda por nombre o CI (solo activas).
 * Si no existe, ofrece registrarla en un modal con el texto ingresado;
 * al guardar queda seleccionada automáticamente.
 */
export function PersonaSelector({
  personaId,
  nombreInicial = '',
  ciInicial = '',
  onChange,
}: {
  personaId: string
  nombreInicial?: string
  ciInicial?: string
  onChange: (id: string, nombre: string) => void
}) {
  const [texto, setTexto] = useState(nombreInicial)
  const [ciSeleccionado, setCiSeleccionado] = useState(ciInicial)
  const [abierto, setAbierto] = useState(false)
  const [dialogo, setDialogo] = useState(false)
  const textoDeb = useDebouncedValue(texto)

  const { data, isLoading } = usePersonas(
    { search: personaId === '' ? textoDeb : '', estado: true, telefono: '' },
    personaId === '' && textoDeb.trim() !== '',
  )
  const opciones = (data?.pages.flatMap((p) => p.personas) ?? []).slice(0, 8)
  const escribiendo = textoDeb.trim() !== ''
  const sinResultados = escribiendo && !isLoading && opciones.length === 0

  const elegir = (id: string, nombre: string, ci: string) => {
    onChange(id, nombre)
    setTexto(nombre)
    setCiSeleccionado(ci)
    setAbierto(false)
  }

  const limpiar = () => {
    onChange('', '')
    setTexto('')
    setCiSeleccionado('')
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-label="Buscar persona por nombre o CI"
          aria-autocomplete="list"
          placeholder="Escriba el nombre o CI…"
          autoComplete="off"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setAbierto(true)
            if (personaId !== '') {
              onChange('', '')
              setCiSeleccionado('')
            }
          }}
          onFocus={() => setAbierto(true)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {personaId !== '' && (
          <button
            type="button"
            onClick={limpiar}
            aria-label="Quitar persona seleccionada"
            className="rounded-md border border-input px-2.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      {personaId !== '' && ciSeleccionado !== '' && (
        <p className="mt-1 text-xs text-muted-foreground">CI: {ciSeleccionado}</p>
      )}
      {abierto && personaId === '' && escribiendo && (
        <ul
          role="listbox"
          aria-label="Personas encontradas"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg"
        >
          {opciones.map((p) => (
            <li key={p.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => elegir(p.id, p.nombre, p.ci)}
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{formatearNombre(p.nombre)}</span>
                <span className="text-xs text-muted-foreground">
                  CI: {p.ci === '' ? '—' : p.ci}
                  {p.telefono !== '' && ` · ${p.telefono}`}
                </span>
              </button>
            </li>
          ))}
          {sinResultados ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setAbierto(false)
                  setDialogo(true)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted"
              >
                <UserPlus className="size-4" aria-hidden />
                Registrar a «{textoDeb.trim()}» como nueva persona
              </button>
            </li>
          ) : (
            <li>
              <button
                type="button"
                onClick={() => {
                  setAbierto(false)
                  setDialogo(true)
                }}
                className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
              >
                <UserPlus className="size-4" aria-hidden />
                No es quien busca… registrar nueva persona
              </button>
            </li>
          )}
        </ul>
      )}
      {dialogo &&
        createPortal(
          <PersonaQuickCreateDialog
            textoInicial={personaId === '' ? texto : ''}
            onCreada={(id, nombre, ci) => {
              setDialogo(false)
              elegir(id, nombre, ci)
            }}
            onCerrar={() => setDialogo(false)}
          />,
          document.body,
        )}
    </div>
  )
}
