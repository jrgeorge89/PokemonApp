/**
 * Store de Pinia para la gestión de filtros de Pokémon
 * Maneja búsqueda, filtrado por tipo y estado de filtros activos
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { PokemonTypeDetail, ApiError } from '../types/pokemon.types'
import { getAllTypes } from '../services/pokemon.service'

/**
 * Interface para la configuración actual de filtros
 */
interface FilterConfig {
  searchQuery: string
  selectedType: string | null
  hasActiveFilters: boolean
  filtersApplied: number
}

/**
 * Store para la gestión de filtros de Pokémon
 * Utiliza Composition API de Pinia con debouncing para búsqueda optimizada
 */
export const useFilterStore = defineStore('filter', () => {
  // =====================================
  // STATE - Referencias reactivas
  // =====================================

  /** Término de búsqueda actual (sin debounce) */
  const searchQuery = ref<string>('')

  /** Término de búsqueda con debounce aplicado */
  const debouncedSearchQuery = ref<string>('')

  /** Tipo de Pokémon seleccionado para filtrar */
  const selectedType = ref<string | null>(null)

  /** Lista de tipos disponibles cargados desde la API */
  const availableTypes = ref<string[]>([])

  /** Estado de carga para la obtención de tipos */
  const isLoadingTypes = ref<boolean>(false)

  /** Error al cargar tipos desde la API */
  const typesError = ref<string | null>(null)

  /** Timer para el debounce de búsqueda */
  let searchDebounceTimer: number | null = null

  /** Duración del debounce en milisegundos */
  const DEBOUNCE_DELAY = 300

  // =====================================
  // WATCHERS - Efectos reactivos
  // =====================================

  /**
   * Watcher para implementar debouncing en la búsqueda
   * Se ejecuta cuando cambia searchQuery y aplica delay antes de actualizar debouncedSearchQuery
   */
  watch(
    searchQuery,
    (newQuery: string) => {
      // Limpiar timer anterior si existe
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }

      // Configurar nuevo timer
      searchDebounceTimer = setTimeout(() => {
        debouncedSearchQuery.value = newQuery.trim()
        console.log(`Search debounced: "${debouncedSearchQuery.value}"`)
      }, DEBOUNCE_DELAY)
    },
    { immediate: true }
  )

  // =====================================
  // GETTERS - Propiedades computadas
  // =====================================

  /**
   * Verifica si hay filtros activos
   * Incluye tanto búsqueda (con debounce) como filtro de tipo
   */
  const hasActiveFilters = computed((): boolean => {
    return debouncedSearchQuery.value.length > 0 || selectedType.value !== null
  })

  /**
   * Configuración actual de filtros para uso en componentes
   * Proporciona un objeto consolidado con toda la información de filtros
   */
  const filterConfig = computed((): FilterConfig => {
    const searchActive = debouncedSearchQuery.value.length > 0
    const typeActive = selectedType.value !== null
    const filtersCount = (searchActive ? 1 : 0) + (typeActive ? 1 : 0)

    return {
      searchQuery: debouncedSearchQuery.value,
      selectedType: selectedType.value,
      hasActiveFilters: hasActiveFilters.value,
      filtersApplied: filtersCount
    }
  })

  /**
   * Query de búsqueda actual (sin debounce) para binding en inputs
   */
  const currentSearchQuery = computed({
    get: () => searchQuery.value,
    set: (value: string) => setSearchQuery(value)
  })

  /**
   * Tipo seleccionado actual para binding en selects
   */
  const currentSelectedType = computed({
    get: () => selectedType.value,
    set: (value: string | null) => setSelectedType(value)
  })

  /**
   * Lista de tipos formateados para uso en componentes de UI
   */
  const typesForSelect = computed(() => {
    return availableTypes.value.map((type: string) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      displayName: type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    }))
  })

  /**
   * Información del estado de carga de tipos
   */
  const typesLoadingState = computed(() => ({
    isLoading: isLoadingTypes.value,
    hasError: typesError.value !== null,
    error: typesError.value,
    hasTypes: availableTypes.value.length > 0
  }))

  // =====================================
  // ACTIONS - Funciones del store
  // =====================================

  /**
   * Actualiza el término de búsqueda con debouncing automático
   * El debounce se maneja automáticamente a través del watcher
   * 
   * @param query - Nuevo término de búsqueda
   */
  function setSearchQuery(query: string): void {
    // Validar entrada
    if (typeof query !== 'string') {
      console.warn('Search query must be a string')
      return
    }

    // Actualizar query inmediatamente (para UI responsiva)
    searchQuery.value = query

    console.log(`Search query updated: "${query}" (debounced in ${DEBOUNCE_DELAY}ms)`)
  }

  /**
   * Cambia el filtro de tipo seleccionado
   * 
   * @param type - Tipo de Pokémon a filtrar, null para remover filtro
   */
  function setSelectedType(type: string | null): void {
    // Validar entrada
    if (type !== null && typeof type !== 'string') {
      console.warn('Selected type must be a string or null')
      return
    }

    // Validar que el tipo existe en la lista de disponibles
    if (type !== null && availableTypes.value.length > 0) {
      if (!availableTypes.value.includes(type)) {
        console.warn(`Type "${type}" is not available in the types list`)
        return
      }
    }

    selectedType.value = type
    console.log(`Selected type updated: ${type || 'None'}`)
  }

  /**
   * Limpia todos los filtros activos
   * Resetea tanto búsqueda como tipo seleccionado
   */
  function clearFilters(): void {
    // Limpiar timer de debounce si está activo
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }

    // Resetear estado
    searchQuery.value = ''
    debouncedSearchQuery.value = ''
    selectedType.value = null

    console.log('All filters cleared')
  }

  /**
   * Limpia solo el filtro de búsqueda
   */
  function clearSearchFilter(): void {
    setSearchQuery('')
  }

  /**
   * Limpia solo el filtro de tipo
   */
  function clearTypeFilter(): void {
    setSelectedType(null)
  }

  /**
   * Carga los tipos de Pokémon disponibles desde la API
   * Se ejecuta automáticamente al inicializar el store o bajo demanda
   */
  async function loadAvailableTypes(): Promise<void> {
    try {
      isLoadingTypes.value = true
      typesError.value = null

      console.log('Loading available Pokémon types from API...')

      // Obtener tipos desde la API
      const types: PokemonTypeDetail[] = await getAllTypes()

      // Extraer nombres de tipos y ordenarlos alfabéticamente
      const typeNames = types
        .map((type: PokemonTypeDetail) => type.name)
        .sort((a: string, b: string) => a.localeCompare(b))

      // Actualizar estado
      availableTypes.value = typeNames

      console.log(`Successfully loaded ${typeNames.length} Pokémon types:`, typeNames)

    } catch (err) {
      console.error('Error loading available types:', err)

      // Manejar error
      if (err instanceof Error) {
        typesError.value = err.message
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        typesError.value = (err as ApiError).message
      } else {
        typesError.value = 'Error desconocido al cargar los tipos de Pokémon'
      }

      // Fallback: usar tipos básicos conocidos si falla la API
      availableTypes.value = [
        'normal',
        'fire',
        'water',
        'electric',
        'grass',
        'ice',
        'fighting',
        'poison',
        'ground',
        'flying',
        'psychic',
        'bug',
        'rock',
        'ghost',
        'dragon',
        'dark',
        'steel',
        'fairy'
      ]

      console.log('Using fallback types due to API error')

    } finally {
      isLoadingTypes.value = false
    }
  }

  /**
   * Reintenta cargar tipos en caso de error
   */
  async function retryLoadTypes(): Promise<void> {
    typesError.value = null
    await loadAvailableTypes()
  }

  /**
   * Aplica filtros predefinidos de manera programática
   * Útil para navegación y enlaces directos
   * 
   * @param filters - Filtros a aplicar
   */
  function applyFilters(filters: {
    searchQuery?: string
    selectedType?: string | null
  }): void {
    if (filters.searchQuery !== undefined) {
      setSearchQuery(filters.searchQuery)
    }

    if (filters.selectedType !== undefined) {
      setSelectedType(filters.selectedType)
    }

    console.log('Filters applied programmatically:', filters)
  }

  /**
   * Obtiene estadísticas de uso de filtros
   */
  const getFilterStats = computed(() => ({
    totalTypes: availableTypes.value.length,
    hasSearchQuery: debouncedSearchQuery.value.length > 0,
    searchQueryLength: debouncedSearchQuery.value.length,
    hasTypeFilter: selectedType.value !== null,
    activeFiltersCount: filterConfig.value.filtersApplied,
    isAnyFilterActive: hasActiveFilters.value
  }))

  // =====================================
  // INITIALIZATION
  // =====================================

  /**
   * Inicialización automática del store
   * Carga tipos disponibles al crear la instancia
   */
  function initializeStore(): void {
    if (availableTypes.value.length === 0) {
      loadAvailableTypes()
    }
  }

  // Ejecutar inicialización
  initializeStore()

  // =====================================
  // CLEANUP
  // =====================================

  /**
   * Limpieza del store para evitar memory leaks
   */
  function cleanup(): void {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = null
    }
    console.log('Filter store cleanup completed')
  }

  // =====================================
  // RETURN - API del store
  // =====================================

  return {
    // State
    searchQuery: currentSearchQuery,
    debouncedSearchQuery: computed(() => debouncedSearchQuery.value),
    selectedType: currentSelectedType,
    availableTypes,
    isLoadingTypes,
    typesError,

    // Getters
    hasActiveFilters,
    filterConfig,
    typesForSelect,
    typesLoadingState,
    getFilterStats,

    // Actions
    setSearchQuery,
    setSelectedType,
    clearFilters,
    clearSearchFilter,
    clearTypeFilter,
    loadAvailableTypes,
    retryLoadTypes,
    applyFilters,
    cleanup
  }
})

// =====================================
// EXPORT TYPE
// =====================================

/**
 * Tipo para el store de filtros
 * Útil para tipado en composables y componentes
 */
export type FilterStore = ReturnType<typeof useFilterStore>

export default useFilterStore