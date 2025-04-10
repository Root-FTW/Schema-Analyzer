import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // React 17 no necesita importar React en cada archivo
    jsxRuntime: 'classic',
  })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Asegurarse de que Vite no falle en errores de TypeScript durante la compilación
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  // Resolver problemas con módulos CommonJS
  optimizeDeps: {
    include: ['react-json-view', 'react-syntax-highlighter']
  }
})
