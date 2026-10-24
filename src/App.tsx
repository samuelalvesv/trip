import { type SyntheticEvent, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import ExploreIcon from '@mui/icons-material/Explore'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import { ThemeProvider, useColorScheme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import {
  createTrip,
  deriveTripDays,
  duplicateTrip,
  formatIsoDatePtBr,
  type TripCatalogState,
  type TripDraftInput,
  updateTrip,
} from './domain/trip'
import { loadTripCatalogState, saveTripCatalogState } from './storage/tripStorage'
import { theme } from './theme/theme'

type DialogMode = 'closed' | 'create' | 'edit'

function getDefaultTodayIso(): string {
  const now = new Date()
  const year = String(now.getFullYear()).padStart(4, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createInitialDraft(): TripDraftInput {
  const today = getDefaultTodayIso()
  return {
    title: '',
    startDate: today,
    endDate: today,
  }
}

function TripWorkspace() {
  const { mode, systemMode, setMode } = useColorScheme()
  const resolvedMode = (mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light'

  const [catalog, setCatalog] = useState<TripCatalogState>(() => loadTripCatalogState())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode>('closed')
  const [draft, setDraft] = useState<TripDraftInput>(() => createInitialDraft())
  const [validationError, setValidationError] = useState<string | null>(null)
  const [undoSnapshot, setUndoSnapshot] = useState<TripCatalogState | null>(null)

  const activeTrip =
    catalog.trips.find((trip) => trip.id === catalog.activeTripId) ??
    catalog.trips[0] ??
    null

  const tripDays = activeTrip ? deriveTripDays(activeTrip) : []
  const activeDay =
    tripDays.find((day) => day.date === selectedDate) ?? tripDays[0] ?? null

  const commitCatalog = (nextState: TripCatalogState): void => {
    setCatalog(nextState)
    saveTripCatalogState(nextState)
  }

  const handleToggleTheme = (): void => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark')
  }

  const handleOpenCreateDialog = (): void => {
    setDraft(createInitialDraft())
    setValidationError(null)
    setDialogMode('create')
  }

  const handleOpenEditDialog = (): void => {
    if (!activeTrip) return
    setDraft({
      title: activeTrip.title,
      startDate: activeTrip.startDate,
      endDate: activeTrip.endDate,
    })
    setValidationError(null)
    setDialogMode('edit')
  }

  const handleCloseDialog = (): void => {
    setDialogMode('closed')
    setValidationError(null)
  }

  const handleSubmitDialog = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()

    if (dialogMode === 'create') {
      const created = createTrip(draft)

      if (!created.ok) {
        setValidationError(created.error)
        return
      }

      const nextState: TripCatalogState = {
        version: 1,
        activeTripId: created.value.id,
        trips: [...catalog.trips, created.value],
      }
      commitCatalog(nextState)
      setSelectedDate(created.value.startDate)
      handleCloseDialog()
      return
    }

    if (dialogMode === 'edit' && activeTrip) {
      const updated = updateTrip(activeTrip, draft)

      if (!updated.ok) {
        setValidationError(updated.error)
        return
      }

      const nextState: TripCatalogState = {
        version: 1,
        activeTripId: updated.value.id,
        trips: catalog.trips.map((trip) =>
          trip.id === updated.value.id ? updated.value : trip,
        ),
      }
      commitCatalog(nextState)
      handleCloseDialog()
    }
  }

  const handleSelectTrip = (tripId: string): void => {
    const targetTrip = catalog.trips.find((trip) => trip.id === tripId)
    if (!targetTrip) return

    commitCatalog({
      ...catalog,
      activeTripId: targetTrip.id,
    })
    setSelectedDate(targetTrip.startDate)
  }

  const handleDuplicateActiveTrip = (): void => {
    if (!activeTrip) return

    const duplicated = duplicateTrip(activeTrip)
    const nextState: TripCatalogState = {
      version: 1,
      activeTripId: duplicated.id,
      trips: [...catalog.trips, duplicated],
    }
    commitCatalog(nextState)
    setSelectedDate(duplicated.startDate)
  }

  const handleDeleteActiveTrip = (): void => {
    if (!activeTrip) return

    setUndoSnapshot(catalog)
    const remainingTrips = catalog.trips.filter((trip) => trip.id !== activeTrip.id)
    const nextActiveId = remainingTrips[0]?.id ?? null

    commitCatalog({
      version: 1,
      activeTripId: nextActiveId,
      trips: remainingTrips,
    })
    setSelectedDate(remainingTrips[0]?.startDate ?? null)
  }

  const handleUndoDelete = (): void => {
    if (!undoSnapshot) return
    commitCatalog(undoSnapshot)
    setUndoSnapshot(null)
  }

  const handleDismissUndo = (): void => {
    setUndoSnapshot(null)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1.5, flexWrap: 'wrap', py: 1 }}>
            <FlightTakeoffIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary' }}
            >
              Trip
            </Typography>

            <Button
              type="button"
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleToggleTheme}
              aria-label="Alternar tema entre Claro Solar e Escuro OLED"
              startIcon={
                resolvedMode === 'dark' ? <DarkModeIcon /> : <WbSunnyIcon />
              }
            >
              {resolvedMode === 'dark' ? 'Escuro OLED' : 'Claro Solar'}
            </Button>

            <Button
              type="button"
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Nova viagem
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, sm: 4 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            {catalog.trips.length > 0 ? (
              <Stack
                component="nav"
                direction="row"
                spacing={1}
                sx={{ overflowX: 'auto', pb: 0.5, alignItems: 'center' }}
                aria-label="Viagens cadastradas"
              >
                {catalog.trips.map((trip) => {
                  const isSelected = activeTrip?.id === trip.id
                  return (
                    <Button
                      key={trip.id}
                      type="button"
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isSelected ? 'primary' : 'inherit'}
                      size="small"
                      aria-label={`Selecionar viagem ${trip.title}`}
                      onClick={() => handleSelectTrip(trip.id)}
                      sx={{ flexShrink: 0 }}
                    >
                      {trip.title}
                    </Button>
                  )
                })}
              </Stack>
            ) : null}

            {activeTrip ? (
              <Stack spacing={2.5}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                          {activeTrip.title}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <CalendarMonthIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatIsoDatePtBr(activeTrip.startDate)} a{' '}
                            {formatIsoDatePtBr(activeTrip.endDate)} • {tripDays.length}{' '}
                            {tripDays.length === 1 ? 'dia' : 'dias'}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={handleOpenEditDialog}
                        >
                          Editar viagem
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={handleDuplicateActiveTrip}
                        >
                          Duplicar viagem
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteOutlinedIcon />}
                          onClick={handleDeleteActiveTrip}
                        >
                          Excluir viagem
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <Tabs
                    value={activeDay?.date ?? false}
                    onChange={(_event, nextDate: string) => setSelectedDate(nextDate)}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="Dias da viagem"
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
                  >
                    {tripDays.map((day) => (
                      <Tab
                        key={day.date}
                        value={day.date}
                        label={`${day.label} (${day.shortDate})`}
                      />
                    ))}
                  </Tabs>

                  {activeDay ? (
                    <CardContent>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                        }}
                      >
                        <Box>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                            {activeDay.label} — {formatIsoDatePtBr(activeDay.date)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Programação isolada do dia pronta para paradas e locais.
                          </Typography>
                        </Box>
                        <Chip
                          color="primary"
                          variant="outlined"
                          label={`${activeTrip.stops.filter((stop) => stop.date === activeDay.date).length} paradas`}
                        />
                      </Stack>
                    </CardContent>
                  ) : null}
                </Card>
              </Stack>
            ) : (
              <Card variant="outlined" sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
                <CardContent>
                  <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ExploreIcon sx={{ fontSize: 34 }} />
                    </Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                      Planeje e conduza sua próxima viagem
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ maxWidth: 540 }}
                    >
                      Crie sua primeira viagem informando título, data de início e data de
                      fim para gerar automaticamente os dias do seu roteiro 100% offline.
                    </Typography>
                    <Button
                      type="button"
                      variant="contained"
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreateDialog}
                    >
                      Criar primeira viagem
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Container>
      </Box>

      {dialogMode !== 'closed' ? (
        <Dialog
          open
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="xs"
        >
          <Box component="form" onSubmit={handleSubmitDialog} noValidate>
            <DialogTitle>
              {dialogMode === 'edit' ? 'Editar viagem' : 'Nova viagem'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {validationError ? (
                  <Alert severity="error">{validationError}</Alert>
                ) : null}

                <TextField
                  label="Título da viagem"
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                  fullWidth
                  required
                />

                <TextField
                  label="Data de início"
                  type="date"
                  value={draft.startDate}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, startDate: event.target.value }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  required
                />

                <TextField
                  label="Data de fim"
                  type="date"
                  value={draft.endDate}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, endDate: event.target.value }))
                  }
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                  required
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button type="button" color="inherit" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {dialogMode === 'edit' ? 'Salvar alterações' : 'Criar viagem'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      ) : null}

      <Snackbar
        open={undoSnapshot !== null}
        autoHideDuration={6000}
        onClose={handleDismissUndo}
        message="Viagem excluída."
        action={
          <Button
            type="button"
            color="secondary"
            size="small"
            onClick={handleUndoDelete}
          >
            Desfazer
          </Button>
        }
      />
    </Box>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <TripWorkspace />
    </ThemeProvider>
  )
}
