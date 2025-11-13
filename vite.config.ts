import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // Configuración de resolución de rutas
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // Configuración de Vitest
  test: {
    // Configurar jsdom como entorno de testing
    environment: 'jsdom',
    
    // Habilitar variables globales de testing
    globals: true,
    
    // Archivo de configuración inicial para tests
    setupFiles: ['src/test/setup.ts'],
    
    // Incluir archivos de test
    include: [
      'src/**/__tests__/**/*.{js,ts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    
    // Excluir archivos
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache'
    ],
    
    // Configuración de coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/main.ts'
      ]
    }
  },
})
