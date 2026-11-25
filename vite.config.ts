import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// El front solo habla con el BFF y siempre con rutas relativas.
// En desarrollo, el proxy reenvía /graphql y /archivos al BFF local;
// en Kubernetes lo hace el ingress (mismo dominio, sin CORS).
// Ojo: ninguna ruta del front puede empezar con /graphql ni /archivos.
const BFF = 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/graphql': { target: BFF, changeOrigin: true },
      '/archivos': { target: BFF, changeOrigin: true },
    },
  },
})
