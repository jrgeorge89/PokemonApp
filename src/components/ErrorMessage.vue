<template>
  <div 
    :class="containerClasses"
    class="rounded-lg p-6 text-center"
  >
    <!-- Icono de error -->
    <div class="mb-4">
      <svg 
        :class="iconClasses"
        class="mx-auto"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          v-if="variant === 'error'"
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" 
        />
        <path 
          v-else-if="variant === 'warning'"
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
        <path 
          v-else
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
    </div>

    <!-- Título del error -->
    <h3 
      :class="titleClasses"
      class="text-lg font-semibold mb-2"
    >
      {{ title || defaultTitle }}
    </h3>

    <!-- Mensaje del error -->
    <p 
      :class="messageClasses"
      class="mb-4"
    >
      {{ message || 'Ha ocurrido un error inesperado.' }}
    </p>

    <!-- Detalles técnicos (opcional) -->
    <details v-if="details" class="mb-4 text-left">
      <summary class="cursor-pointer text-sm font-medium mb-2 hover:underline">
        Ver detalles técnicos
      </summary>
      <div class="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto">
        <pre>{{ details }}</pre>
      </div>
    </details>

    <!-- Acciones -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <!-- Botón de retry -->
      <button
        v-if="showRetry"
        @click="handleRetry"
        :disabled="retrying"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
      >
        <svg 
          v-if="retrying"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ retrying ? 'Reintentando...' : 'Reintentar' }}
      </button>

      <!-- Botón de home -->
      <button
        v-if="showHome"
        @click="goHome"
        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
      >
        Ir al inicio
      </button>

      <!-- Botón personalizado -->
      <button
        v-if="customAction"
        @click="handleCustomAction"
        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        {{ customAction.label }}
      </button>
    </div>

    <!-- Info adicional -->
    <p 
      v-if="additionalInfo"
      class="mt-4 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ additionalInfo }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Types
interface CustomAction {
  label: string
  handler: () => void
}

// Props
interface Props {
  variant?: 'error' | 'warning' | 'info'
  title?: string
  message?: string
  details?: string
  showRetry?: boolean
  showHome?: boolean
  customAction?: CustomAction
  additionalInfo?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'error',
  showRetry: false,
  showHome: true
})

// Emits
const emit = defineEmits<{
  retry: []
}>()

// Router
const router = useRouter()

// State
const retrying = ref(false)

// Computed
const defaultTitle = computed(() => {
  const titles = {
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información'
  }
  return titles[props.variant]
})

const containerClasses = computed(() => {
  const variants = {
    error: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
  }
  return variants[props.variant]
})

const iconClasses = computed(() => {
  const variants = {
    error: 'w-12 h-12 text-red-400',
    warning: 'w-12 h-12 text-yellow-400',
    info: 'w-12 h-12 text-blue-400'
  }
  return variants[props.variant]
})

const titleClasses = computed(() => {
  const variants = {
    error: 'text-red-800 dark:text-red-300',
    warning: 'text-yellow-800 dark:text-yellow-300',
    info: 'text-blue-800 dark:text-blue-300'
  }
  return variants[props.variant]
})

const messageClasses = computed(() => {
  const variants = {
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    info: 'text-blue-700 dark:text-blue-300'
  }
  return variants[props.variant]
})

// Methods
const handleRetry = async () => {
  retrying.value = true
  try {
    emit('retry')
    // Esperar un momento para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 500))
  } finally {
    retrying.value = false
  }
}

const goHome = () => {
  router.push('/')
}

const handleCustomAction = () => {
  if (props.customAction) {
    props.customAction.handler()
  }
}
</script>