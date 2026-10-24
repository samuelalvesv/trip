import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { loadTripCatalogState, saveTripCatalogState } from './storage/tripStorage'

describe('App integration — Issue 01: themes, trip management, day strip, and persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-light')
    document.documentElement.removeAttribute('data-dark')
  })

  afterEach(() => {
    cleanup()
  })

  it('toggles between Claro Solar and Escuro OLED themes in 1 touch in the header', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggleButton = screen.getByRole('button', {
      name: /alternar tema/i,
    })

    expect(toggleButton.textContent).toMatch(/Claro Solar/i)
    expect(document.documentElement.hasAttribute('data-light')).toBe(true)
    expect(document.documentElement.hasAttribute('data-dark')).toBe(false)

    await user.click(toggleButton)

    expect(toggleButton.textContent).toMatch(/Escuro OLED/i)
    expect(document.documentElement.hasAttribute('data-dark')).toBe(true)
    expect(document.documentElement.hasAttribute('data-light')).toBe(false)

    await user.click(toggleButton)

    expect(toggleButton.textContent).toMatch(/Claro Solar/i)
    expect(document.documentElement.hasAttribute('data-light')).toBe(true)
    expect(document.documentElement.hasAttribute('data-dark')).toBe(false)
  })

  it('validates new Trip inputs with Fail First and creates a Trip with derived day strip', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /nova viagem/i }))

    const dialog = screen.getByRole('dialog')
    const submitButton = within(dialog).getByRole('button', { name: /criar viagem/i })

    // Try submitting with empty title
    await user.click(submitButton)
    expect(within(dialog).getByRole('alert').textContent).toMatch(
      /informe um título para a viagem/i,
    )

    const titleInput = within(dialog).getByLabelText(/título da viagem/i)
    const startInput = within(dialog).getByLabelText(/data de início/i)
    const endInput = within(dialog).getByLabelText(/data de fim/i)

    // Try submitting with startDate > endDate
    await user.clear(titleInput)
    await user.type(titleInput, 'Expedição Atacama')
    await user.clear(startInput)
    await user.type(startInput, '2026-11-15')
    await user.clear(endInput)
    await user.type(endInput, '2026-11-10')
    await user.click(submitButton)

    expect(within(dialog).getByRole('alert').textContent).toMatch(
      /data de fim deve ser igual ou posterior à data de início/i,
    )

    // Fix endDate to valid 3-day range [2026-11-15, 2026-11-17]
    await user.clear(endInput)
    await user.type(endInput, '2026-11-17')
    await user.click(submitButton)

    expect(screen.getByRole('heading', { name: 'Expedição Atacama' })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Dia 1/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Dia 2/i })).toBeDefined()
    expect(screen.getByRole('tab', { name: /Dia 3/i })).toBeDefined()
    expect(screen.queryByRole('tab', { name: /Dia 4/i })).toBeNull()
  })

  it('persists Trips and active Trip selection in localStorage and restores on reload', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    // Create first trip
    await user.click(screen.getByRole('button', { name: /nova viagem/i }))
    let dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/título da viagem/i), 'Lisboa Primavera')
    await user.clear(within(dialog).getByLabelText(/data de início/i))
    await user.type(within(dialog).getByLabelText(/data de início/i), '2026-04-10')
    await user.clear(within(dialog).getByLabelText(/data de fim/i))
    await user.type(within(dialog).getByLabelText(/data de fim/i), '2026-04-11')
    await user.click(within(dialog).getByRole('button', { name: /criar viagem/i }))

    // Create second trip
    await user.click(screen.getByRole('button', { name: /nova viagem/i }))
    dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/título da viagem/i), 'Porto Outono')
    await user.clear(within(dialog).getByLabelText(/data de início/i))
    await user.type(within(dialog).getByLabelText(/data de início/i), '2026-10-01')
    await user.clear(within(dialog).getByLabelText(/data de fim/i))
    await user.type(within(dialog).getByLabelText(/data de fim/i), '2026-10-03')
    await user.click(within(dialog).getByRole('button', { name: /criar viagem/i }))

    // Switch back to first trip
    await user.click(screen.getByRole('button', { name: /selecionar viagem lisboa primavera/i }))
    expect(screen.getByRole('heading', { name: 'Lisboa Primavera' })).toBeDefined()

    // Unmount and remount to simulate page reload
    firstRender.unmount()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Lisboa Primavera' })).toBeDefined()
    expect(screen.getByRole('button', { name: /selecionar viagem porto outono/i })).toBeDefined()
  })

  it('edits active Trip title and dates and updates the horizontal day strip immediately', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /nova viagem/i }))
    const createDialog = screen.getByRole('dialog')
    await user.type(within(createDialog).getByLabelText(/título da viagem/i), 'Cusco')
    await user.clear(within(createDialog).getByLabelText(/data de início/i))
    await user.type(within(createDialog).getByLabelText(/data de início/i), '2026-06-01')
    await user.clear(within(createDialog).getByLabelText(/data de fim/i))
    await user.type(within(createDialog).getByLabelText(/data de fim/i), '2026-06-02')
    await user.click(within(createDialog).getByRole('button', { name: /criar viagem/i }))

    expect(screen.getAllByRole('tab')).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: /editar viagem/i }))
    const editDialog = screen.getByRole('dialog')
    const titleInput = within(editDialog).getByLabelText(/título da viagem/i)
    const endInput = within(editDialog).getByLabelText(/data de fim/i)

    await user.clear(titleInput)
    await user.click(within(editDialog).getByRole('button', { name: /salvar alterações/i }))
    expect(within(editDialog).getByRole('alert').textContent).toMatch(
      /informe um título para a viagem/i,
    )

    await user.type(titleInput, 'Cusco e Machu Picchu')
    await user.clear(endInput)
    await user.type(endInput, '2026-06-04')
    await user.click(within(editDialog).getByRole('button', { name: /salvar alterações/i }))

    expect(screen.getByRole('heading', { name: 'Cusco e Machu Picchu' })).toBeDefined()
    expect(screen.getAllByRole('tab')).toHaveLength(4)

    await user.click(screen.getByRole('tab', { name: /Dia 3/i }))
    expect(screen.getByRole('heading', { name: /Dia 3 — 03\/06\/2026/i })).toBeDefined()
  })

  it('duplicates the active Trip resetting all completed flags to false', async () => {
    saveTripCatalogState({
      version: 1,
      activeTripId: 'trip-orig',
      trips: [
        {
          id: 'trip-orig',
          title: 'Roteiro Mendoza',
          startDate: '2026-09-10',
          endDate: '2026-09-11',
          places: [
            {
              id: 'p1',
              name: 'Bodega Catena Zapata',
              mapUrl: 'https://maps.app.goo.gl/xyz',
              coordinates: { lat: -33.168, lng: -68.902 },
              attachments: [],
              updatedAt: '2026-09-01T10:00:00.000Z',
            },
          ],
          stops: [
            {
              id: 's1',
              placeId: 'p1',
              date: '2026-09-10',
              arrivalTime: '11:00',
              stayDurationMinutes: 120,
              completed: true,
              completedAt: '2026-09-10T13:00:00.000Z',
              attachments: [],
              updatedAt: '2026-09-10T13:00:00.000Z',
            },
          ],
          attachments: [],
          checklist: [
            {
              id: 'c1',
              label: 'Passaporte válido',
              completed: true,
              updatedAt: '2026-09-01T10:00:00.000Z',
            },
          ],
          updatedAt: '2026-09-10T13:00:00.000Z',
        },
      ],
    })

    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /duplicar viagem/i }))

    expect(screen.getByRole('heading', { name: 'Roteiro Mendoza (Cópia)' })).toBeDefined()

    const persisted = loadTripCatalogState()
    expect(persisted.trips).toHaveLength(2)

    const duplicatedTrip = persisted.trips.find(
      (trip) => trip.title === 'Roteiro Mendoza (Cópia)',
    )
    expect(duplicatedTrip).toBeDefined()
    expect(duplicatedTrip?.stops[0]?.completed).toBe(false)
    expect(duplicatedTrip?.checklist[0]?.completed).toBe(false)
  })

  it('deletes a Trip and restores it in 1 touch via the Snackbar Desfazer action', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /nova viagem/i }))
    const dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/título da viagem/i), 'Cartagena')
    await user.clear(within(dialog).getByLabelText(/data de início/i))
    await user.type(within(dialog).getByLabelText(/data de início/i), '2026-12-01')
    await user.clear(within(dialog).getByLabelText(/data de fim/i))
    await user.type(within(dialog).getByLabelText(/data de fim/i), '2026-12-03')
    await user.click(within(dialog).getByRole('button', { name: /criar viagem/i }))

    expect(screen.getByRole('heading', { name: 'Cartagena' })).toBeDefined()

    await user.click(screen.getByRole('button', { name: /excluir viagem/i }))

    expect(screen.queryByRole('heading', { name: 'Cartagena' })).toBeNull()
    expect(loadTripCatalogState().trips).toHaveLength(0)

    const undoButton = screen.getByRole('button', { name: /desfazer/i })
    await user.click(undoButton)

    expect(screen.getByRole('heading', { name: 'Cartagena' })).toBeDefined()
    expect(loadTripCatalogState().trips).toHaveLength(1)
  })
})
