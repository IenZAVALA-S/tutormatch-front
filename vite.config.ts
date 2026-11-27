/// <reference types="vitest/config" />
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
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    // Hilos y módulos compartidos entre archivos: mucho más rápido. El estado
    // global (sesión, localStorage) se limpia después de cada test en setup.ts.
    // Un solo hilo reutilizado: en máquinas lentas, arrancar varios a la vez
    // agota el tiempo de espera, y así igual tarda unos 20 s.
    pool: 'threads',
    maxWorkers: 1,
    isolate: false,
    testTimeout: 20_000,
    // Los tests fijan la zona horaria del proceso para no depender de la máquina;
    // las conversiones de bloques usan America/Santiago igual.
    env: { TZ: 'UTC' },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/gql/**', // generado por codegen
        'src/main.tsx', // solo monta la app
        'src/vite-env.d.ts',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
      ],
      // Requisito de la entrega: al menos 60 %. Si baja, `npm run test:cobertura` falla.
      thresholds: { lines: 60, statements: 60, functions: 60 },
    },
  },
})
