import { describe, expect, it } from 'vitest'
import {
  createTrip,
  deriveTripDays,
  duplicateTrip,
  parseTrip,
  parseTripCatalogState,
  type Trip,
  updateTrip,
  validateTripDraft,
} from './trip'

describe('trip domain — validation and day derivation', () => {
  it('validates and creates a Trip when title and date range [startDate, endDate] are valid', () => {
    const result = createTrip(
      {
        title: '  Roteiro Tóquio  ',
        startDate: '2026-11-10',
        endDate: '2026-11-12',
      },
      {
        id: 'trip-1',
        now: '2026-10-23T12:00:00.000Z',
      },
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value).toEqual({
      id: 'trip-1',
      title: 'Roteiro Tóquio',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      places: [],
      stops: [],
      attachments: [],
      checklist: [],
      updatedAt: '2026-10-23T12:00:00.000Z',
    })
  })

  it('rejects empty or whitespace-only titles at the entry boundary', () => {
    const result = validateTripDraft({
      title: '   ',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
    })

    expect(result).toEqual({
      ok: false,
      error: 'Informe um título para a viagem.',
    })
  })

  it('rejects malformed or non-existent calendar dates', () => {
    const result = validateTripDraft({
      title: 'Patagônia',
      startDate: '2026-02-30',
      endDate: '2026-03-05',
    })

    expect(result).toEqual({
      ok: false,
      error: 'A data de início informada é inválida.',
    })
  })

  it('rejects ranges where startDate is after endDate', () => {
    const result = validateTripDraft({
      title: 'Lisboa',
      startDate: '2026-11-15',
      endDate: '2026-11-10',
    })

    expect(result).toEqual({
      ok: false,
      error: 'A data de fim deve ser igual ou posterior à data de início.',
    })
  })

  it('derives the closed interval of days [startDate, endDate] without timezone drift', () => {
    const days = deriveTripDays({
      startDate: '2026-11-10',
      endDate: '2026-11-12',
    })

    expect(days).toEqual([
      {
        index: 1,
        date: '2026-11-10',
        label: 'Dia 1',
        shortDate: '10/11',
      },
      {
        index: 2,
        date: '2026-11-11',
        label: 'Dia 2',
        shortDate: '11/11',
      },
      {
        index: 3,
        date: '2026-11-12',
        label: 'Dia 3',
        shortDate: '12/11',
      },
    ])
  })

  it('updates an existing Trip and rejects invalid edits at the boundary', () => {
    const baseTrip: Trip = {
      id: 'trip-1',
      title: 'Roma Antiga',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      places: [],
      stops: [],
      attachments: [],
      checklist: [],
      updatedAt: '2026-04-01T10:00:00.000Z',
    }

    const invalidUpdate = updateTrip(baseTrip, {
      title: '',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
    })
    expect(invalidUpdate.ok).toBe(false)

    const validUpdate = updateTrip(
      baseTrip,
      {
        title: 'Roma e Florença',
        startDate: '2026-05-02',
        endDate: '2026-05-06',
      },
      { now: '2026-04-02T15:30:00.000Z' },
    )

    expect(validUpdate).toEqual({
      ok: true,
      value: {
        ...baseTrip,
        title: 'Roma e Florença',
        startDate: '2026-05-02',
        endDate: '2026-05-06',
        updatedAt: '2026-04-02T15:30:00.000Z',
      },
    })
  })

  it('duplicates a Trip as an independent copy resetting all completed flags to false', () => {
    const sourceTrip: Trip = {
      id: 'trip-source',
      title: 'Kyoto Outono',
      startDate: '2026-11-01',
      endDate: '2026-11-04',
      places: [
        {
          id: 'place-1',
          name: 'Fushimi Inari',
          mapUrl: 'https://www.google.com/maps/place/Fushimi+Inari',
          coordinates: { lat: 34.9671, lng: 135.7727 },
          address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
          attachments: [
            {
              id: 'att-place-1',
              label: 'Mapa do Santuário',
              url: 'https://drive.google.com/file/d/abc123/view',
              updatedAt: '2026-10-01T10:00:00.000Z',
            },
          ],
          updatedAt: '2026-10-01T10:00:00.000Z',
        },
      ],
      stops: [
        {
          id: 'stop-1',
          placeId: 'place-1',
          date: '2026-11-01',
          arrivalTime: '08:30',
          stayDurationMinutes: 120,
          completed: true,
          completedAt: '2026-11-01T10:30:00.000Z',
          notes: 'Chegar cedo',
          attachments: [
            {
              id: 'att-stop-1',
              label: 'Ticket Trem JR',
              url: 'https://drive.google.com/file/d/def456/view',
              updatedAt: '2026-10-01T10:00:00.000Z',
            },
          ],
          updatedAt: '2026-11-01T10:30:00.000Z',
        },
      ],
      attachments: [
        {
          id: 'att-trip-1',
          label: 'Seguro Viagem',
          url: 'https://drive.google.com/file/d/xyz789/view',
          updatedAt: '2026-10-01T10:00:00.000Z',
        },
      ],
      checklist: [
        {
          id: 'chk-1',
          label: 'Comprar IC Card',
          completed: true,
          updatedAt: '2026-10-15T10:00:00.000Z',
        },
        {
          id: 'chk-2',
          label: 'Reservar Ryokan',
          completed: false,
          updatedAt: '2026-10-15T10:00:00.000Z',
        },
      ],
      updatedAt: '2026-11-01T10:30:00.000Z',
    }

    let counter = 0
    const duplicated = duplicateTrip(sourceTrip, {
      now: '2026-12-01T09:00:00.000Z',
      createId: () => {
        counter += 1
        return `copy-id-${counter}`
      },
    })

    expect(duplicated.id).toBe('copy-id-1')
    expect(duplicated.id).not.toBe(sourceTrip.id)
    expect(duplicated.title).toBe('Kyoto Outono (Cópia)')
    expect(duplicated.startDate).toBe('2026-11-01')
    expect(duplicated.endDate).toBe('2026-11-04')
    expect(duplicated.updatedAt).toBe('2026-12-01T09:00:00.000Z')

    const copiedPlace = duplicated.places[0]
    const copiedStop = duplicated.stops[0]
    expect(copiedPlace).toBeDefined()
    expect(copiedStop).toBeDefined()
    if (!copiedPlace || !copiedStop) return

    expect(copiedPlace.id).not.toBe('place-1')
    expect(copiedStop.id).not.toBe('stop-1')
    expect(copiedStop.placeId).toBe(copiedPlace.id)
    expect(copiedStop.completed).toBe(false)
    expect('completedAt' in copiedStop).toBe(false)
    expect(duplicated.checklist.every((item) => !item.completed)).toBe(true)
    expect(sourceTrip.stops[0]?.completed).toBe(true)
    expect(sourceTrip.checklist[0]?.completed).toBe(true)
  })

  it('validates persisted Trip and TripCatalogState schemas with Fail First', () => {
    const validTrip: Trip = {
      id: 'trip-1',
      title: 'Atacama',
      startDate: '2026-08-10',
      endDate: '2026-08-14',
      places: [
        {
          id: 'p1',
          name: 'Valle de la Luna',
          mapUrl: 'https://maps.app.goo.gl/abc',
          coordinates: { lat: -22.9258, lng: -68.2881 },
          attachments: [],
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      stops: [
        {
          id: 's1',
          placeId: 'p1',
          date: '2026-08-10',
          arrivalTime: '15:30',
          stayDurationMinutes: 180,
          completed: false,
          attachments: [],
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      attachments: [],
      checklist: [],
      updatedAt: '2026-08-01T00:00:00.000Z',
    }

    expect(parseTrip(validTrip)).toEqual({ ok: true, value: validTrip })

    const invalidCoordsTrip = {
      ...validTrip,
      places: [
        {
          ...validTrip.places[0],
          coordinates: { lat: 120, lng: -68.2881 },
        },
      ],
    }
    expect(parseTrip(invalidCoordsTrip).ok).toBe(false)

    const validCatalog = parseTripCatalogState({
      version: 1,
      activeTripId: 'non-existent-id',
      trips: [validTrip],
    })
    expect(validCatalog).toEqual({
      ok: true,
      value: {
        version: 1,
        activeTripId: 'trip-1',
        trips: [validTrip],
      },
    })

    expect(parseTripCatalogState({ version: 2, activeTripId: null, trips: [] }).ok).toBe(false)
    expect(parseTripCatalogState(null).ok).toBe(false)
    expect(
      parseTrip({
        ...validTrip,
        stops: [{ ...validTrip.stops[0], date: '2026-08-20' }],
      }).ok,
    ).toBe(false)
    expect(
      parseTrip({
        ...validTrip,
        stops: [{ ...validTrip.stops[0], placeId: 'missing-place' }],
      }).ok,
    ).toBe(false)
    expect(
      parseTrip({
        ...validTrip,
        stops: [{ ...validTrip.stops[0], arrivalTime: '25:99' }],
      }).ok,
    ).toBe(false)
    expect(
      parseTrip({
        ...validTrip,
        attachments: [{ id: '', label: 'Doc', url: 'https://drive.google.com', updatedAt: '2026-01-01' }],
      }).ok,
    ).toBe(false)
    expect(
      parseTrip({
        ...validTrip,
        checklist: [{ id: 'c1', label: '', completed: false, updatedAt: '2026-01-01' }],
      }).ok,
    ).toBe(false)
  })
})
