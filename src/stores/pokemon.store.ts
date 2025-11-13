/**
 * Store de Pinia para la gestión del estado de Pokémon
 * Maneja listado, detalle, paginación y filtrado de Pokémon
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pokemon, PokemonListResponse, ApiError, NamedAPIResource } from '../types/pokemon.types'
import {
  getPokemonList,
  getPokemonById,
  searchPokemonByName
} from '../services/pokemon.service'

/**
 * Interface para filtros de búsqueda
 */
interface PokemonFilters {
  search: string
  type: string | null
}

/**
 * Store principal para la gestión de Pokémon
 * Utiliza Composition API de Pinia para un mejor tipado y reutilización
 */
export const usePokemonStore = defineStore('pokemon', () => {
  // =====================================
  // STATE - Referencias reactivas
  // =====================================

  /** Lista actual de Pokémon cargados */
  const pokemons = ref<Pokemon[]>([])

  /** Pokémon actualmente seleccionado para vista de detalle */
  const currentPokemon = ref<Pokemon | null>(null)

  /** Número total de Pokémon disponibles en la API */
  const totalCount = ref<number>(0)

  /** Estado de carga para mostrar spinners/skeletons */
  const isLoading = ref<boolean>(false)

  /** Mensaje de error actual, null si no hay errores */
  const error = ref<string | null>(null)

  /** Página actual de la paginación (base 1) */
  const currentPage = ref<number>(1)

  /** Número de elementos por página */
  const itemsPerPage = ref<number>(20)

  /** Filtros activos para búsqueda y filtrado */
  const filters = ref<PokemonFilters>({
    search: '',
    type: null
  })

  /** Cache de Pokémon detallados para optimizar rendimiento */
  const pokemonCache = ref<Map<number, Pokemon>>(new Map())

  // =====================================
  // GETTERS - Propiedades computadas
  // =====================================

  /**
   * Calcula el número total de páginas basado en el total de elementos
   */
  const totalPages = computed(() => {
    return Math.ceil(totalCount.value / itemsPerPage.value)
  })

  /**
   * Aplica filtros de búsqueda y tipo a la lista de Pokémon
   * Incluye búsqueda por nombre y filtrado por tipo
   */
  const filteredPokemons = computed(() => {
    let filtered = [...pokemons.value]

    // Filtro por búsqueda de texto (nombre)
    if (filters.value.search.trim()) {
      const searchTerm = filters.value.search.toLowerCase().trim()
      filtered = filtered.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por tipo de Pokémon
    if (filters.value.type) {
      filtered = filtered.filter(pokemon => 
        pokemon.types.some((typeSlot: { slot: number; type: NamedAPIResource }) =>
          typeSlot.type.name.toLowerCase() === filters.value.type?.toLowerCase()
        )
      )
    }

    return filtered
  })

  /**
   * Indica si hay filtros activos
   */
  const hasActiveFilters = computed(() => {
    return filters.value.search.trim() !== '' || filters.value.type !== null
  })

  /**
   * Información de paginación para mostrar en la UI
   */
  const paginationInfo = computed(() => {
    const startItem = ((currentPage.value - 1) * itemsPerPage.value) + 1
    const endItem = Math.min(currentPage.value * itemsPerPage.value, totalCount.value)
    
    return {
      startItem,
      endItem,
      totalItems: totalCount.value,
      currentPage: currentPage.value,
      totalPages: totalPages.value
    }
  })

  // =====================================
  // ACTIONS - Funciones del store
  // =====================================

  /**
   * Obtiene una lista paginada de Pokémon desde la API
   * 
   * @param page - Número de página a obtener (base 1)
   * @param resetList - Si true, reemplaza la lista actual. Si false, agrega a la existente
   */
  async function fetchPokemons(page: number = 1, resetList: boolean = true): Promise<void> {
    try {
      // Configurar estado de carga
      isLoading.value = true
      resetError()

      // Validar parámetros de entrada
      if (page < 1) {
        throw new Error('El número de página debe ser mayor a 0')
      }

      // Calcular offset para la paginación
      const offset = (page - 1) * itemsPerPage.value

      console.log(`Fetching Pokémon - Page: ${page}, Offset: ${offset}, Limit: ${itemsPerPage.value}`)

      // Realizar petición a la API
      const response: PokemonListResponse = await getPokemonList(
        itemsPerPage.value, 
        offset
      )

      // Procesar respuesta
      if (response.results && Array.isArray(response.results)) {
        // Obtener detalles de cada Pokémon en la lista
        const detailedPokemons = await Promise.all(
          response.results.map(async (pokemonRef: NamedAPIResource) => {
            try {
              // Extraer ID desde la URL
              const id = extractIdFromUrl(pokemonRef.url)
              
              // Verificar cache primero
              if (pokemonCache.value.has(id)) {
                return pokemonCache.value.get(id)!
              }

              // Obtener detalles del Pokémon
              const pokemon = await getPokemonById(id)
              
              // Guardar en cache
              pokemonCache.value.set(id, pokemon)
              
              return pokemon
            } catch (err) {
              console.warn(`Error loading details for ${pokemonRef.name}:`, err)
              // Retornar estructura mínima en caso de error usando unknown para forzar conversión
              return {
                id: extractIdFromUrl(pokemonRef.url),
                name: pokemonRef.name,
                types: [],
                sprites: {
                  front_default: null,
                  back_default: null,
                  front_female: null,
                  back_female: null,
                  front_shiny: null,
                  back_shiny: null,
                  front_shiny_female: null,
                  back_shiny_female: null,
                  other: {
                    dream_world: { front_default: null, front_female: null },
                    home: {
                      front_default: null,
                      front_female: null,
                      front_shiny: null,
                      front_shiny_female: null
                    },
                    'official-artwork': {
                      front_default: null,
                      front_shiny: null
                    },
                    showdown: {
                      front_default: null,
                      back_default: null,
                      front_female: null,
                      back_female: null,
                      front_shiny: null,
                      back_shiny: null,
                      front_shiny_female: null,
                      back_shiny_female: null
                    }
                  },
                  versions: {}
                },
                height: 0,
                weight: 0,
                base_experience: 0,
                abilities: [],
                stats: [],
                is_default: true,
                order: 0,
                location_area_encounters: '',
                held_items: [],
                moves: [],
                species: { name: pokemonRef.name, url: pokemonRef.url },
                game_indices: [],
                forms: [{ name: pokemonRef.name, url: pokemonRef.url }],
                past_abilities: [],
                past_types: [],
                cries: { latest: '', legacy: '' }
              } as unknown as Pokemon
            }
          })
        )

        // Actualizar estado
        if (resetList) {
          pokemons.value = detailedPokemons
        } else {
          pokemons.value.push(...detailedPokemons)
        }

        totalCount.value = response.count
        currentPage.value = page

        console.log(`Successfully loaded ${detailedPokemons.length} Pokémon`)
      } else {
        throw new Error('Respuesta inválida de la API: falta el array de resultados')
      }

    } catch (err) {
      console.error('Error fetching Pokémon list:', err)
      
      // Manejar diferentes tipos de errores
      if (err instanceof Error) {
        error.value = err.message
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        error.value = (err as ApiError).message
      } else {
        error.value = 'Error desconocido al cargar la lista de Pokémon'
      }

      // En caso de error, mantener datos existentes si los hay
      if (pokemons.value.length === 0) {
        pokemons.value = []
        totalCount.value = 0
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene los detalles completos de un Pokémon específico
   * 
   * @param id - ID del Pokémon a obtener
   */
  async function fetchPokemonDetail(id: number): Promise<Pokemon | null> {
    try {
      isLoading.value = true
      resetError()

      // Validar parámetro de entrada
      if (!Number.isInteger(id) || id < 1) {
        throw new Error('ID de Pokémon inválido')
      }

      console.log(`Fetching Pokémon detail for ID: ${id}`)

      // Verificar cache primero
      if (pokemonCache.value.has(id)) {
        const cachedPokemon = pokemonCache.value.get(id)!
        currentPokemon.value = cachedPokemon
        return cachedPokemon
      }

      // Obtener desde la API
      const pokemon = await getPokemonById(id)

      // Actualizar estado y cache
      currentPokemon.value = pokemon
      pokemonCache.value.set(id, pokemon)

      console.log(`Successfully loaded Pokémon: ${pokemon.name}`)
      return pokemon

    } catch (err) {
      console.error(`Error fetching Pokémon detail for ID ${id}:`, err)
      
      if (err instanceof Error) {
        error.value = err.message
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        error.value = (err as ApiError).message
      } else {
        error.value = `Error al cargar el Pokémon con ID ${id}`
      }

      currentPokemon.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Busca un Pokémon por nombre con tolerancia a errores
   * 
   * @param name - Nombre del Pokémon a buscar
   */
  async function searchPokemon(name: string): Promise<Pokemon | null> {
    try {
      isLoading.value = true
      resetError()

      if (!name || name.trim().length === 0) {
        throw new Error('El nombre del Pokémon es requerido')
      }

      console.log(`Searching for Pokémon: ${name}`)

      // Intentar búsqueda con tolerancia a errores
      const pokemon = await searchPokemonByName(name.trim())

      if (pokemon) {
        currentPokemon.value = pokemon
        pokemonCache.value.set(pokemon.id, pokemon)
        console.log(`Found Pokémon: ${pokemon.name}`)
        return pokemon
      } else {
        error.value = `No se encontró ningún Pokémon con el nombre "${name}"`
        return null
      }

    } catch (err) {
      console.error(`Error searching for Pokémon "${name}":`, err)
      
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = `Error al buscar el Pokémon "${name}"`
      }

      currentPokemon.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cambia a una página específica de la paginación
   * 
   * @param page - Número de página a mostrar
   */
  async function setCurrentPage(page: number): Promise<void> {
    if (page < 1 || page > totalPages.value) {
      console.warn(`Invalid page number: ${page}. Must be between 1 and ${totalPages.value}`)
      return
    }

    if (page === currentPage.value) {
      console.log(`Already on page ${page}`)
      return
    }

    await fetchPokemons(page, true)
  }

  /**
   * Actualiza los filtros de búsqueda y tipo
   * 
   * @param newFilters - Nuevos filtros a aplicar
   */
  function updateFilters(newFilters: Partial<PokemonFilters>): void {
    filters.value = { ...filters.value, ...newFilters }
    console.log('Filters updated:', filters.value)
  }

  /**
   * Limpia todos los filtros activos
   */
  function clearFilters(): void {
    filters.value = {
      search: '',
      type: null
    }
    console.log('Filters cleared')
  }

  /**
   * Limpia el mensaje de error actual
   */
  function resetError(): void {
    error.value = null
  }

  /**
   * Limpia el Pokémon actualmente seleccionado
   */
  function clearCurrentPokemon(): void {
    currentPokemon.value = null
  }

  /**
   * Reinicia el estado completo del store
   */
  function resetStore(): void {
    pokemons.value = []
    currentPokemon.value = null
    totalCount.value = 0
    currentPage.value = 1
    isLoading.value = false
    error.value = null
    filters.value = {
      search: '',
      type: null
    }
    pokemonCache.value.clear()
    console.log('Store reset to initial state')
  }

  /**
   * Carga la siguiente página de Pokémon si está disponible
   */
  async function loadNextPage(): Promise<void> {
    if (currentPage.value < totalPages.value) {
      await setCurrentPage(currentPage.value + 1)
    }
  }

  /**
   * Carga la página anterior de Pokémon si está disponible
   */
  async function loadPreviousPage(): Promise<void> {
    if (currentPage.value > 1) {
      await setCurrentPage(currentPage.value - 1)
    }
  }

  // =====================================
  // UTILITY FUNCTIONS
  // =====================================

  /**
   * Extrae el ID numérico de una URL de PokéAPI
   */
  function extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/?$/)
    if (!matches || !matches[1]) {
      throw new Error(`Cannot extract ID from URL: ${url}`)
    }
    return parseInt(matches[1], 10)
  }

  // =====================================
  // RETURN - API del store
  // =====================================

  return {
    // State
    pokemons,
    currentPokemon,
    totalCount,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    filters,

    // Getters
    totalPages,
    filteredPokemons,
    hasActiveFilters,
    paginationInfo,

    // Actions
    fetchPokemons,
    fetchPokemonDetail,
    searchPokemon,
    setCurrentPage,
    updateFilters,
    clearFilters,
    resetError,
    clearCurrentPokemon,
    resetStore,
    loadNextPage,
    loadPreviousPage
  }
})

// =====================================
// EXPORT TYPE
// =====================================

/**
 * Tipo para el store de Pokémon
 * Útil para tipado en composables y componentes
 */
export type PokemonStore = ReturnType<typeof usePokemonStore>

export default usePokemonStore