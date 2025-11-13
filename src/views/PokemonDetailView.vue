<template>
  <div class="pokemon-detail-view min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
    <div class="container mx-auto px-4">
      <!-- Botón volver -->
      <div class="mb-6">
        <router-link 
          to="/"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al listado
        </router-link>
      </div>

      <!-- Loading state -->
      <LoadingSpinner 
        v-if="pokemonStore.isLoading && !pokemon"
        size="large"
        message="Cargando información del Pokémon..."
        sub-message="Obteniendo datos detallados"
        full-screen
      />

      <!-- Error state -->
      <ErrorMessage
        v-else-if="pokemonStore.error && !pokemon"
        variant="error"
        title="Error al cargar el Pokémon"
        :message="pokemonStore.error"
        show-retry
        show-home
        :additional-info="'Verifica que el ID del Pokémon sea válido.'"
        @retry="loadPokemonDetail"
      />

      <!-- Pokemon not found -->
      <div 
        v-else-if="!pokemon && !pokemonStore.isLoading"
        class="text-center py-16"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md mx-auto">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0l3.464-2c1.314-.805 2.768-.953 4.036-.424L12 12l4.5-2.424c1.268-.529 2.722-.38 4.036.424L24 12h-4a7.963 7.963 0 01-4 6.928z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Pokémon no encontrado
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            No se encontró ningún Pokémon con el ID especificado.
          </p>
          <router-link 
            to="/"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Volver al inicio
          </router-link>
        </div>
      </div>

      <!-- Pokemon detail content -->
      <div v-else-if="pokemon" class="pokemon-detail-content">
        <!-- Header con información básica -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div class="detail-layout">
            <!-- Columna izquierda: Imagen -->
            <div class="image-section">
              <div class="relative">
                <img
                  v-if="pokemonImageUrl"
                  :src="pokemonImageUrl"
                  :alt="pokemon.name"
                  class="w-full max-w-sm mx-auto object-contain pokemon-image"
                  @error="handleImageError"
                >
                <div 
                  v-else 
                  class="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto max-w-sm"
                >
                  <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Columna derecha: Información básica -->
            <div class="info-section">
              <!-- Nombre y número -->
              <div class="mb-6">
                <div class="flex items-center gap-4 mb-2">
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                    {{ pokemon.name }}
                  </h1>
                  <span class="text-xl font-medium text-gray-500 dark:text-gray-400">
                    #{{ paddedId }}
                  </span>
                </div>
              </div>

              <!-- Tipos -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tipo</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="type in pokemon.types"
                    :key="type.type.name"
                    :class="getTypeClasses(type.type.name)"
                    class="px-3 py-1 text-sm font-medium rounded-full capitalize"
                  >
                    {{ type.type.name }}
                  </span>
                </div>
              </div>

              <!-- Información física -->
              <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ formattedHeight }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Altura</div>
                </div>
                <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ formattedWeight }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Peso</div>
                </div>
              </div>

              <!-- Habilidades -->
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Habilidades</h3>
                <div class="space-y-2">
                  <div
                    v-for="ability in pokemon.abilities"
                    :key="ability.ability.name"
                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span class="font-medium text-gray-900 dark:text-white capitalize">
                      {{ formatAbilityName(ability.ability.name) }}
                    </span>
                    <span 
                      v-if="ability.is_hidden"
                      class="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded"
                    >
                      Oculta
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de estadísticas -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Estadísticas Base</h2>
          
          <div class="space-y-4">
            <div
              v-for="stat in pokemon.stats"
              :key="stat.stat.name"
              class="stat-item"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {{ formatStatName(stat.stat.name) }}
                </span>
                <span class="text-sm font-bold text-gray-900 dark:text-white">
                  {{ stat.base_stat }}
                </span>
              </div>
              
              <!-- Barra de progreso -->
              <div class="stat-bar-container">
                <div 
                  class="stat-bar"
                  :class="getStatBarClasses(stat.base_stat)"
                  :style="{ width: `${getStatPercentage(stat.base_stat)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Total de estadísticas -->
          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span class="text-xl font-bold text-gray-900 dark:text-white">
                {{ totalStats }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePokemonStore } from '../stores/pokemon.store'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'

