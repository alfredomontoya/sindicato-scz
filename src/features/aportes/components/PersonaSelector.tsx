import { X } from 'lucide-react'
import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePersonas } from '@/features/personas/hooks/usePersonas'

/**
 * Selector de persona con búsqueda por nombre (solo activas).
 * Controlado por personaId; notifica id y nombre al elegir.
 */
export function PersonaSelector({
  personaId,
  nombreInicial = '',
  onChange,
}: {
  personaId: string
  nombreInicial?: string
  onChange: (id: string, nombre: string) => void
}) {
  const [texto, setTexto] = useState(nombreInicial)
  const [abierto, setAbierto] = useState(false)
  const textoDeb = useDebouncedValue(texto)

  const { data } = usePersonas(
    { search: personaId === '' ? textoDeb : '', estado: true, telefono: '' },
    personaId === '' && textoDeb.trim() !== '',
  )
  const opciones = (data?.pages.flatMap((p) => p.personas) ?? []).slice(0, 8)

  const elegir = (id: string, nombre: string) => {
    onChange(id, nombre)
    setTexto(nombre)
    setAbierto(false)
  }

  const limpiar = () => {
    onChange('', '')
    setTexto('')
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-label="Buscar persona por nombre"
          aria-autocomplete="list"
          placeholder="Escriba el nombre…"
          autoComplete="off"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setAbierto(true)
            if (personaId !== '') {
              onChange('', '')
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
      {abierto && personaId === '' && textoDeb.trim() !== '' && (
        <ul
          role="listbox"
          aria-label="Personas encontradas"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg"
        >
          {opciones.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Sin resultados. Registre a la persona primero.
            </li>
          )}
          {opciones.map((p) => (
            <li key={p.id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => elegir(p.id, p.nombre)}
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{p.nombre}</span>
                {p.telefono !== '' && (
                  <span className="text-xs text-muted-foreground">{p.telefono}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
