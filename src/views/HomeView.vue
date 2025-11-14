<template>
  <div class="home-view min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
    <div class="container mx-auto px-4">
      <!-- Descripción -->
      <div class="mb-6">
        <p class="text-gray-600 dark:text-gray-400 font-bold">
          Explora y descubre el mundo de los Pokémon
        </p>
      </div>

      <!--
        OPTIMIZACIÓN: KeepAlive para componentes que cambian frecuentemente
        Mantiene componentes en memoria cuando el usuario navega entre páginas
        Mejora significativamente la UX al regresar a la página principal
      -->
      <KeepAlive>
        <div class="filters-container mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- SearchBar component - ocupa la mitad izquierda -->
          <div class="search-section">
            <SearchBar />
          </div>

          <!-- TypeFilter component - ocupa la mitad derecha -->
          <div class="filter-section">
            <TypeFilter />
          </div>
        </div>
      </KeepAlive>

      <!-- Estados de carga y error -->
      
      <!-- Loading inicial -->
      <LoadingSpinner
        v-if="pokemonStore.isLoading && !pokemonStore.pokemons.length"
        size="large"
        message="Cargando Pokémon..."
      />

      <!-- Error state -->
      <ErrorMessage
        v-else-if="pokemonStore.error && !pokemonStore.pokemons.length"
        title="Error al cargar Pokémon"
        :message="pokemonStore.error"
        :retryable="true"
        @retry="retryLoadPokemons"
      />

      <!-- Estado vacío con filtros -->
      <div 
        v-else-if="!pokemonStore.isLoading && filteredPokemons.length === 0 && filterStore.hasActiveFilters"
        class="text-center py-16"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0l3.464-2c1.314-.805 2.768-.953 4.036-.424L12 12l4.5-2.424c1.268-.529 2.722-.38 4.036.424L24 12h-4a7.963 7.963 0 01-4 6.928z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron Pokémon
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            No hay Pokémon que coincidan con tus filtros actuales.
          </p>
          <button
            @click="clearAllFilters"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Estado vacío sin filtros -->
      <div 
        v-else-if="!pokemonStore.isLoading && pokemonStore.pokemons.length === 0"
        class="text-center py-16"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay datos disponibles
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            No se pudieron cargar los Pokémon. Inténtalo de nuevo.
          </p>
          <button
            @click="retryLoadPokemons"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Contenido principal con Pokémon -->
      <div v-else-if="filteredPokemons.length > 0">
        <!-- Información de filtros activos -->
        <div 
          v-if="filterStore.hasActiveFilters" 
          class="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="text-sm font-medium text-blue-800 dark:text-blue-300">
                {{ filterStore.filterConfig.filtersApplied }} filtro(s) activo(s) - 
                {{ filteredPokemons.length }} resultado(s)
              </span>
            </div>
            <button
              @click="clearAllFilters"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpiar todos
            </button>
          </div>
        </div>

        <!--
          OPTIMIZACIÓN: v-memo para optimizar re-renderizado de PokemonCard
          Solo re-renderiza cuando cambian props específicas (pokemon, isFavorite)
          Reduce cálculos innecesarios en listas grandes de Pokémon
        -->
        <div class="pokemon-grid grid gap-6 mb-8">
          <PokemonCard
            v-for="pokemon in filteredPokemons"
            :key="pokemon.id"
            :pokemon="pokemon"
            :is-favorite="isFavorite(pokemon.id)"
            v-memo="[pokemon.id, pokemon.name, pokemon.sprites, isFavorite(pokemon.id)]"
            @click="handlePokemonClick"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>

        <!-- Loading adicional para más resultados -->
        <LoadingSpinner 
          v-if="pokemonStore.isLoading && pokemonStore.pokemons.length > 0"
          message="Cargando más Pokémon..."
        />

        <!-- Pagination component -->
        <Pagination
          v-if="!pokemonStore.isLoading && !filterStore.hasActiveFilters"
          :current-page="pokemonStore.currentPage"
          :total-pages="pokemonStore.totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Scroll to top button -->
    <button
      v-if="showScrollToTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 z-40"
      title="Volver arriba"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, KeepAlive } from 'vue'
import { useRouter } from 'vue-router'
import { usePokemonStore } from '../stores/pokemon.store'
import { useFilterStore } from '../stores/filter.store'
import { usePokemonFavorites } from '../composables/usePokemonFavorites'
import SearchBar from '../components/common/SearchBar.vue'
import TypeFilter from '../components/common/TypeFilter.vue'
import PokemonCard from '../components/pokemon/PokemonCard.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import Pagination from '../components/common/Pagination.vue'
import type { Pokemon } from '../types/pokemon.types'

// Router
const router = useRouter()

// Stores
const pokemonStore = usePokemonStore()
const filterStore = useFilterStore()

// Composables
const { isFavorite, toggleFavorite } = usePokemonFavorites()

// State
const showScrollToTop = ref(false)

// Computed
const filteredPokemons = computed(() => {
  let pokemons = pokemonStore.pokemons

  // Aplicar filtro de búsqueda
  if (filterStore.debouncedSearchQuery) {
    const query = filterStore.debouncedSearchQuery.toLowerCase()
    pokemons = pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(query) ||
      pokemon.id.toString().includes(query)
    )
  }

  // Aplicar filtro de tipo
  if (filterStore.selectedType) {
    pokemons = pokemons.filter(pokemon =>
      pokemon.types.some(type => type.type.name === filterStore.selectedType)
    )
  }

  return pokemons
})


// Methods
const loadInitialData = async () => {
  try {
    await pokemonStore.fetchPokemons(1, true)
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
}

const retryLoadPokemons = async () => {
  await pokemonStore.fetchPokemons()
}

const handlePageChange = async (page: number) => {
  await pokemonStore.setCurrentPage(page)
  scrollToTop()
}


const clearAllFilters = () => {
  filterStore.clearFilters()
}

const handlePokemonClick = (pokemon: Pokemon) => {
  // Navigate to Pokemon detail page
  router.push(`/pokemon/${pokemon.id}`)
}

const handleToggleFavorite = (pokemon: Pokemon) => {
  toggleFavorite(pokemon)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showScrollToTop.value = window.scrollY > 400
}

// Watchers - El watcher de currentPage se elimina porque setCurrentPage ya maneja la carga

watch(
  () => filterStore.debouncedSearchQuery,
  () => {
    // Reset página cuando cambia la búsqueda
    if (pokemonStore.currentPage !== 1) {
      pokemonStore.setCurrentPage(1)
    }
  }
)

watch(
  () => filterStore.selectedType,
  () => {
    // Reset página cuando cambia el tipo
    if (pokemonStore.currentPage !== 1) {
      pokemonStore.setCurrentPage(1)
    }
  }
)

// Lifecycle
onMounted(async () => {
  await loadInitialData()
  
  // Setup scroll listener
  window.addEventListener('scroll', handleScroll)
})

// Cleanup scroll listener
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Grid responsivo para las tarjetas de Pokémon */
.pokemon-grid {
  /* 1 columna en móvil */
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

/* Tablets - 2-3 columnas */
@media (min-width: 640px) {
  .pokemon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .pokemon-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Desktop - 4-5 columnas */
@media (min-width: 1024px) {
  .pokemon-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .pokemon-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

/* Transiciones suaves */
.pokemon-grid > * {
  transition: all 0.3s ease;
}
</style>