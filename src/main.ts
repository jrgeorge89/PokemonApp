import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

/**
 * Configuración principal de la aplicación Vue 3
 * - Vue 3 con Composition API
 * - Pinia para state management
 * - Vue Router para navegación
 * - Manejo de errores global
 */

// Crear instancia de la aplicación
const app = createApp(App)

// Configurar Pinia para state management
const pinia = createPinia()
app.use(pinia)

// Configurar Vue Router
app.use(router)

// Configurar manejo de errores global
app.config.errorHandler = (error: unknown, instance, info) => {
  console.error('🚨 Error de Vue:', error)
  console.error('📍 Componente:', instance)
  console.error('ℹ️ Info:', info)
  
  // En producción, aquí se podría enviar a un servicio de monitoreo
  if (import.meta.env.PROD) {
    // TODO: Integrar con servicio de monitoreo (Sentry, LogRocket, etc.)
  }
}

// Manejo de errores JavaScript globales
window.onerror = (message, source, lineno, colno, error) => {
  console.error('🚨 Error JavaScript global:', {
    message,
    source,
    line: lineno,
    column: colno,
    error
  })
  
  // En producción, enviar a servicio de monitoreo
  if (import.meta.env.PROD) {
    // TODO: Integrar con servicio de monitoreo
  }
  
  return false // No suprimir el comportamiento por defecto del browser
}

// Manejo de promesas rechazadas no capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Promise rechazada no capturada:', event.reason)
  
  // En producción, enviar a servicio de monitoreo
  if (import.meta.env.PROD) {
    // TODO: Integrar con servicio de monitoreo
  }
  
  // Prevenir que se muestre en la consola del browser (opcional)
  // event.preventDefault()
})

// Información de desarrollo
if (import.meta.env.DEV) {
  console.log('🚀 Pokédex App iniciada en modo desarrollo')
  console.log('📦 Vue version:', app.version)
  console.log('🎯 Base URL:', import.meta.env.BASE_URL)
}

// Montar la aplicación en el DOM
app.mount('#app')
