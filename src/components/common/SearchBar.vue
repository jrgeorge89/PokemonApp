<template>
  <div class="search-bar-container mb-6">
    <div class="relative">
      <!-- Input de búsqueda -->
      <div class="relative flex items-center">
        <!-- Icono de lupa -->
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors"
            :class="{ 'text-blue-500 dark:text-blue-400': searchQuery.length > 0 }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Campo de entrada -->
        <input
          v-model="searchQuery"
          type="text"
          class="search-input w-full pl-12 pr-12 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
          placeholder="Buscar Pokémon por nombre..."
          :aria-label="searchAriaLabel"
          :aria-describedby="searchQuery ? 'search-clear-button' : undefined"
          autocomplete="off"
          spellcheck="false"
        >

        <!-- Botón limpiar -->
        <button
          v-if="searchQuery.length > 0"
          @click="clearSearch"
          type="button"
          class="clear-button absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:text-blue-500 dark:focus:text-blue-400 transition-colors duration-200"
          :aria-label="clearAriaLabel"
          id="search-clear-button"
        >
          <svg 
            class="w-5 h-5"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Indicador de búsqueda activa -->
      <div 
        v-if="searchQuery.length > 0" 
        class="search-indicator mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400"
      >
        <svg 
          class="w-4 h-4 mr-1 animate-pulse" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>
          Buscando: <strong>"{{ searchQuery }}"</strong>
          <button 
            @click="clearSearch"
            class="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline focus:outline-none"
          >
            Limpiar
          </button>
        </span>
      </div>
    </div>

    <!-- Sugerencias rápidas (opcional) -->
    <div 
      v-if="searchQuery.length === 0"
      class="suggestions mt-3"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Sugerencias populares:
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in popularSuggestions"
          :key="suggestion"
          @click="applySuggestion(suggestion)"
          class="suggestion-tag px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFilterStore } from '../../stores/filter.store'

// Store
const filterStore = useFilterStore()

// Props

// State
const popularSuggestions = ref([
  'pikachu',
  'charizard',
  'blastoise',
  'venusaur',
  'lucario',
  'gardevoir'
])

// Computed
const searchQuery = computed({
  get: () => filterStore.searchQuery,
  set: (value: string) => {
    filterStore.setSearchQuery(value)
  }
})

const searchAriaLabel = computed(() => {
  if (searchQuery.value) {
    return `Campo de búsqueda con texto: ${searchQuery.value}`
  }
  return 'Campo de búsqueda de Pokémon'
})

const clearAriaLabel = computed(() => {
  return `Limpiar búsqueda "${searchQuery.value}"`
})

// Methods
const clearSearch = () => {
  filterStore.setSearchQuery('')
  // Opcional: enfocar el input después de limpiar
  const input = document.querySelector('.search-input') as HTMLInputElement
  if (input) {
    input.focus()
  }
}

const applySuggestion = (suggestion: string) => {
  filterStore.setSearchQuery(suggestion)
}
</script>

<style scoped>
/* Animaciones para el input */
.search-input:focus {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.search-input::placeholder {
  transition: color 0.2s ease;
}

.search-input:focus::placeholder {
  color: rgb(156, 163, 175); /* gray-400 */
}

.dark .search-input:focus::placeholder {
  color: rgb(107, 114, 128); /* gray-500 */
}

/* Efectos para el botón limpiar */
.clear-button:hover {
  transform: scale(1.1);
}

.clear-button:active {
  transform: scale(0.95);
}

/* Animaciones para sugerencias */
.suggestion-tag {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.15);
}

.suggestion-tag:active {
  transform: translateY(0);
}

/* Indicador de búsqueda */
.search-indicator {
  animation: fadeInUp 0.3s ease-out;
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
  .search-input {
    font-size: 16px; /* Previene zoom en iOS */
  }
  
  .suggestions {
    margin-top: 0.75rem;
  }
  
  .suggestion-tag {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}

/* Estados de enfoque mejorados para accesibilidad */
.search-input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.clear-button:focus-visible,
.suggestion-tag:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Dark mode específico */
.dark .search-input {
  background-image: none;
}

.dark .search-input:focus {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15);
}

/* Mejoras de contraste para WCAG */
@media (prefers-contrast: high) {
  .search-input {
    border-width: 2px;
  }
  
  .search-input:focus {
    border-width: 3px;
  }
  
  .suggestion-tag {
    border: 1px solid currentColor;
  }
}

/* Reduce motion para usuarios sensibles */
@media (prefers-reduced-motion: reduce) {
  .search-input,
  .clear-button,
  .suggestion-tag,
  .search-indicator {
    transition: none;
    animation: none;
  }
  
  .clear-button:hover,
  .suggestion-tag:hover {
    transform: none;
  }
}
</style>