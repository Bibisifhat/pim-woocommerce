import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],            // keep whatever plugin line you already have
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/mock-woo': 'http://localhost:5000',
    },
  },
})
