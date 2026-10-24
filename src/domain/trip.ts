export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export interface GeoCoordinates {
  readonly lat: number
  readonly lng: number
}

export interface DriveAttachment {
  readonly id: string
  readonly label: string
  readonly url: string
  readonly updatedAt: string
}

export interface ChecklistItem {
  readonly id: string
  readonly label: string
  readonly completed: boolean
  readonly updatedAt: string
}

export interface TripPlace {
  readonly id: string
  readonly name: string
  readonly mapUrl: string
  readonly coordinates: GeoCoordinates
  readonly address?: string
  readonly openingHours?: string
  readonly notes?: string
  readonly attachments: ReadonlyArray<DriveAttachment>
  readonly updatedAt: string
}

export interface TripStop {
  readonly id: string
  readonly placeId: string
  readonly date: string
  readonly arrivalTime: string
  readonly stayDurationMinutes: number
  readonly completed: boolean
  readonly completedAt?: string
  readonly notes?: string
  readonly attachments: ReadonlyArray<DriveAttachment>
  readonly updatedAt: string
}

export interface Trip {
  readonly id: string
  readonly title: string
  readonly startDate: string
  readonly endDate: string
  readonly places: ReadonlyArray<TripPlace>
  readonly stops: ReadonlyArray<TripStop>
  readonly attachments: ReadonlyArray<DriveAttachment>
  readonly checklist: ReadonlyArray<ChecklistItem>
  readonly updatedAt: string
}

export interface TripCatalogState {
  readonly version: 1
  readonly activeTripId: string | null
  readonly trips: ReadonlyArray<Trip>
}

export interface TripDraftInput {
  readonly title: string
  readonly startDate: string
  readonly endDate: string
}

export interface TripDay {
  readonly index: number
  readonly date: string
  readonly label: string
  readonly shortDate: string
}

export interface TripMutationOptions {
  readonly id?: string
  readonly now?: string
  readonly createId?: () => string
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_24H_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/
const MS_PER_DAY = 86_400_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function parseIsoDateToUtcMs(value: string): Result<number> {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) {
    return { ok: false, error: 'Formato de data inválido. Use AAAA-MM-DD.' }
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { ok: false, error: 'Data fora do intervalo válido do calendário.' }
  }

  const utcMs = Date.UTC(year, month - 1, day)
  const reconstructed = new Date(utcMs)

  if (
    reconstructed.getUTCFullYear() !== year ||
    reconstructed.getUTCMonth() + 1 !== month ||
    reconstructed.getUTCDate() !== day
  ) {
    return { ok: false, error: 'Data inexistente no calendário.' }
  }

  return { ok: true, value: utcMs }
}

