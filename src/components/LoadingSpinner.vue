<template>
  <div 
    :class="containerClasses"
    class="flex items-center justify-center"
  >
    <div class="text-center">
      <!-- Spinner -->
      <div 
        :class="spinnerClasses"
        class="animate-spin rounded-full border-solid border-t-transparent mx-auto"
      ></div>
      
      <!-- Mensaje de carga -->
      <p 
        v-if="message"
        :class="textClasses"
        class="mt-4 font-medium"
      >
        {{ message }}
      </p>
      
      <!-- Submensaje opcional -->
      <p 
        v-if="subMessage"
        class="mt-2 text-sm text-gray-500 dark:text-gray-400"
      >
        {{ subMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'white'
  message?: string
  subMessage?: string
  fullScreen?: boolean
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'primary',
  fullScreen: false,
  overlay: false
})

// Computed
const containerClasses = computed(() => {
  const classes = []
  
  if (props.fullScreen) {
    classes.push('min-h-screen')
  } else if (props.overlay) {
    classes.push('absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50')
  } else {
    classes.push('py-8')
  }
  
  return classes.join(' ')
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  }
  
  const variantClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500 dark:border-gray-400',
    white: 'border-white'
  }
  
  return `${sizeClasses[props.size]} ${variantClasses[props.variant]}`
})

const textClasses = computed(() => {
  const variantClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-700 dark:text-gray-300',
    white: 'text-white'
  }
  
  return variantClasses[props.variant]
})
</script>