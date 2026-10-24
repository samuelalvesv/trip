import { parseTripCatalogState, type TripCatalogState } from '../domain/trip'

export const TRIP_STORAGE_KEY = 'trip:v1:state' as const

export function createEmptyTripCatalogState(): TripCatalogState {
  return {
    version: 1,
    activeTripId: null,
    trips: [],
  }
}

export function loadTripCatalogState(
  storage: Pick<Storage, 'getItem'> = window.localStorage,
): TripCatalogState {
  try {
    const raw = storage.getItem(TRIP_STORAGE_KEY)
    if (!raw) {
      return createEmptyTripCatalogState()
    }

    const parsedJson: unknown = JSON.parse(raw)
    const validated = parseTripCatalogState(parsedJson)
    if (!validated.ok) {
      return createEmptyTripCatalogState()
    }

    return validated.value
  } catch {
    return createEmptyTripCatalogState()
  }
}

export function saveTripCatalogState(
  state: TripCatalogState,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void {
  try {
    storage.setItem(TRIP_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota or private mode restrictions silently at runtime
  }
}
