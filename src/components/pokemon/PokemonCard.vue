<template>
  <div 
    class="pokemon-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
    @click="handleClick"
  >
    <!-- Imagen del Pokémon -->
    <div class="pokemon-image-container flex justify-center items-center h-32 pt-4 px-4">
      <img
        v-if="pokemonImageUrl"
        :src="pokemonImageUrl"
        :alt="pokemon.name"
        class="pokemon-image w-24 h-24 object-contain transition-transform duration-300"
        @error="handleImageError"
        loading="lazy"
      >
      <div 
        v-else 
        class="pokemon-placeholder w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"
      >
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Información del Pokémon -->
    <div class="pokemon-info p-4 pt-2">
      <!-- Número de Pokédex -->
      <div class="pokemon-number text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {{ paddedPokedexNumber }}
      </div>

      <!-- Nombre -->
      <h3 class="pokemon-name text-lg font-semibold text-gray-900 dark:text-white capitalize mb-3 truncate">
        {{ pokemon.name }}
      </h3>

      <!-- Badges de tipos -->
      <div class="pokemon-types flex flex-wrap gap-2">
        <span
          v-for="typeSlot in pokemon.types"
          :key="typeSlot.type.name"
          :class="getTypeColorClasses(typeSlot.type.name)"
          class="type-badge px-3 py-1 text-xs font-medium rounded-full capitalize transition-all duration-200 hover:scale-110"
        >
          {{ typeSlot.type.name }}
        </span>
      </div>
    </div>

    <!-- Efecto de overlay en hover -->
    <div class="hover-overlay absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Pokemon } from '../../types/pokemon.types'

// Props
interface Props {
  pokemon: Pokemon
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  click: [pokemon: Pokemon]
}>()

// State
const imageError = ref(false)

// Computed
const paddedPokedexNumber = computed(() => {
  return `#${props.pokemon.id.toString().padStart(3, '0')}`
})

const pokemonImageUrl = computed(() => {
  if (imageError.value) return null
  
  // Priorizar official artwork, luego sprites normales
  return props.pokemon.sprites?.other?.['official-artwork']?.front_default ||
         props.pokemon.sprites?.other?.home?.front_default ||
         props.pokemon.sprites?.front_default ||
         null
})

// Methods
const handleClick = () => {
  emit('click', props.pokemon)
}

const handleImageError = () => {
  imageError.value = true
}

/**
 * Retorna las clases de color para cada tipo de Pokémon
 * Usando una paleta de colores temática y accesible
 */
const getTypeColorClasses = (type: string): string => {
  const typeColors: Record<string, string> = {
    // Tipos básicos
    normal: 'bg-gray-400 text-white shadow-md hover:bg-gray-500',
    fire: 'bg-red-500 text-white shadow-md hover:bg-red-600',
    water: 'bg-blue-500 text-white shadow-md hover:bg-blue-600',
    electric: 'bg-yellow-400 text-gray-900 shadow-md hover:bg-yellow-500',
    grass: 'bg-green-500 text-white shadow-md hover:bg-green-600',
    ice: 'bg-blue-300 text-gray-900 shadow-md hover:bg-blue-400',
    
    // Tipos de combate
    fighting: 'bg-red-700 text-white shadow-md hover:bg-red-800',
    poison: 'bg-purple-500 text-white shadow-md hover:bg-purple-600',
    ground: 'bg-yellow-600 text-white shadow-md hover:bg-yellow-700',
    flying: 'bg-indigo-400 text-white shadow-md hover:bg-indigo-500',
    psychic: 'bg-pink-500 text-white shadow-md hover:bg-pink-600',
    bug: 'bg-green-400 text-white shadow-md hover:bg-green-500',
    
    // Tipos especiales
    rock: 'bg-yellow-800 text-white shadow-md hover:bg-yellow-900',
    ghost: 'bg-purple-700 text-white shadow-md hover:bg-purple-800',
    dragon: 'bg-indigo-700 text-white shadow-md hover:bg-indigo-800',
    dark: 'bg-gray-800 text-white shadow-md hover:bg-gray-900',
    steel: 'bg-gray-500 text-white shadow-md hover:bg-gray-600',
    fairy: 'bg-pink-300 text-gray-900 shadow-md hover:bg-pink-400',
  }
  
  return typeColors[type] || 'bg-gray-400 text-white shadow-md hover:bg-gray-500'
}
</script>

<style scoped>
.pokemon-card {
  position: relative;
  min-height: 200px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pokemon-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.pokemon-image {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pokemon-card:hover .pokemon-image {
  transform: scale(1.1) translateY(-2px);
  filter: drop-shadow(0 8px 15px rgba(0, 0, 0, 0.2));
}

.type-badge {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pokemon-name {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.pokemon-number {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

/* Animaciones de entrada */
.pokemon-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode específico */
.dark .pokemon-card {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(31, 41, 55, 0.9);
}

.dark .pokemon-card:hover {
  background: rgba(31, 41, 55, 0.95);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .pokemon-card {
    min-height: 180px;
  }
  
  .pokemon-image-container {
    height: 6rem; /* h-24 */
  }
  
  .pokemon-image {
    width: 5rem; /* w-20 */
    height: 5rem; /* h-20 */
  }
  
  .pokemon-placeholder {
    width: 5rem;
    height: 5rem;
  }
}

/* Accesibilidad */
.pokemon-card:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.pokemon-card:focus:not(:focus-visible) {
  outline: none;
}

/* Micro interacciones */
.type-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>