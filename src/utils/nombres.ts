/**
 * Presenta un nombre en formato capitalizado: primera letra de cada
 * palabra en mayúscula y el resto en minúsculas.
 * Ej.: "CRISTIAN MARCELO PIZARROSO" -> "Cristian Marcelo Pizarroso".
 */
export function formatearNombre(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palabra) =>
      palabra
        .split('-')
        .map((parte) =>
          parte === '' ? parte : parte[0].toUpperCase() + parte.slice(1),
        )
        .join('-'),
    )
    .join(' ')
}