function formatUtcMsToIsoDate(utcMs: number): string {
  const date = new Date(utcMs)
  const year = String(date.getUTCFullYear()).padStart(4, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatIsoDatePtBr(isoDate: string): string {
  const parts = isoDate.split('-')
  const year = parts[0] ?? '0000'
  const month = parts[1] ?? '01'
  const day = parts[2] ?? '01'
  return `${day}/${month}/${year}`
}

function formatIsoDateShortPtBr(isoDate: string): string {
  return formatIsoDatePtBr(isoDate).slice(0, 5)
}

export function validateTripDraft(input: TripDraftInput): Result<TripDraftInput> {
  const trimmedTitle = input.title.trim()
  if (trimmedTitle.length === 0) {
    return { ok: false, error: 'Informe um título para a viagem.' }
  }

  const startDateResult = parseIsoDateToUtcMs(input.startDate)
  if (!startDateResult.ok) {
    return { ok: false, error: 'A data de início informada é inválida.' }
  }

  const endDateResult = parseIsoDateToUtcMs(input.endDate)
  if (!endDateResult.ok) {
    return { ok: false, error: 'A data de fim informada é inválida.' }
  }

  if (startDateResult.value > endDateResult.value) {
    return {
      ok: false,
      error: 'A data de fim deve ser igual ou posterior à data de início.',
    }
  }

  return {
    ok: true,
    value: {
      title: trimmedTitle,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  }
}

export function createTrip(
  input: TripDraftInput,
  options: TripMutationOptions = {},
): Result<Trip> {
  const validated = validateTripDraft(input)
  if (!validated.ok) {
    return validated
  }

  const id = options.id ?? options.createId?.() ?? crypto.randomUUID()
  const now = options.now ?? new Date().toISOString()

  return {
    ok: true,
    value: {
      id,
      title: validated.value.title,
      startDate: validated.value.startDate,
      endDate: validated.value.endDate,
      places: [],
      stops: [],
      attachments: [],
      checklist: [],
      updatedAt: now,
    },
  }
}

export function updateTrip(
  trip: Trip,
  input: TripDraftInput,
  options: TripMutationOptions = {},
): Result<Trip> {
  const validated = validateTripDraft(input)
  if (!validated.ok) {
    return validated
  }

  const now = options.now ?? new Date().toISOString()

  return {
    ok: true,
    value: {
      ...trip,
      title: validated.value.title,
      startDate: validated.value.startDate,
      endDate: validated.value.endDate,
      updatedAt: now,
    },
  }
}

function cloneAttachments(
  attachments: ReadonlyArray<DriveAttachment>,
  nextId: () => string,
  now: string,
): ReadonlyArray<DriveAttachment> {
  return attachments.map((att) => ({
    id: nextId(),
    label: att.label,
    url: att.url,
    updatedAt: now,
  }))
}

export function duplicateTrip(
  trip: Trip,
  options: TripMutationOptions = {},
): Trip {
  const nextId = (): string => options.createId?.() ?? crypto.randomUUID()
  const newTripId = options.id ?? nextId()
  const now = options.now ?? new Date().toISOString()

  const placeIdMap = new Map<string, string>()

  const copiedPlaces: TripPlace[] = trip.places.map((place) => {
    const newPlaceId = nextId()
    placeIdMap.set(place.id, newPlaceId)
    return {
      id: newPlaceId,
      name: place.name,
      mapUrl: place.mapUrl,
      coordinates: {
        lat: place.coordinates.lat,
        lng: place.coordinates.lng,
      },
      ...(place.address !== undefined ? { address: place.address } : {}),
      ...(place.openingHours !== undefined ? { openingHours: place.openingHours } : {}),
      ...(place.notes !== undefined ? { notes: place.notes } : {}),
      attachments: cloneAttachments(place.attachments, nextId, now),
      updatedAt: now,
    }
  })

  const copiedStops: TripStop[] = trip.stops.map((stop) => ({
    id: nextId(),
    placeId: placeIdMap.get(stop.placeId) ?? stop.placeId,
    date: stop.date,
    arrivalTime: stop.arrivalTime,
    stayDurationMinutes: stop.stayDurationMinutes,
    completed: false,
    ...(stop.notes !== undefined ? { notes: stop.notes } : {}),
    attachments: cloneAttachments(stop.attachments, nextId, now),
    updatedAt: now,
  }))

  const copiedAttachments = cloneAttachments(trip.attachments, nextId, now)

  const copiedChecklist: ChecklistItem[] = trip.checklist.map((item) => ({
    id: nextId(),
    label: item.label,
    completed: false,
    updatedAt: now,
  }))

  return {
    id: newTripId,
    title: `${trip.title} (Cópia)`,
    startDate: trip.startDate,
    endDate: trip.endDate,
    places: copiedPlaces,
    stops: copiedStops,
    attachments: copiedAttachments,
    checklist: copiedChecklist,
    updatedAt: now,
  }
}

export function deriveTripDays(
  trip: Pick<Trip, 'startDate' | 'endDate'>,
): ReadonlyArray<TripDay> {
  const startResult = parseIsoDateToUtcMs(trip.startDate)
  const endResult = parseIsoDateToUtcMs(trip.endDate)

  if (!startResult.ok || !endResult.ok || startResult.value > endResult.value) {
    return []
  }

  const totalDays = Math.floor((endResult.value - startResult.value) / MS_PER_DAY) + 1
  const days: TripDay[] = []

  for (let i = 0; i < totalDays; i += 1) {
    const currentMs = startResult.value + i * MS_PER_DAY
    const isoDate = formatUtcMsToIsoDate(currentMs)
    const index = i + 1
    days.push({
      index,
      date: isoDate,
      label: `Dia ${index}`,
      shortDate: formatIsoDateShortPtBr(isoDate),
    })
  }

  return days
}

function parseGeoCoordinates(raw: unknown): Result<GeoCoordinates> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Coordenadas geográficas inválidas.' }
  }

  const lat = raw['lat']
  const lng = raw['lng']

  if (
    typeof lat !== 'number' ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    typeof lng !== 'number' ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return { ok: false, error: 'Latitude ou longitude fora do intervalo geográfico permitido.' }
  }

  return { ok: true, value: { lat, lng } }
}

function parseDriveAttachment(raw: unknown): Result<DriveAttachment> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Anexo do Drive inválido.' }
  }

  const id = raw['id']
  const label = raw['label']
  const url = raw['url']
  const updatedAt = raw['updatedAt']

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(label) ||
    !isNonEmptyString(url) ||
    !isNonEmptyString(updatedAt)
  ) {
    return { ok: false, error: 'Campos obrigatórios ausentes no anexo do Drive.' }
  }

  return {
    ok: true,
    value: {
      id,
      label,
      url,
      updatedAt,
    },
  }
}

