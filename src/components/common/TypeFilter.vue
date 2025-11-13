<template>
  <div class="type-filter-container mb-6">
    <div class="relative">
      <!-- Label -->
      <label 
        for="type-selector"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Filtrar por tipo
      </label>

      <!-- Select dropdown -->
      <div class="relative">
        <select
          id="type-selector"
          v-model="selectedType"
          class="type-select w-full pl-4 pr-10 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer"
          :aria-label="selectAriaLabel"
          :aria-describedby="selectedType ? 'selected-type-badge' : undefined"
        >
          <!-- Opción por defecto -->
          <option value="">Todos los tipos</option>
          
          <!-- Loading state -->
          <option v-if="filterStore.isLoadingTypes" disabled>
            Cargando tipos...
          </option>
          
          <!-- Tipos disponibles -->
          <option
            v-for="type in sortedTypes"
            :key="type"
            :value="type"
            class="capitalize"
          >
            {{ formatTypeName(type) }}
          </option>
        </select>

        <!-- Custom dropdown icon -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            class="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors"
            :class="{ 'text-blue-500 dark:text-blue-400': selectedType }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="m19 9-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <!-- Loading indicator -->
      <div 
        v-if="filterStore.isLoadingTypes" 
        class="loading-indicator mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400"
      >
        <svg 
          class="w-4 h-4 mr-2 animate-spin" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          />
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span>Cargando tipos de Pokémon...</span>
      </div>

      <!-- Error state -->
      <div 
        v-else-if="filterStore.typesError" 
        class="error-indicator mt-2 flex items-center text-sm text-red-600 dark:text-red-400"
      >
        <svg 
          class="w-4 h-4 mr-2" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
        <span>Error al cargar tipos</span>
        <button 
          @click="retryLoadTypes"
          class="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline focus:outline-none"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Badge del tipo seleccionado -->
    <div 
      v-if="selectedType && selectedTypeInfo" 
      class="selected-type-badge mt-3 flex items-center"
      id="selected-type-badge"
    >
      <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">
        Filtrando por tipo:
      </span>
      
      <!-- Badge visual del tipo -->
      <div class="flex items-center">
        <span
          :class="getTypeColorClasses(selectedType)"
          class="type-badge px-3 py-1 text-sm font-medium rounded-full capitalize mr-2 transition-all duration-200"
        >
          {{ formatTypeName(selectedType) }}
        </span>
        
        <!-- Botón para limpiar filtro -->
        <button
          @click="clearTypeFilter"
          type="button"
          class="clear-type-button p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:text-red-500 dark:focus:text-red-400 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          :aria-label="`Limpiar filtro de tipo ${formatTypeName(selectedType)}`"
        >
          <svg 
            class="w-4 h-4"
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
    </div>

    <!-- Tipos populares (cuando no hay filtro activo) -->
    <div 
      v-if="!selectedType && !filterStore.isLoadingTypes"
      class="quick-filters mt-3"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Filtros rápidos:
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="popularType in popularTypes"
          :key="popularType"
          @click="selectType(popularType)"
          :class="getTypeColorClasses(popularType)"
          class="quick-type-button px-3 py-1 text-sm font-medium rounded-full capitalize hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          {{ formatTypeName(popularType) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useFilterStore } from '../../stores/filter.store'

// Store
const filterStore = useFilterStore()

// Props

// State
const popularTypes = ref([
  'fire', 'water', 'electric', 'grass', 'psychic', 'dragon'
])

// Computed
const selectedType = computed({
  get: () => filterStore.selectedType,
  set: (value: string | null) => {
    filterStore.setSelectedType(value || null)
  }
})

const sortedTypes = computed(() => {
  return [...filterStore.availableTypes].sort((a, b) =>
    a.localeCompare(b)
  )
})

const selectedTypeInfo = computed(() => {
  if (!selectedType.value) return null
  return filterStore.availableTypes.find(type => type === selectedType.value)
})

const selectAriaLabel = computed(() => {
  if (selectedType.value) {
    return `Selector de tipo de Pokémon, actualmente seleccionado: ${formatTypeName(selectedType.value)}`
  }
  return 'Selector de tipo de Pokémon'
})

