import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Nota: la división del código se hace por rutas (React.lazy en AppRoutes). No se usa
// build.rollupOptions.output.manualChunks: con Rolldown (Vite 8) separar las librerías dejaba
// sus funciones auxiliares en otro archivo y la app no arrancaba ("__commonJSMin is not a function").
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Escucha en todas las interfaces de red
    port: 5173,
  },
})