function parseChecklistItem(raw: unknown): Result<ChecklistItem> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Item de checklist inválido.' }
  }

  const id = raw['id']
  const label = raw['label']
  const completed = raw['completed']
  const updatedAt = raw['updatedAt']

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(label) ||
    typeof completed !== 'boolean' ||
    !isNonEmptyString(updatedAt)
  ) {
    return { ok: false, error: 'Campos obrigatórios inválidos no item de checklist.' }
  }

  return {
    ok: true,
    value: {
      id,
      label,
      completed,
      updatedAt,
    },
  }
}

function parseAttachmentsArray(raw: unknown): Result<ReadonlyArray<DriveAttachment>> {
  if (!Array.isArray(raw)) {
    return { ok: false, error: 'Lista de anexos inválida.' }
  }

  const items: DriveAttachment[] = []
  for (const entry of raw) {
    const parsed = parseDriveAttachment(entry)
    if (!parsed.ok) {
      return parsed
    }
    items.push(parsed.value)
  }

  return { ok: true, value: items }
}

function parseTripPlace(raw: unknown): Result<TripPlace> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Local da viagem inválido.' }
  }

  const id = raw['id']
  const name = raw['name']
  const mapUrl = raw['mapUrl']
  const coordinatesRaw = raw['coordinates']
  const address = raw['address']
  const openingHours = raw['openingHours']
  const notes = raw['notes']
  const attachmentsRaw = raw['attachments']
  const updatedAt = raw['updatedAt']

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(mapUrl) ||
    !isNonEmptyString(updatedAt)
  ) {
    return { ok: false, error: 'Campos obrigatórios ausentes no local.' }
  }

  if (address !== undefined && typeof address !== 'string') {
    return { ok: false, error: 'Endereço do local inválido.' }
  }
  if (openingHours !== undefined && typeof openingHours !== 'string') {
    return { ok: false, error: 'Horário de funcionamento do local inválido.' }
  }
  if (notes !== undefined && typeof notes !== 'string') {
    return { ok: false, error: 'Observações do local inválidas.' }
  }

  const coordinatesResult = parseGeoCoordinates(coordinatesRaw)
  if (!coordinatesResult.ok) {
    return coordinatesResult
  }

  const attachmentsResult = parseAttachmentsArray(attachmentsRaw)
  if (!attachmentsResult.ok) {
    return attachmentsResult
  }

  return {
    ok: true,
    value: {
      id,
      name,
      mapUrl,
      coordinates: coordinatesResult.value,
      ...(address !== undefined ? { address } : {}),
      ...(openingHours !== undefined ? { openingHours } : {}),
      ...(notes !== undefined ? { notes } : {}),
      attachments: attachmentsResult.value,
      updatedAt,
    },
  }
}

function parseTripStop(raw: unknown): Result<TripStop> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Parada do roteiro inválida.' }
  }

  const id = raw['id']
  const placeId = raw['placeId']
  const date = raw['date']
  const arrivalTime = raw['arrivalTime']
  const stayDurationMinutes = raw['stayDurationMinutes']
  const completed = raw['completed']
  const completedAt = raw['completedAt']
  const notes = raw['notes']
  const attachmentsRaw = raw['attachments']
  const updatedAt = raw['updatedAt']

  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(placeId) ||
    typeof date !== 'string' ||
    typeof arrivalTime !== 'string' ||
    typeof stayDurationMinutes !== 'number' ||
    !Number.isInteger(stayDurationMinutes) ||
    stayDurationMinutes < 1 ||
    typeof completed !== 'boolean' ||
    !isNonEmptyString(updatedAt)
  ) {
    return { ok: false, error: 'Campos obrigatórios inválidos na parada.' }
  }

  const dateResult = parseIsoDateToUtcMs(date)
  if (!dateResult.ok) {
    return dateResult
  }

  if (!TIME_24H_PATTERN.test(arrivalTime)) {
    return { ok: false, error: 'Horário de chegada da parada inválido.' }
  }

  if (completedAt !== undefined && (!completed || typeof completedAt !== 'string')) {
    return { ok: false, error: 'Data de conclusão da parada inválida.' }
  }

  if (notes !== undefined && typeof notes !== 'string') {
    return { ok: false, error: 'Observações da parada inválidas.' }
  }

  const attachmentsResult = parseAttachmentsArray(attachmentsRaw)
  if (!attachmentsResult.ok) {
    return attachmentsResult
  }

  return {
    ok: true,
    value: {
      id,
      placeId,
      date,
      arrivalTime,
      stayDurationMinutes,
      completed,
      ...(completedAt !== undefined ? { completedAt } : {}),
      ...(notes !== undefined ? { notes } : {}),
      attachments: attachmentsResult.value,
      updatedAt,
    },
  }
}

