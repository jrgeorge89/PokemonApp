<template>
  <div 
    class="error-message-container bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6"
    role="alert"
    aria-live="polite"
  >
    <div class="flex items-start">
      <!-- Icono de error -->
      <div class="shrink-0 mr-4">
        <svg 
          class="error-icon w-6 h-6 text-red-500 dark:text-red-400"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      
      <div class="flex-1 min-w-0">
        <!-- Título del error -->
        <h3 class="error-title text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          {{ errorTitle }}
        </h3>
        
        <!-- Mensaje principal -->
        <p class="error-message text-red-700 dark:text-red-300 leading-relaxed">
          {{ message }}
        </p>
        
        <!-- Detalles adicionales (si existen) -->
        <div 
          v-if="details" 
          class="error-details mt-3 p-3 bg-red-100 dark:bg-red-900 rounded-md"
        >
          <p class="text-sm text-red-600 dark:text-red-400 font-mono">
            {{ details }}
          </p>
        </div>
        
        <!-- Botón reintentar -->
        <div 
          v-if="retryable" 
          class="error-actions mt-4"
        >
          <button
            @click="handleRetry"
            class="retry-button inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-red-950 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
            :aria-label="retryAriaLabel"
          >
            <svg 
              class="retry-icon w-4 h-4 mr-2"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ retryText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  message: string
  retryable?: boolean
  title?: string
  details?: string
  retryText?: string
  severity?: 'error' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  retryable: false,
  title: 'Error',
  retryText: 'Reintentar',
  severity: 'error'
})

// Emits
const emit = defineEmits<{
  retry: []
}>()

// Computed
const errorTitle = computed(() => {
  return props.title || (props.severity === 'warning' ? 'Advertencia' : 'Error')
})

const retryAriaLabel = computed(() => {
  return `${props.retryText}. ${props.message}`
})

// Methods
const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
/* Animación de entrada */
.error-message-container {
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efectos del botón retry */
.retry-button:hover .retry-icon {
  animation: rotateClockwise 0.5s ease-in-out;
}

.retry-button:active {
  transform: scale(0.98);
}

@keyframes rotateClockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

/* Estados de focus mejorados */
.retry-button:focus-visible {
  outline: 2px solid rgb(239, 68, 68);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-message-container {
    padding: 1rem;
  }
  
  .error-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .error-title {
    font-size: 1rem;
  }
  
  .error-message {
    font-size: 0.875rem;
  }
  
  .retry-button {
    width: 100%;
    justify-content: center;
    margin-top: 0.75rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .error-message-container {
    border-width: 2px;
  }
  
  .retry-button {
    border: 2px solid transparent;
  }
  
  .retry-button:focus {
    border-color: white;
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .error-message-container {
    animation: none;
  }
  
  .retry-button:hover .retry-icon {
    animation: none;
  }
  
  .retry-button:active {
    transform: none;
  }
}

/* Variante warning (por si se necesita en el futuro) */
.error-message-container.warning {
  background-color: rgb(254, 252, 232); /* yellow-50 */
  border-color: rgb(254, 240, 138); /* yellow-200 */
}

.dark .error-message-container.warning {
  background-color: rgb(69, 26, 3); /* amber-950 */
  border-color: rgb(146, 64, 14); /* amber-800 */
}

/* Pulse effect para llamar la atención */
.error-message-container {
  animation: slideInDown 0.3s ease-out, pulse 2s ease-in-out 0.3s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

/* Mejoras para screen readers */
.error-message-container[role="alert"] {
  position: relative;
}

/* Dark mode specific enhancements */
.dark .retry-button:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.dark .error-details {
  border: 1px solid rgb(153, 27, 27); /* red-800 */
}
</style>