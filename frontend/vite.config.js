import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Em desenvolvimento, chamadas para /api vão para a API (porta 3333)
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
})