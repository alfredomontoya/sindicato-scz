import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '../ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  mockMatchMedia(false)
})

describe('ThemeToggle', () => {
  it('alterna a oscuro, aplica la clase y persiste', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    const boton = screen.getByRole('button', { name: 'Cambiar a modo oscuro' })
    fireEvent.click(boton)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('sindicato-tema')).toBe('oscuro')
    expect(
      screen.getByRole('button', { name: 'Cambiar a modo claro' }),
    ).toBeDefined()
  })

  it('respeta el tema guardado al iniciar', () => {
    localStorage.setItem('sindicato-tema', 'oscuro')
    mockMatchMedia(false)
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
