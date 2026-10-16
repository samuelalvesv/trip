import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import ExploreIcon from '@mui/icons-material/Explore'

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1.5 }}>
            <FlightTakeoffIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'text.primary' }}>
              Trip
            </Typography>
            <Button color="inherit">Destinos</Button>
            <Button color="inherit">Roteiros</Button>
            <Button variant="contained" color="primary">
              Nova Viagem
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="md">
          <Card variant="outlined" sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
            <CardContent>
              <Stack spacing={3} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ExploreIcon sx={{ fontSize: 36 }} />
                </Box>

                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                  Planeje e gerencie suas viagens com simplicidade
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                  Fundação do Material UI configurada com sucesso. O tema, tipografia, reset global e componentes base
                  estão ativos e prontos para a prototipagem dos fluxos da aplicação.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                  <Button variant="contained" color="primary" size="large" startIcon={<FlightTakeoffIcon />}>
                    Começar Protótipo
                  </Button>
                  <Button variant="outlined" color="primary" size="large">
                    Definir Requisitos
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  )
}
