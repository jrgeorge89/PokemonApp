<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePokemonFavorites } from '../composables/usePokemonFavorites'
import PokemonCard from '../components/pokemon/PokemonCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import type { Pokemon } from '../types/pokemon.types'

// =====================================
// COMPOSABLES Y STATE
// =====================================

const {
  favorites,
  favoritesCount,
  hasFavorites,
  searchFavorites,
  clearFavorites,
  toggleFavorite
} = usePokemonFavorites()

// Estado local
const searchQuery = ref('')
const sortBy = ref<'name' | 'id' | 'type'>('name')
const isLoading = ref(false)
const showClearConfirm = ref(false)

// =====================================
// COMPUTED PROPERTIES
// =====================================

/**
 * Lista filtrada y ordenada de favoritos
 */
const filteredFavorites = computed(() => {
  // Primero filtrar por búsqueda
  let result = searchQuery.value.trim()
    ? searchFavorites(searchQuery.value)
    : favorites.value

  // Aplicar ordenamiento manualmente ya que sortFavorites no acepta segundo parámetro
  const sorted = [...result].sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'id':
        return a.id - b.id
      case 'type':
        const aType = a.types?.[0]?.type.name || ''
        const bType = b.types?.[0]?.type.name || ''
        return aType.localeCompare(bType)
      default:
        return 0
    }
  })

  return sorted
})

/**
 * Estadísticas de favoritos
 */
const stats = computed(() => ({
  total: favoritesCount.value,
  filtered: filteredFavorites.value.length,
  types: [...new Set(favorites.value.flatMap(p => p.types?.map(t => t.type.name) || []))].length
}))

// =====================================
// MÉTODOS
// =====================================


/**
 * Elimina un Pokémon de favoritos
 */
const handleRemoveFavorite = (pokemon: Pokemon) => {
  toggleFavorite(pokemon)
}

/**
 * Confirma y ejecuta el borrado de todos los favoritos
 */
const handleClearAllFavorites = () => {
  clearFavorites()
  showClearConfirm.value = false
  searchQuery.value = ''
}

/**
 * Inicialización del componente
 */
onMounted(() => {
  // Los favoritos se cargan automáticamente por el composable
  isLoading.value = false
})
</script>

<template>
  <div class="favorites-view">
    <!-- Header de la página -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ❤️ Pokémon Favoritos
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Tu colección personal de Pokémon favoritos
          </p>
        </div>
        
        <!-- Estadísticas -->
        <div class="text-right">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ stats.total }}
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ stats.total === 1 ? 'favorito' : 'favoritos' }}
          </div>
        </div>
      </div>
      
      <!-- Información adicional -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-500 dark:text-gray-400">Total</div>
          <div class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ stats.total }}
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-500 dark:text-gray-400">Tipos únicos</div>
          <div class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ stats.types }}
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-500 dark:text-gray-400">Mostrando</div>
          <div class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ stats.filtered }}
          </div>
        </div>
      </div>
    </div>

    <!-- Controles de búsqueda y filtrado -->
    <div class="mb-6" v-if="hasFavorites">
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <!-- Búsqueda -->
        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar en favoritos..."
              class="w-full px-4 py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-blue-400"
            >
            <div class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Controles de ordenamiento y acciones -->
        <div class="flex items-center gap-3">
          <!-- Ordenamiento -->
          <select
            v-model="sortBy"
            class="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="name">Nombre</option>
            <option value="id">Número</option>
            <option value="type">Tipo</option>
          </select>

          <!-- Botón limpiar todos -->
          <button
            @click="showClearConfirm = true"
            class="px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors dark:text-red-400 dark:border-red-600 dark:hover:text-red-300"
            title="Limpiar todos los favoritos"
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading spinner -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <LoadingSpinner size="large" />
    </div>

    <!-- Estado vacío -->
    <div v-else-if="!hasFavorites" class="text-center py-16">
      <div class="text-6xl mb-4">💔</div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        No tienes favoritos aún
      </h2>
      <p class="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        Explora la Pokédex y marca algunos Pokémon como favoritos para verlos aquí.
      </p>
      <router-link
        to="/"
        class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Explorar Pokémon
      </router-link>
    </div>

    <!-- Sin resultados de búsqueda -->
    <div v-else-if="filteredFavorites.length === 0" class="text-center py-12">
      <div class="text-4xl mb-4">🔍</div>
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Sin resultados
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        No se encontraron favoritos que coincidan con "{{ searchQuery }}"
      </p>
      <button
        @click="searchQuery = ''"
        class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Limpiar búsqueda
      </button>
    </div>

    <!-- Grid de favoritos -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <PokemonCard
          v-for="pokemon in filteredFavorites"
          :key="pokemon.id"
          :pokemon="pokemon"
          :is-favorite="true"
          @toggle-favorite="handleRemoveFavorite"
        />
      </div>

      <!-- Resumen de resultados -->
      <div class="mt-8 text-center text-gray-500 dark:text-gray-400">
        <p v-if="searchQuery">
          Mostrando {{ filteredFavorites.length }} de {{ stats.total }} favoritos
        </p>
        <p v-else>
          {{ stats.total }} {{ stats.total === 1 ? 'Pokémon favorito' : 'Pokémon favoritos' }} en total
        </p>
      </div>
    </div>

    <!-- Modal de confirmación para limpiar favoritos -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="showClearConfirm = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-md w-full">
        <div class="text-center">
          <div class="text-4xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ¿Eliminar todos los favoritos?
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Esta acción no se puede deshacer. Se eliminarán todos tus {{ stats.total }} Pokémon favoritos.
          </p>
          <div class="flex gap-3 justify-center">
            <button
              @click="showClearConfirm = false"
              class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              @click="handleClearAllFavorites"
              class="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Eliminar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-view {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transiciones suaves para las tarjetas */
.grid > * {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.grid > *:hover {
  transform: translateY(-2px);
}

/* Responsive mejoras */
@media (max-width: 640px) {
  .favorites-view {
    padding: 0 0.5rem;
  }
}
</style>
