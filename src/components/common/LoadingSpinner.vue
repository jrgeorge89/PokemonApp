<template>
  <div 
    class="loading-spinner-container flex flex-col items-center justify-center"
    :class="containerClasses"
  >
    <!-- Spinner animado -->
    <div 
      class="loading-spinner"
      :class="spinnerClasses"
      :aria-label="ariaLabel"
      role="status"
    >
      <svg 
        class="spinner-svg animate-spin"
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          class="spinner-track" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        ></circle>
        <path 
          class="spinner-fill" 
          fill="currentColor" 
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    
    <!-- Mensaje opcional -->
    <p 
      v-if="message" 
      class="loading-message mt-3 text-center text-gray-600 dark:text-gray-400 font-medium"
      :class="messageClasses"
    >
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large' | 'extra-large'
  message?: string
  centered?: boolean
  fullHeight?: boolean
  color?: 'primary' | 'secondary' | 'white' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  message: 'Cargando...',
  centered: true,
  fullHeight: false,
  color: 'primary'
})

// Computed
const containerClasses = computed(() => {
  const classes = []
  
  if (props.centered) {
    classes.push('w-full')
  }
  
  if (props.fullHeight) {
    classes.push('min-h-screen')
  } else {
    classes.push('py-8')
  }
  
  return classes.join(' ')
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    'small': 'w-6 h-6',
    'medium': 'w-8 h-8', 
    'large': 'w-12 h-12',
    'extra-large': 'w-16 h-16'
  }
  
  const colorClasses = {
    'primary': 'text-blue-500',
    'secondary': 'text-gray-500 dark:text-gray-400',
    'white': 'text-white',
    'gray': 'text-gray-600'
  }
  
  return `${sizeClasses[props.size]} ${colorClasses[props.color]}`
})

const messageClasses = computed(() => {
  const sizeClasses = {
    'small': 'text-sm',
    'medium': 'text-base',
    'large': 'text-lg', 
    'extra-large': 'text-xl'
  }
  
  return sizeClasses[props.size]
})

const ariaLabel = computed(() => {
  return props.message || 'Cargando contenido'
})
</script>

<style scoped>
/* Spinner track (círculo de fondo) */
.spinner-track {
  opacity: 0.25;
}

/* Spinner fill (parte que se anima) */
.spinner-fill {
  opacity: 0.75;
}

/* Animación personalizada más suave */
.spinner-svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Estados de hover para interactividad visual */
.loading-spinner-container:hover .spinner-svg {
  animation-duration: 0.8s;
}

/* Dark mode adjustments */
.dark .spinner-track {
  opacity: 0.2;
}

.dark .spinner-fill {
  opacity: 0.8;
}

/* Reduce motion para accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .spinner-svg {
    animation: none;
  }
  
  /* Mostrar spinner estático */
  .spinner-svg {
    opacity: 0.7;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .spinner-track {
    opacity: 0.4;
  }
  
  .spinner-fill {
    opacity: 1;
  }
}

/* Loading message animation */
.loading-message {
  animation: fadeInUp 0.5s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .loading-message {
    font-size: 0.875rem;
  }
}
</style>