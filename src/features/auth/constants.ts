/** Dominio para las cuentas nuevas creadas desde la app. */
export const DOMINIO_USUARIOS = 'sindicato.com'

/**
 * Dominios probados al iniciar sesión cuando se escribe solo el usuario.
 * El primero es el institucional; gmail.com queda como transición para
 * cuentas creadas antes del dominio propio.
 */
export const DOMINIOS_ACCESO = ['sindicato.com', 'gmail.com']

/**
 * Resuelve los emails candidatos para un identificador: si ya trae @ se
 * usa tal cual; si no, se combina con cada dominio de acceso.
 */
export function resolverEmailsAcceso(identificador: string): string[] {
  const limpio = identificador.trim().toLowerCase()
  if (limpio.includes('@')) {
    return [limpio]
  }
  return DOMINIOS_ACCESO.map((d) => `${limpio}@${d}`)
}