// Methods
const formatTypeName = (typeName: string): string => {
  // Traducciones opcionales para algunos tipos
  const translations: Record<string, string> = {
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada',
    normal: 'Normal'
  }
  
  return translations[typeName] || typeName.charAt(0).toUpperCase() + typeName.slice(1)
}

const getTypeColorClasses = (type: string): string => {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400 text-white shadow-md hover:bg-gray-500',
    fire: 'bg-red-500 text-white shadow-md hover:bg-red-600',
    water: 'bg-blue-500 text-white shadow-md hover:bg-blue-600',
    electric: 'bg-yellow-400 text-gray-900 shadow-md hover:bg-yellow-500',
    grass: 'bg-green-500 text-white shadow-md hover:bg-green-600',
    ice: 'bg-blue-300 text-gray-900 shadow-md hover:bg-blue-400',
    fighting: 'bg-red-700 text-white shadow-md hover:bg-red-800',
    poison: 'bg-purple-500 text-white shadow-md hover:bg-purple-600',
    ground: 'bg-yellow-600 text-white shadow-md hover:bg-yellow-700',
    flying: 'bg-indigo-400 text-white shadow-md hover:bg-indigo-500',
    psychic: 'bg-pink-500 text-white shadow-md hover:bg-pink-600',
    bug: 'bg-green-400 text-white shadow-md hover:bg-green-500',
    rock: 'bg-yellow-800 text-white shadow-md hover:bg-yellow-900',
    ghost: 'bg-purple-700 text-white shadow-md hover:bg-purple-800',
    dragon: 'bg-indigo-700 text-white shadow-md hover:bg-indigo-800',
    dark: 'bg-gray-800 text-white shadow-md hover:bg-gray-900',
    steel: 'bg-gray-500 text-white shadow-md hover:bg-gray-600',
    fairy: 'bg-pink-300 text-gray-900 shadow-md hover:bg-pink-400',
  }
  
  return typeColors[type] || 'bg-gray-400 text-white shadow-md hover:bg-gray-500'
}

const clearTypeFilter = () => {
  filterStore.setSelectedType(null)
}

const selectType = (typeName: string) => {
  filterStore.setSelectedType(typeName)
}

const retryLoadTypes = () => {
  filterStore.loadAvailableTypes()
}

// Lifecycle
onMounted(() => {
  // Cargar tipos si no están disponibles
  if (filterStore.availableTypes.length === 0 && !filterStore.isLoadingTypes) {
    filterStore.loadAvailableTypes()
  }
})
</script>

<style scoped>
/* Custom select styling */
.type-select {
  background-image: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.type-select:focus {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Badge animations */
.type-badge {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.selected-type-badge {
  animation: slideInUp 0.3s ease-out;
}

/* Quick filter buttons */
.quick-type-button:hover {
  transform: scale(1.05) translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.15);
}

.quick-type-button:active {
  transform: scale(0.98);
}

/* Clear button animations */
.clear-type-button:hover {
  transform: scale(1.1);
}

.clear-type-button:active {
  transform: scale(0.9);
}

/* Loading and error indicators */
.loading-indicator,
.error-indicator {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .type-select {
    font-size: 16px; /* Previene zoom en iOS */
  }
  
  .quick-type-button {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }
}

/* Dark mode específico */
.dark .type-select {
  background-image: none;
}

.dark .type-select:focus {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15);
}

/* Estados de enfoque para accesibilidad */
.type-select:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.clear-type-button:focus-visible,
.quick-type-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .type-select {
    border-width: 2px;
  }
  
  .type-select:focus {
    border-width: 3px;
  }
  
  .type-badge,
  .quick-type-button {
    border: 2px solid currentColor;
  }
}

/* Reduce motion para usuarios sensibles */
@media (prefers-reduced-motion: reduce) {
  .type-select,
  .type-badge,
  .quick-type-button,
  .clear-type-button,
  .selected-type-badge,
  .loading-indicator,
  .error-indicator {
    transition: none;
    animation: none;
  }
  
  .type-select:focus,
  .quick-type-button:hover,
  .clear-type-button:hover {
    transform: none;
  }
}
</style>