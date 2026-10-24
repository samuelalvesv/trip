import { beforeEach, describe, expect, it } from 'vitest'
import { createTrip } from '../domain/trip'
import {
  createEmptyTripCatalogState,
  loadTripCatalogState,
  saveTripCatalogState,
  TRIP_STORAGE_KEY,
} from './tripStorage'

describe('tripStorage — versioned localStorage persistence', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty v1 catalog state when localStorage is empty or corrupted', () => {
    expect(loadTripCatalogState()).toEqual(createEmptyTripCatalogState())

    window.localStorage.setItem(TRIP_STORAGE_KEY, '{invalid-json')
    expect(loadTripCatalogState()).toEqual(createEmptyTripCatalogState())

    window.localStorage.setItem(
      TRIP_STORAGE_KEY,
      JSON.stringify({ version: 99, activeTripId: null, trips: [] }),
    )
    expect(loadTripCatalogState()).toEqual(createEmptyTripCatalogState())
  })

  it('persists and hydrates trips and activeTripId across sessions', () => {
    const tripResult = createTrip(
      {
        title: 'Bariloche Inverno',
        startDate: '2026-07-10',
        endDate: '2026-07-15',
      },
      { id: 'trip-bariloche', now: '2026-06-01T12:00:00.000Z' },
    )
    expect(tripResult.ok).toBe(true)
    if (!tripResult.ok) return

    const state = {
      version: 1 as const,
      activeTripId: tripResult.value.id,
      trips: [tripResult.value],
    }

    saveTripCatalogState(state)

    const hydrated = loadTripCatalogState()
    expect(hydrated).toEqual(state)
  })
})