export function parseTrip(raw: unknown): Result<Trip> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Estrutura de viagem inválida.' }
  }

  const id = raw['id']
  const title = raw['title']
  const startDate = raw['startDate']
  const endDate = raw['endDate']
  const placesRaw = raw['places']
  const stopsRaw = raw['stops']
  const attachmentsRaw = raw['attachments']
  const checklistRaw = raw['checklist']
  const updatedAt = raw['updatedAt']

  if (
    !isNonEmptyString(id) ||
    typeof title !== 'string' ||
    typeof startDate !== 'string' ||
    typeof endDate !== 'string' ||
    !Array.isArray(placesRaw) ||
    !Array.isArray(stopsRaw) ||
    !Array.isArray(checklistRaw) ||
    !isNonEmptyString(updatedAt)
  ) {
    return { ok: false, error: 'Campos obrigatórios da viagem estão ausentes ou inválidos.' }
  }

  const draftValidation = validateTripDraft({ title, startDate, endDate })
  if (!draftValidation.ok) {
    return draftValidation
  }

  const places: TripPlace[] = []
  const placeIds = new Set<string>()
  for (const entry of placesRaw) {
    const parsedPlace = parseTripPlace(entry)
    if (!parsedPlace.ok) {
      return parsedPlace
    }
    places.push(parsedPlace.value)
    placeIds.add(parsedPlace.value.id)
  }

  const stops: TripStop[] = []
  for (const entry of stopsRaw) {
    const parsedStop = parseTripStop(entry)
    if (!parsedStop.ok) {
      return parsedStop
    }
    if (
      parsedStop.value.date < draftValidation.value.startDate ||
      parsedStop.value.date > draftValidation.value.endDate
    ) {
      return {
        ok: false,
        error: 'A data da parada está fora do período da viagem.',
      }
    }
    if (!placeIds.has(parsedStop.value.placeId)) {
      return {
        ok: false,
        error: 'A parada referencia um local inexistente na viagem.',
      }
    }
    stops.push(parsedStop.value)
  }

  const attachmentsResult = parseAttachmentsArray(attachmentsRaw)
  if (!attachmentsResult.ok) {
    return attachmentsResult
  }

  const checklist: ChecklistItem[] = []
  for (const entry of checklistRaw) {
    const parsedItem = parseChecklistItem(entry)
    if (!parsedItem.ok) {
      return parsedItem
    }
    checklist.push(parsedItem.value)
  }

  return {
    ok: true,
    value: {
      id,
      title: draftValidation.value.title,
      startDate: draftValidation.value.startDate,
      endDate: draftValidation.value.endDate,
      places,
      stops,
      attachments: attachmentsResult.value,
      checklist,
      updatedAt,
    },
  }
}

export function parseTripCatalogState(raw: unknown): Result<TripCatalogState> {
  if (!isRecord(raw)) {
    return { ok: false, error: 'Estado persistido inválido.' }
  }

  const version = raw['version']
  const activeTripIdRaw = raw['activeTripId']
  const tripsRaw = raw['trips']

  if (version !== 1) {
    return { ok: false, error: 'Versão de schema incompatível.' }
  }

  if (activeTripIdRaw !== null && typeof activeTripIdRaw !== 'string') {
    return { ok: false, error: 'Identificador de viagem ativa inválido.' }
  }

  if (!Array.isArray(tripsRaw)) {
    return { ok: false, error: 'Coleção de viagens inválida.' }
  }

  const trips: Trip[] = []
  for (const entry of tripsRaw) {
    const parsedTrip = parseTrip(entry)
    if (!parsedTrip.ok) {
      return parsedTrip
    }
    trips.push(parsedTrip.value)
  }

  const hasActiveTrip =
    activeTripIdRaw !== null && trips.some((trip) => trip.id === activeTripIdRaw)
  const resolvedActiveTripId = hasActiveTrip
    ? activeTripIdRaw
    : (trips[0]?.id ?? null)

  return {
    ok: true,
    value: {
      version: 1,
      activeTripId: resolvedActiveTripId,
      trips,
    },
  }
}
