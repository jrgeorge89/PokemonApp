<template>
  <div class="type-filter bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <!-- Label y contador -->
      <div class="flex-shrink-0">
        <label for="type-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
          Filtrar por tipo
          <span v-if="filterStore.typesForSelect.length > 0" class="text-xs text-gray-500 dark:text-gray-400">
            ({{ filterStore.typesForSelect.length }} disponibles)
          </span>
        </label>
      </div>

      <!-- Select de tipos -->
      <div class="flex-1 min-w-0">
        <div class="relative">
          <select
            id="type-select"
            v-model="selectedType"
            :disabled="filterStore.isLoadingTypes"
            class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Todos los tipos</option>
            <option 
              v-for="type in filterStore.typesForSelect" 
              :key="type.value" 
              :value="type.value"
            >
              {{ type.displayName }}
            </option>
          </select>
          
          <!-- Loading indicator -->
          <div 
            v-if="filterStore.isLoadingTypes" 
            class="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none"
          >
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2 flex-shrink-0">
        <!-- Limpiar filtro -->
        <button
          v-if="selectedType"
          @click="clearTypeFilter"
          class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Limpiar
        </button>

        <!-- Retry en caso de error -->
        <button
          v-if="filterStore.typesError"
          @click="retryLoadTypes"
          class="px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div 
      v-if="filterStore.typesError" 
      class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
    >
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm text-red-700 dark:text-red-300">
          Error al cargar tipos: {{ filterStore.typesError }}
        </p>
      </div>
    </div>

    <!-- Filtros activos indicator -->
    <div 
      v-if="selectedType" 
      class="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400"
    >
      <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      Filtrando por: <strong class="ml-1">{{ getTypeDisplayName(selectedType) }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFilterStore } from '../stores/filter.store'

// Store
const filterStore = useFilterStore()

// Computed
const selectedType = computed({
  get: () => filterStore.selectedType || '',
  set: (value: string) => filterStore.setSelectedType(value || null)
})

// Methods
const clearTypeFilter = () => {
  filterStore.clearTypeFilter()
}

const retryLoadTypes = () => {
  filterStore.retryLoadTypes()
}

const getTypeDisplayName = (type: string): string => {
  const typeOption = filterStore.typesForSelect.find(t => t.value === type)
  return typeOption?.displayName || type
}
</script>