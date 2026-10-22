import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui'
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor'
            }
          }
          return undefined
        },
      },
    },
  },
})
