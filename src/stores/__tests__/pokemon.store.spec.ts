/**
 * Tests para pokemonStore (Prompt 9.2)
 * Prueba el estado y acciones del store de Pokémon con mocks del servicio
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePokemonStore } from '../pokemon.store'
import type { Pokemon, PokemonListResponse, PokemonListItem } from '../../types/pokemon.types'

// Mock del servicio de Pokémon
vi.mock('../../services/pokemon.service', () => ({
  getPokemonList: vi.fn(),
  getPokemonById: vi.fn()
}))

import { getPokemonList, getPokemonById } from '../../services/pokemon.service'

describe('pokemonStore', () => {
  let pokemonStore: ReturnType<typeof usePokemonStore>

  // Mock data para los tests
  const mockPokemonListItem: PokemonListItem = {
    name: 'pikachu',
    url: 'https://pokeapi.co/api/v2/pokemon/25/'
  }

  const mockPokemonListResponse: PokemonListResponse = {
    count: 1302,
    next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
    previous: null,
    results: [mockPokemonListItem]
  }

  const mockPokemon: Pokemon = {
    id: 25,
    name: 'pikachu',
    base_experience: 112,
    height: 4,
    weight: 60,
    is_default: true,
    order: 35,
    abilities: [
      {
        ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' },
        is_hidden: false,
        slot: 1
      }
    ],
    forms: [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' }
    ],
    game_indices: [
      {
        game_index: 84,
        version: { name: 'red', url: 'https://pokeapi.co/api/v2/version/1/' }
      }
    ],
    held_items: [],
    location_area_encounters: 'https://pokeapi.co/api/v2/pokemon/25/encounters',
    moves: [],
    past_types: [],
    sprites: {
      back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png',
      back_female: null,
      back_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/25.png',
      back_shiny_female: null,
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      front_female: null,
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
      front_shiny_female: null,
      other: {
        dream_world: {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/25.svg',
          front_female: null
        },
        home: {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png',
          front_female: null,
          front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/25.png',
          front_shiny_female: null
        },
        'official-artwork': {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
          front_shiny: null
        },
        showdown: {
          back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/25.gif',
          back_female: null,
          back_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/shiny/25.gif',
          back_shiny_female: null,
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif',
          front_female: null,
          front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/shiny/25.gif',
          front_shiny_female: null
        }
      },
      versions: {}
    },
    cries: {
      latest: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg',
      legacy: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/25.ogg'
    },
    species: {
      name: 'pikachu',
      url: 'https://pokeapi.co/api/v2/pokemon-species/25/'
    },
    stats: [
      {
        base_stat: 35,
        effort: 0,
        stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' }
      },
      {
        base_stat: 55,
        effort: 0,
        stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' }
      }
    ],
    types: [
      {
        slot: 1,
        type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' }
      }
    ]
  }

  beforeEach(() => {
    // Configurar Pinia antes de cada test
    setActivePinia(createPinia())
    pokemonStore = usePokemonStore()
    
    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Limpiar mocks después de cada test
    vi.resetAllMocks()
  })

  describe('Estado inicial', () => {
    it('initializes with empty state', () => {
      expect(pokemonStore.pokemons).toEqual([])
      expect(pokemonStore.currentPokemon).toBeNull()
      expect(pokemonStore.totalCount).toBe(0)
      expect(pokemonStore.isLoading).toBe(false)
      expect(pokemonStore.error).toBeNull()
      expect(pokemonStore.currentPage).toBe(1)
      expect(pokemonStore.itemsPerPage).toBe(20)
      expect(pokemonStore.filters).toEqual({
        search: '',
        type: null
      })
    })
  })

  describe('fetchPokemons', () => {
    it('fetchPokemons updates state correctly', async () => {
      // Configurar mocks para respuesta exitosa
      const mockGetPokemonList = vi.mocked(getPokemonList)
      const mockGetPokemonById = vi.mocked(getPokemonById)
      
      mockGetPokemonList.mockResolvedValue(mockPokemonListResponse)
      mockGetPokemonById.mockResolvedValue(mockPokemon)

      // Ejecutar la acción
      await pokemonStore.fetchPokemons(1, true)

      // Verificar que el estado se actualizó correctamente
      expect(pokemonStore.isLoading).toBe(false)
      expect(pokemonStore.error).toBeNull()
      expect(pokemonStore.pokemons).toHaveLength(1)
      expect(pokemonStore.pokemons[0]).toEqual(mockPokemon)
      expect(pokemonStore.totalCount).toBe(1302)
      expect(pokemonStore.currentPage).toBe(1)

      // Verificar que los servicios fueron llamados correctamente
      expect(mockGetPokemonList).toHaveBeenCalledWith(20, 0)
      expect(mockGetPokemonById).toHaveBeenCalledWith(25)
    })

    it('fetchPokemons handles errors', async () => {
      // Configurar mock para error
      const mockGetPokemonList = vi.mocked(getPokemonList)
      const errorMessage = 'Error de conexión'
      
      mockGetPokemonList.mockRejectedValue(new Error(errorMessage))

      // Ejecutar la acción
      await pokemonStore.fetchPokemons(1, true)

      // Verificar que el estado de error se estableció
      expect(pokemonStore.isLoading).toBe(false)
      expect(pokemonStore.error).toBe(errorMessage)
      expect(pokemonStore.pokemons).toEqual([])
      expect(pokemonStore.totalCount).toBe(0)
    })
  })

  describe('fetchPokemonDetail', () => {
    it('fetchPokemonDetail sets currentPokemon', async () => {
      // Configurar mock para respuesta exitosa
      const mockGetPokemonById = vi.mocked(getPokemonById)
      mockGetPokemonById.mockResolvedValue(mockPokemon)

      // Ejecutar la acción
      const result = await pokemonStore.fetchPokemonDetail(25)

      // Verificar que el estado se actualizó correctamente
      expect(pokemonStore.isLoading).toBe(false)
      expect(pokemonStore.error).toBeNull()
      expect(pokemonStore.currentPokemon).toEqual(mockPokemon)
      expect(result).toEqual(mockPokemon)

      // Verificar que el servicio fue llamado correctamente
      expect(mockGetPokemonById).toHaveBeenCalledWith(25)
    })

    it('fetchPokemonDetail handles errors', async () => {
      // Configurar mock para error
      const mockGetPokemonById = vi.mocked(getPokemonById)
      const errorMessage = 'Pokémon no encontrado'
      
      mockGetPokemonById.mockRejectedValue(new Error(errorMessage))

      // Ejecutar la acción
      const result = await pokemonStore.fetchPokemonDetail(999)

      // Verificar que el estado de error se estableció
      expect(pokemonStore.isLoading).toBe(false)
      expect(pokemonStore.error).toBe(errorMessage)
      expect(pokemonStore.currentPokemon).toBeNull()
      expect(result).toBeNull()
    })
  })

  describe('Getters', () => {
    it('totalPages getter calculates correctly', () => {
      // Caso 1: Sin Pokémon
      expect(pokemonStore.totalPages).toBe(0)

      // Caso 2: Con datos
      pokemonStore.totalCount = 1302
      pokemonStore.itemsPerPage = 20
      expect(pokemonStore.totalPages).toBe(66) // Math.ceil(1302 / 20) = 66

      // Caso 3: Número exacto
      pokemonStore.totalCount = 100
      pokemonStore.itemsPerPage = 25
      expect(pokemonStore.totalPages).toBe(4) // Math.ceil(100 / 25) = 4

      // Caso 4: Con resto
      pokemonStore.totalCount = 101
      pokemonStore.itemsPerPage = 25
      expect(pokemonStore.totalPages).toBe(5) // Math.ceil(101 / 25) = 5
    })

    it('paginationInfo getter returns correct information', () => {
      // Configurar estado
      pokemonStore.totalCount = 100
      pokemonStore.currentPage = 3
      pokemonStore.itemsPerPage = 20

      const paginationInfo = pokemonStore.paginationInfo

      expect(paginationInfo).toEqual({
        startItem: 41, // ((3 - 1) * 20) + 1
        endItem: 60,   // Math.min(3 * 20, 100)
        totalItems: 100,
        currentPage: 3,
        totalPages: 5  // Math.ceil(100 / 20)
      })
    })

    it('filteredPokemons returns all pokemons when no filters', () => {
      // Agregar Pokémon al store
      pokemonStore.pokemons = [mockPokemon]

      expect(pokemonStore.filteredPokemons).toEqual([mockPokemon])
    })

    it('hasActiveFilters returns correct value', () => {
      // Sin filtros
      expect(pokemonStore.hasActiveFilters).toBe(false)

      // Con filtro de búsqueda
      pokemonStore.filters.search = 'pikachu'
      expect(pokemonStore.hasActiveFilters).toBe(true)

      // Limpiar búsqueda, agregar filtro de tipo
      pokemonStore.filters.search = ''
      pokemonStore.filters.type = 'electric'
      expect(pokemonStore.hasActiveFilters).toBe(true)

      // Con ambos filtros
      pokemonStore.filters.search = 'pikachu'
      expect(pokemonStore.hasActiveFilters).toBe(true)
    })
  })

  describe('Acciones de filtros', () => {
    it('updateFilters updates filters correctly', () => {
      // Actualizar filtros
      pokemonStore.updateFilters({ search: 'pikachu' })
      expect(pokemonStore.filters.search).toBe('pikachu')
      expect(pokemonStore.filters.type).toBeNull()

      // Actualizar tipo
      pokemonStore.updateFilters({ type: 'electric' })
      expect(pokemonStore.filters.search).toBe('pikachu')
      expect(pokemonStore.filters.type).toBe('electric')
    })

    it('clearFilters resets all filters', () => {
      // Establecer filtros
      pokemonStore.filters.search = 'pikachu'
      pokemonStore.filters.type = 'electric'

      // Limpiar filtros
      pokemonStore.clearFilters()

      expect(pokemonStore.filters).toEqual({
        search: '',
        type: null
      })
    })
  })

  describe('Acciones de utilidad', () => {
    it('resetError clears error state', () => {
      // Establecer error
      pokemonStore.error = 'Test error'

      // Limpiar error
      pokemonStore.resetError()

      expect(pokemonStore.error).toBeNull()
    })

    it('clearCurrentPokemon clears current pokemon', () => {
      // Establecer Pokémon actual
      pokemonStore.currentPokemon = mockPokemon

      // Limpiar Pokémon actual
      pokemonStore.clearCurrentPokemon()

      expect(pokemonStore.currentPokemon).toBeNull()
    })

    it('resetStore resets all state to initial values', () => {
      // Establecer estado
      pokemonStore.pokemons = [mockPokemon]
      pokemonStore.currentPokemon = mockPokemon
      pokemonStore.totalCount = 100
      pokemonStore.currentPage = 3
      pokemonStore.isLoading = true
      pokemonStore.error = 'Test error'
      pokemonStore.filters.search = 'pikachu'
      pokemonStore.filters.type = 'electric'

      // Resetear store
      pokemonStore.resetStore()

      // Verificar que todo volvió al estado inicial
      expect(pokemonStore.pokemons).toEqual([])
      expect(pokemonStore.currentPokemon).toBeNull()
      expect(pokemonStore.totalCount).toBe(0)
      expect(pokemonStore.currentPage).toBe(1)
      expect(pokemonStore.isLoading).toBe(false)
      expect(pokemonStore.error).toBeNull()
      expect(pokemonStore.filters).toEqual({
        search: '',
        type: null
      })
    })
  })
})
