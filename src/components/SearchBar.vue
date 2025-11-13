<template>
  <div class="search-bar bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Campo de búsqueda -->
      <div class="flex-1">
        <label for="search-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buscar Pokémon
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search-input"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o número..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
      </div>
      
      <!-- Botón limpiar -->
      <div class="flex items-end">
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFilterStore } from '../stores/filter.store'

// Store
const filterStore = useFilterStore()

// Computed
const searchQuery = computed({
  get: () => filterStore.searchQuery,
  set: (value: string) => filterStore.setSearchQuery(value)
})

// Methods
const clearSearch = () => {
  filterStore.clearSearchFilter()
}
</script>