// Route and store
const route = useRoute()
const pokemonStore = usePokemonStore()

// State
const imageError = ref(false)

// Props from route
const pokemonId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : Number(id)
})

// Computed
const pokemon = computed(() => pokemonStore.currentPokemon)

const paddedId = computed(() => {
  return pokemon.value?.id.toString().padStart(3, '0') || '000'
})

const pokemonImageUrl = computed(() => {
  if (imageError.value || !pokemon.value) return null
  
  return pokemon.value.sprites?.other?.['official-artwork']?.front_default ||
         pokemon.value.sprites?.other?.home?.front_default ||
         pokemon.value.sprites?.front_default ||
         null
})

const formattedHeight = computed(() => {
  if (!pokemon.value) return '0.0 m'
  return `${(pokemon.value.height / 10).toFixed(1)} m`
})

const formattedWeight = computed(() => {
  if (!pokemon.value) return '0.0 kg'
  return `${(pokemon.value.weight / 10).toFixed(1)} kg`
})

const totalStats = computed(() => {
  if (!pokemon.value) return 0
  return pokemon.value.stats.reduce((total, stat) => total + stat.base_stat, 0)
})

// Methods
const loadPokemonDetail = async () => {
  if (pokemonId.value && pokemonId.value > 0) {
    await pokemonStore.fetchPokemonDetail(pokemonId.value)
  }
}

const handleImageError = () => {
  imageError.value = true
}

const formatAbilityName = (name: string): string => {
  return name.replace('-', ' ')
}

const formatStatName = (statName: string): string => {
  const statNames: Record<string, string> = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'At. Especial',
    'special-defense': 'Def. Especial',
    speed: 'Velocidad'
  }
  return statNames[statName] || statName
}

const getStatPercentage = (value: number): number => {
  // Max stat is typically 255, but we use 200 for better visual distribution
  const maxStat = 200
  return Math.min((value / maxStat) * 100, 100)
}

const getStatBarClasses = (value: number): string => {
  if (value >= 120) return 'stat-bar-excellent'
  if (value >= 90) return 'stat-bar-good'
  if (value >= 60) return 'stat-bar-average'
  return 'stat-bar-low'
}

const getTypeClasses = (type: string): string => {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400 text-white',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    electric: 'bg-yellow-400 text-black',
    grass: 'bg-green-500 text-white',
    ice: 'bg-blue-300 text-black',
    fighting: 'bg-red-700 text-white',
    poison: 'bg-purple-500 text-white',
    ground: 'bg-yellow-600 text-white',
    flying: 'bg-indigo-400 text-white',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-green-400 text-white',
    rock: 'bg-yellow-800 text-white',
    ghost: 'bg-purple-700 text-white',
    dragon: 'bg-indigo-700 text-white',
    dark: 'bg-gray-800 text-white',
    steel: 'bg-gray-500 text-white',
    fairy: 'bg-pink-300 text-black',
  }
  
  return typeColors[type] || 'bg-gray-400 text-white'
}

// Lifecycle
onMounted(() => {
  loadPokemonDetail()
})
</script>

<style scoped>
/* Layout responsivo */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr 1fr;
  }
}

/* Imagen del Pokémon */
.pokemon-image {
  height: 320px;
  transition: transform 0.3s ease;
}

.pokemon-image:hover {
  transform: scale(1.05);
}

/* Barras de estadísticas */
.stat-bar-container {
  width: 100%;
  height: 8px;
  background-color: rgb(229, 231, 235);
  border-radius: 4px;
  overflow: hidden;
}

.dark .stat-bar-container {
  background-color: rgb(75, 85, 99);
}

.stat-bar {
  height: 100%;
  transition: width 0.8s ease-in-out;
  border-radius: 4px;
}

.stat-bar-excellent {
  background-color: rgb(34, 197, 94); /* green-500 */
}

.stat-bar-good {
  background-color: rgb(59, 130, 246); /* blue-500 */
}

.stat-bar-average {
  background-color: rgb(245, 158, 11); /* amber-500 */
}

.stat-bar-low {
  background-color: rgb(239, 68, 68); /* red-500 */
}

/* Animations */
.stat-item {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>