import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0369a1',
          dark: '#075985',
          light: '#0284c7',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#ea580c',
          contrastText: '#ffffff',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
        text: {
          primary: '#0f172a',
          secondary: '#334155',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#38bdf8',
          dark: '#0284c7',
          light: '#7dd3fc',
          contrastText: '#000000',
        },
        secondary: {
          main: '#fb923c',
          contrastText: '#000000',
        },
        background: {
          default: '#000000',
          paper: '#0a0f18',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
        },
      },
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
})
