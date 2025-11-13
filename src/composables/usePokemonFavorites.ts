/**
 * Composable para gestión de Pokémon favoritos
 * Maneja el estado de favoritos, persistencia en localStorage y sincronización
 */

import { ref, computed, watch } from 'vue'
import type { Pokemon } from '../types/pokemon.types'

// Estado global de favoritos (compartido entre componentes)
const favorites = ref<Pokemon[]>([])
const favoritesLoaded = ref(false)

// Clave para localStorage
const FAVORITES_STORAGE_KEY = 'pokemon-app-favorites'

/**
 * Composable principal para gestionar favoritos de Pokémon
 */
export const usePokemonFavorites = () => {
  
  // =====================================
  // COMPUTED PROPERTIES
  // =====================================
  
  /**
   * Lista de IDs de Pokémon favoritos para búsqueda rápida
   */
  const favoriteIds = computed(() => 
    new Set(favorites.value.map(pokemon => pokemon.id))
  )
  
  /**
   * Cantidad total de favoritos
   */
  const favoritesCount = computed(() => favorites.value.length)
  
  /**
   * Indica si hay favoritos guardados
   */
  const hasFavorites = computed(() => favorites.value.length > 0)
  
  // =====================================
  // MÉTODOS DE PERSISTENCIA
  // =====================================
  
  /**
   * Carga favoritos desde localStorage
   */
  const loadFavoritesFromStorage = (): Pokemon[] => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validar que sea un array válido
        if (Array.isArray(parsed)) {
          return parsed.filter(item => 
            item && 
            typeof item.id === 'number' && 
            typeof item.name === 'string'
          )
        }
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error)
    }
    return []
  }
  
  /**
   * Guarda favoritos en localStorage
   */
  const saveFavoritesToStorage = (favoritesToSave: Pokemon[]) => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesToSave))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }
  
  // =====================================
  // MÉTODOS PRINCIPALES
  // =====================================
  
  /**
   * Inicializa los favoritos cargándolos desde localStorage
   */
  const initializeFavorites = () => {
    if (!favoritesLoaded.value) {
      favorites.value = loadFavoritesFromStorage()
      favoritesLoaded.value = true
    }
  }
  
  /**
   * Verifica si un Pokémon está en favoritos
   */
  const isFavorite = (pokemonId: number): boolean => {
    return favoriteIds.value.has(pokemonId)
  }
  
  /**
   * Agrega un Pokémon a favoritos
   */
  const addToFavorites = (pokemon: Pokemon): void => {
    if (!isFavorite(pokemon.id)) {
      favorites.value.push(pokemon)
      console.log(`✨ ${pokemon.name} agregado a favoritos`)
    }
  }
  
  /**
   * Elimina un Pokémon de favoritos
   */
  const removeFromFavorites = (pokemonId: number): void => {
    const index = favorites.value.findIndex(p => p.id === pokemonId)
    if (index > -1) {
      const removed = favorites.value.splice(index, 1)[0]
      if (removed) {
        console.log(`💔 ${removed.name} eliminado de favoritos`)
      }
    }
  }
  
  /**
   * Toggle del estado de favorito de un Pokémon
   */
  const toggleFavorite = (pokemon: Pokemon): boolean => {
    if (isFavorite(pokemon.id)) {
      removeFromFavorites(pokemon.id)
      return false
    } else {
      addToFavorites(pokemon)
      return true
    }
  }
  
  /**
   * Limpia todos los favoritos
   */
  const clearFavorites = (): void => {
    favorites.value = []
    console.log('🗑️ Todos los favoritos han sido eliminados')
  }
  
  /**
   * Obtiene todos los favoritos
   */
  const getFavorites = (): Pokemon[] => {
    return [...favorites.value]
  }
  
  /**
   * Busca favoritos por nombre
   */
  const searchFavorites = (query: string): Pokemon[] => {
    if (!query.trim()) return getFavorites()
    
    const searchTerm = query.toLowerCase().trim()
    return favorites.value.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm) ||
      pokemon.id.toString().includes(searchTerm)
    )
  }
  
  /**
   * Ordena favoritos por diferentes criterios
   */
  const sortFavorites = (sortBy: 'name' | 'id' | 'type' = 'name'): Pokemon[] => {
    const sorted = [...favorites.value]
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'id':
        return sorted.sort((a, b) => a.id - b.id)
      case 'type':
        return sorted.sort((a, b) => {
          const aType = a.types?.[0]?.type?.name || 'unknown'
          const bType = b.types?.[0]?.type?.name || 'unknown'
          return aType.localeCompare(bType)
        })
      default:
        return sorted
    }
  }
  
  // =====================================
  // WATCHERS
  // =====================================
  
  // Observar cambios en favoritos y guardar automáticamente
  watch(
    favorites,
    (newFavorites) => {
      if (favoritesLoaded.value) {
        saveFavoritesToStorage(newFavorites)
      }
    },
    { deep: true }
  )
  
  // =====================================
  // INICIALIZACIÓN
  // =====================================
  
  // Inicializar favoritos si no se han cargado
  if (!favoritesLoaded.value) {
    initializeFavorites()
  }
  
  // =====================================
  // RETURN
  // =====================================
  
  return {
    // State
    favorites: computed(() => favorites.value),
    favoritesCount,
    hasFavorites,
    favoritesLoaded: computed(() => favoritesLoaded.value),
    
    // Methods
    initializeFavorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    getFavorites,
    searchFavorites,
    sortFavorites,
    
    // Utils
    favoriteIds
  }
}

/**
 * Tipo de retorno del composable para TypeScript
 */
export type UsePokemonFavoritesReturn = ReturnType<typeof usePokemonFavorites>

export default usePokemonFavorites