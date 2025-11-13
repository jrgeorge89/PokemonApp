<template>
  <div 
    class="pokemon-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
    @click="goToDetail"
  >
    <!-- Header con número y favorito -->
    <div class="px-4 pt-4 pb-2 flex justify-between items-start">
      <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
        #{{ paddedId }}
      </span>
      <button
        @click.stop="toggleFavorite"
        class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        :title="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
      >
        <svg 
          class="w-5 h-5"
          :class="isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>

    <!-- Imagen -->
    <div class="flex justify-center items-center h-32 px-4">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="pokemon.name"
        :loading="isVisible ? 'eager' : 'lazy'"
        class="w-24 h-24 object-contain transition-transform duration-300 hover:scale-110"
        @error="handleImageError"
      >
      <div 
        v-else 
        class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
      >
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Info del Pokémon -->
    <div class="px-4 pb-4">
      <!-- Nombre -->
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white capitalize mb-2 truncate">
        {{ pokemon.name }}
      </h3>

      <!-- Tipos -->
      <div class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="type in pokemonTypes"
          :key="type.type.name"
          :class="getTypeClasses(type.type.name)"
          class="px-2 py-1 text-xs font-medium rounded-full capitalize"
        >
          {{ type.type.name }}
        </span>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="text-center">
          <span class="block text-gray-500 dark:text-gray-400">Altura</span>
          <span class="font-medium text-gray-900 dark:text-white">
            {{ height }} m
          </span>
        </div>
        <div class="text-center">
          <span class="block text-gray-500 dark:text-gray-400">Peso</span>
          <span class="font-medium text-gray-900 dark:text-white">
            {{ weight }} kg
          </span>
        </div>
      </div>

      <!-- Habilidades (opcional, si hay espacio) -->
      <div v-if="pokemon.abilities.length > 0" class="mt-3">
        <span class="text-xs text-gray-500 dark:text-gray-400">Habilidades:</span>
        <div class="flex flex-wrap gap-1 mt-1">
          <span
            v-for="ability in pokemon.abilities.slice(0, 2)"
            :key="ability.ability.name"
            class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded capitalize"
          >
            {{ ability.ability.name }}
          </span>
          <span
            v-if="pokemon.abilities.length > 2"
            class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded"
          >
            +{{ pokemon.abilities.length - 2 }}
          </span>
        </div>
      </div>
    </div>

    <!-- Loading overlay para cuando se está cargando la imagen -->
    <div 
      v-if="imageLoading"
      class="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex items-center justify-center"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Pokemon } from '../types/pokemon.types'

// Props
interface Props {
  pokemon: Pokemon
  isFavorite?: boolean
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isFavorite: false,
  isVisible: true
})

// Emits
const emit = defineEmits<{
  toggleFavorite: [pokemonId: number]
}>()

// Router
const router = useRouter()

// State
const imageLoading = ref(true)
const imageError = ref(false)

// Computed
const paddedId = computed(() => {
  return props.pokemon.id.toString().padStart(3, '0')
})

const imageUrl = computed(() => {
  if (imageError.value) return null
  
  // Usar imagen oficial primero, fallback a artwork
  return props.pokemon.sprites?.other?.['official-artwork']?.front_default ||
         props.pokemon.sprites?.front_default ||
         props.pokemon.sprites?.other?.dream_world?.front_default ||
         null
})

const pokemonTypes = computed(() => {
  return props.pokemon.types || []
})

const height = computed(() => {
  // PokéAPI devuelve altura en decímetros, convertir a metros
  return ((props.pokemon.height || 0) / 10).toFixed(1)
})

const weight = computed(() => {
  // PokéAPI devuelve peso en hectogramos, convertir a kilogramos  
  return ((props.pokemon.weight || 0) / 10).toFixed(1)
})

// Methods
const goToDetail = () => {
  router.push(`/pokemon/${props.pokemon.id}`)
}

const toggleFavorite = () => {
  emit('toggleFavorite', props.pokemon.id)
}

const handleImageError = () => {
  imageError.value = true
  imageLoading.value = false
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
  // La imagen se marcará como cargada cuando se complete
  if (imageUrl.value) {
    const img = new Image()
    img.onload = () => {
      imageLoading.value = false
    }
    img.onerror = () => {
      handleImageError()
    }
    img.src = imageUrl.value
  } else {
    imageLoading.value = false
  }
})
</script>

<style scoped>
.pokemon-card {
  position: relative;
  min-height: 300px;
}
</style>