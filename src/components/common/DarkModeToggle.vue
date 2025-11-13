<template>
  <div class="dark-mode-toggle-container">
    <button
      @click="handleToggle"
      class="dark-mode-toggle relative inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 hover:scale-105 active:scale-95"
      :class="buttonClasses"
      :aria-label="toggleAriaLabel"
      :title="tooltipText"
      type="button"
    >
      <!-- Fondo del botón con gradiente -->
      <div 
        class="absolute inset-0 rounded-full transition-all duration-300"
        :class="backgroundClasses"
      ></div>
      
      <!-- Iconos con transición -->
      <div class="relative z-10 flex items-center justify-center">
        <!-- Icono Sol (modo claro) -->
        <Transition
          name="icon-fade"
          mode="out-in"
        >
          <svg
            v-if="!uiStore.isDarkMode"
            key="sun"
            class="icon sun-icon w-6 h-6 text-yellow-500 transition-all duration-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
            />
          </svg>
          
          <!-- Icono Luna (modo oscuro) -->
          <svg
            v-else
            key="moon"
            class="icon moon-icon w-6 h-6 text-blue-300 transition-all duration-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clip-rule="evenodd"
            />
          </svg>
        </Transition>
      </div>
      
      <!-- Efecto de ondas al hacer clic -->
      <div 
        v-if="showRipple"
        class="absolute inset-0 rounded-full bg-white dark:bg-gray-700 opacity-30 animate-ping"
      ></div>
    </button>
    
    <!-- Tooltip personalizado (opcional) -->
    <div
      v-if="showTooltip && tooltipVisible"
      class="tooltip absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded shadow-lg z-20 whitespace-nowrap"
      role="tooltip"
    >
      {{ tooltipText }}
      <div class="tooltip-arrow absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-100"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStore } from '../../stores/ui.store'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'minimal' | 'colorful'
  showTooltip?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  showTooltip: true
})

// Store
const uiStore = useUiStore()

// State
const showRipple = ref(false)
const tooltipVisible = ref(false)

// Computed
const buttonClasses = computed(() => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  }
  
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-md hover:shadow-lg',
    minimal: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    colorful: 'bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-600 dark:to-purple-700 shadow-lg hover:shadow-xl'
  }
  
  return `${sizeClasses[props.size]} ${variantClasses[props.variant]}`
})

const backgroundClasses = computed(() => {
  if (props.variant === 'colorful') {
    return uiStore.isDarkMode 
      ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
      : 'bg-gradient-to-br from-yellow-400 to-orange-500'
  }
  return ''
})

const toggleAriaLabel = computed(() => {
  return uiStore.isDarkMode 
    ? 'Cambiar a modo claro' 
    : 'Cambiar a modo oscuro'
})

const tooltipText = computed(() => {
  return uiStore.isDarkMode 
    ? 'Modo claro' 
    : 'Modo oscuro'
})

// Methods
const handleToggle = () => {
  // Efecto visual de ondas
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, 300)
  
  // Toggle del dark mode
  uiStore.toggleDarkMode()
}

</script>

<style scoped>
/* Contenedor relativo para tooltip */
.dark-mode-toggle-container {
  position: relative;
  display: inline-block;
}

/* Animaciones de transición para iconos */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

/* Animación de rotación para los iconos */
.sun-icon {
  animation: sunRotate 20s linear infinite;
}

.moon-icon {
  animation: moonGlow 3s ease-in-out infinite alternate;
}

@keyframes sunRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes moonGlow {
  from {
    filter: drop-shadow(0 0 5px rgba(147, 197, 253, 0.5));
  }
  to {
    filter: drop-shadow(0 0 10px rgba(147, 197, 253, 0.8));
  }
}

/* Efectos hover */
.dark-mode-toggle:hover .sun-icon {
  animation-duration: 2s;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
}

.dark-mode-toggle:hover .moon-icon {
  filter: drop-shadow(0 0 12px rgba(147, 197, 253, 1));
}

/* Estados de focus mejorados */
.dark-mode-toggle:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
}

/* Tooltip styling */
.tooltip {
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .dark-mode-toggle-container .tooltip {
    font-size: 0.625rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .dark-mode-toggle {
    border: 2px solid currentColor;
  }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  .icon-fade-enter-active,
  .icon-fade-leave-active,
  .dark-mode-toggle,
  .icon {
    transition: none;
    animation: none;
  }
  
  .tooltip {
    animation: none;
  }
}

/* Pulse effect durante la transición */
.dark-mode-toggle:active {
  animation: buttonPulse 0.3s ease-out;
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

/* Efectos especiales para variant colorful */
.dark-mode-toggle.colorful {
  position: relative;
  overflow: hidden;
}

.dark-mode-toggle.colorful::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(251, 191, 36, 0.6),
    rgba(245, 101, 101, 0.6),
    rgba(139, 92, 246, 0.6),
    rgba(59, 130, 246, 0.6)
  );
  border-radius: inherit;
  z-index: -1;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}
</style>