import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Pruebas unitarias (ISO/IEC 25010 — mantenibilidad: capacidad de ser probado)
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
