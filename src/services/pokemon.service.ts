/**
 * Servicio para interactuar con PokéAPI
 * Proporciona funciones tipadas para obtener datos de Pokémon y tipos
 */

import { apiClient, isApiError } from './api.config'
import type {
  Pokemon,
  PokemonListResponse,
  PokemonTypeDetail,
  NamedAPIResource,
  ApiError
} from '../types/pokemon.types'

/**
 * Obtiene una lista paginada de Pokémon
 * 
 * @param limit - Número máximo de Pokémon a obtener (máximo recomendado: 100)
 * @param offset - Número de Pokémon a saltar desde el inicio
 * @returns Promise con la respuesta paginada de Pokémon
 * 
 * @example
 * ```typescript
 * // Obtener los primeros 20 Pokémon
 * const pokemonList = await getPokemonList(20, 0)
 * 
 * // Obtener la segunda página de 20 Pokémon
 * const secondPage = await getPokemonList(20, 20)
 * ```
 */
export async function getPokemonList(
  limit: number = 20,
  offset: number = 0
): Promise<PokemonListResponse> {
  try {
    // Validar parámetros de entrada
    if (limit < 1 || limit > 1000) {
      throw {
        message: 'El límite debe estar entre 1 y 1000',
        type: 'validation',
        field: 'limit',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    if (offset < 0) {
      throw {
        message: 'El offset debe ser mayor o igual a 0',
        type: 'validation',
        field: 'offset',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    const response = await apiClient.get<PokemonListResponse>('/pokemon', {
      params: { limit, offset }
    })

    return response.data
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }
    throw {
      message: 'Error al obtener la lista de Pokémon',
      type: 'unknown',
      detail: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    } as ApiError
  }
}

/**
 * Obtiene un Pokémon específico por su nombre
 * 
 * @param name - Nombre del Pokémon (será convertido a minúsculas)
 * @returns Promise con los datos completos del Pokémon
 * 
 * @example
 * ```typescript
 * const pikachu = await getPokemonByName('Pikachu')
 * const charizard = await getPokemonByName('CHARIZARD')
 * ```
 */
export async function getPokemonByName(name: string): Promise<Pokemon> {
  try {
    // Validar que el nombre no esté vacío
    if (!name || name.trim().length === 0) {
      throw {
        message: 'El nombre del Pokémon es requerido',
        type: 'validation',
        field: 'name',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    // Convertir a minúsculas y limpiar espacios
    const cleanName = name.trim().toLowerCase()

    // Validar formato del nombre (solo letras, números y guiones)
    const nameRegex = /^[a-z0-9-]+$/
    if (!nameRegex.test(cleanName)) {
      throw {
        message: 'El nombre del Pokémon contiene caracteres inválidos. Solo se permiten letras, números y guiones.',
        type: 'validation',
        field: 'name',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    const response = await apiClient.get<Pokemon>(`/pokemon/${cleanName}`)
    return response.data
  } catch (error) {
    if (isApiError(error)) {
      // Personalizar mensaje para error 404
      if (error.status === 404) {
        error.message = `No se encontró ningún Pokémon con el nombre "${name}"`
      }
      throw error
    }
    throw {
      message: `Error al obtener el Pokémon "${name}"`,
      type: 'unknown',
      detail: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    } as ApiError
  }
}

/**
 * Obtiene un Pokémon específico por su ID
 * 
 * @param id - ID numérico del Pokémon (debe ser mayor a 0)
 * @returns Promise con los datos completos del Pokémon
 * 
 * @example
 * ```typescript
 * const pikachu = await getPokemonById(25)
 * const charizard = await getPokemonById(6)
 * ```
 */
export async function getPokemonById(id: number): Promise<Pokemon> {
  try {
    // Validar que el ID sea válido
    if (!Number.isInteger(id) || id < 1) {
      throw {
        message: 'El ID del Pokémon debe ser un número entero mayor a 0',
        type: 'validation',
        field: 'id',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    // Validar que el ID esté en el rango conocido de Pokémon
    if (id > 10000) {
      throw {
        message: 'El ID del Pokémon está fuera del rango válido (1-10000)',
        type: 'validation',
        field: 'id',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    const response = await apiClient.get<Pokemon>(`/pokemon/${id}`)
    return response.data
  } catch (error) {
    if (isApiError(error)) {
      // Personalizar mensaje para error 404
      if (error.status === 404) {
        error.message = `No se encontró ningún Pokémon con el ID ${id}`
      }
      throw error
    }
    throw {
      message: `Error al obtener el Pokémon con ID ${id}`,
      type: 'unknown',
      detail: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    } as ApiError
  }
}

/**
 * Obtiene todos los tipos de Pokémon disponibles
 * 
 * @returns Promise con un array de todos los tipos de Pokémon con detalles completos
 * 
 * @example
 * ```typescript
 * const allTypes = await getAllTypes()
 * console.log('Tipos disponibles:', allTypes.map(type => type.name))
 * ```
 */
export async function getAllTypes(): Promise<PokemonTypeDetail[]> {
  try {
    // Primero obtenemos la lista de tipos
    const typeListResponse = await apiClient.get<{
      count: number
      results: NamedAPIResource[]
    }>('/type')

    // Luego obtenemos los detalles de cada tipo en paralelo
    const typeDetailsPromises = typeListResponse.data.results.map(async (typeRef) => {
      try {
        // Extraer el ID del tipo desde la URL
        const typeId = extractIdFromUrl(typeRef.url)
        const typeDetailResponse = await apiClient.get<PokemonTypeDetail>(`/type/${typeId}`)
        return typeDetailResponse.data
      } catch (error) {
        console.warn(`No se pudo obtener detalles del tipo: ${typeRef.name}`, error)
        // En caso de error con un tipo específico, continuamos con los demás
        return null
      }
    })

    const typeDetails = await Promise.all(typeDetailsPromises)
    
    // Filtrar tipos nulos (que fallaron al cargar) y ordenar por ID
    const validTypes = typeDetails
      .filter((type): type is PokemonTypeDetail => type !== null)
      .sort((a, b) => a.id - b.id)

    if (validTypes.length === 0) {
      throw {
        message: 'No se pudieron cargar los tipos de Pokémon',
        type: 'server',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    return validTypes
  } catch (error) {
    if (isApiError(error)) {
      throw error
    }
    throw {
      message: 'Error al obtener los tipos de Pokémon',
      type: 'unknown',
      detail: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    } as ApiError
  }
}

/**
 * Obtiene todos los Pokémon de un tipo específico
 * 
 * @param typeId - ID numérico del tipo de Pokémon
 * @returns Promise con un array de Pokémon completos de ese tipo
 * 
 * @example
 * ```typescript
 * // Obtener todos los Pokémon de tipo fuego (id: 10)
 * const firePokemon = await getPokemonsByType(10)
 * 
 * // Obtener todos los Pokémon de tipo agua (id: 11)
 * const waterPokemon = await getPokemonsByType(11)
 * ```
 */
export async function getPokemonsByType(typeId: number): Promise<Pokemon[]> {
  try {
    // Validar que el typeId sea válido
    if (!Number.isInteger(typeId) || typeId < 1) {
      throw {
        message: 'El ID del tipo debe ser un número entero mayor a 0',
        type: 'validation',
        field: 'typeId',
        timestamp: new Date().toISOString()
      } as ApiError
    }

    // Obtener detalles del tipo, que incluye la lista de Pokémon
    const typeDetailResponse = await apiClient.get<PokemonTypeDetail>(`/type/${typeId}`)
    const typeDetail = typeDetailResponse.data

    // Extraer las referencias a Pokémon del tipo
    const pokemonRefs = typeDetail.pokemon.map(p => p.pokemon)

    if (pokemonRefs.length === 0) {
      return []
    }

    // Limitar la cantidad de Pokémon a obtener para evitar sobrecarga
    const maxPokemon = 50 // Límite razonable para evitar demasiadas peticiones
    const limitedRefs = pokemonRefs.slice(0, maxPokemon)

    // Obtener los datos completos de cada Pokémon en paralelo (con límite de concurrencia)
    const pokemonPromises = limitedRefs.map(async (pokemonRef, index) => {
      try {
        // Pequeño delay para evitar saturar la API
        if (index > 0 && index % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const pokemonId = extractIdFromUrl(pokemonRef.url)
        const pokemonResponse = await apiClient.get<Pokemon>(`/pokemon/${pokemonId}`)
        return pokemonResponse.data
      } catch (error) {
        console.warn(`No se pudo obtener datos del Pokémon: ${pokemonRef.name}`, error)
        return null
      }
    })

    const pokemonList = await Promise.all(pokemonPromises)
    
    // Filtrar Pokémon nulos (que fallaron al cargar) y ordenar por ID
    const validPokemon = pokemonList
      .filter((pokemon): pokemon is Pokemon => pokemon !== null)
      .sort((a, b) => a.id - b.id)

    return validPokemon
  } catch (error) {
    if (isApiError(error)) {
      // Personalizar mensaje para error 404
      if (error.status === 404) {
        error.message = `No se encontró ningún tipo de Pokémon con el ID ${typeId}`
      }
      throw error
    }
    throw {
      message: `Error al obtener Pokémon del tipo ${typeId}`,
      type: 'unknown',
      detail: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    } as ApiError
  }
}

// =====================================
// FUNCIONES DE UTILIDAD PRIVADAS
// =====================================

/**
 * Extrae el ID numérico de una URL de PokéAPI
 * 
 * @param url - URL de un recurso de PokéAPI
 * @returns ID numérico extraído de la URL
 * 
 * @example
 * extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/') // returns 25
 */
function extractIdFromUrl(url: string): number {
  const matches = url.match(/\/(\d+)\/?$/)
  if (!matches || !matches[1]) {
    throw {
      message: 'No se pudo extraer ID de la URL',
      type: 'client',
      detail: `URL inválida: ${url}`,
      timestamp: new Date().toISOString()
    } as ApiError
  }
  return parseInt(matches[1], 10)
}

// =====================================
// FUNCIONES DE UTILIDAD EXPORTADAS
// =====================================

/**
 * Busca Pokémon por nombre con tolerancia a errores tipográficos simples
 * 
 * @param name - Nombre a buscar
 * @returns Promise con el Pokémon encontrado o null si no existe
 * 
 * @example
 * ```typescript
 * const pokemon = await searchPokemonByName('pikahu') // Encuentra 'pikachu'
 * ```
 */
export async function searchPokemonByName(name: string): Promise<Pokemon | null> {
  try {
    return await getPokemonByName(name)
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      // Intentar buscar con variaciones comunes
      const variations = generateNameVariations(name)
      
      for (const variation of variations) {
        try {
          return await getPokemonByName(variation)
        } catch {
          // Continuar con la siguiente variación
          continue
        }
      }
      
      // Si no se encuentra ninguna variación, retornar null
      return null
    }
    
    // Re-lanzar otros tipos de errores
    throw error
  }
}

/**
 * Genera variaciones comunes de un nombre para búsqueda tolerante a errores
 */
function generateNameVariations(name: string): string[] {
  const clean = name.trim().toLowerCase()
  const variations: string[] = []
  
  // Remover espacios y caracteres especiales
  variations.push(clean.replace(/[^a-z0-9]/g, ''))
  
  // Reemplazar espacios con guiones
  variations.push(clean.replace(/\s+/g, '-'))
  
  // Solo la primera parte si tiene espacios
  if (clean.includes(' ')) {
    const firstPart = clean.split(' ')[0]
    if (firstPart) {
      variations.push(firstPart)
    }
  }
  
  return [...new Set(variations)].filter(v => v.length > 0)
}

/**
 * Verifica si un Pokémon tiene un tipo específico
 * 
 * @param pokemon - Objeto Pokémon a verificar
 * @param typeName - Nombre del tipo a buscar
 * @returns true si el Pokémon tiene ese tipo
 */
export function pokemonHasType(pokemon: Pokemon, typeName: string): boolean {
  return pokemon.types.some(typeSlot => 
    typeSlot.type.name.toLowerCase() === typeName.toLowerCase()
  )
}

/**
 * Obtiene la imagen principal de un Pokémon
 * 
 * @param pokemon - Objeto Pokémon
 * @returns URL de la imagen o null si no está disponible
 */
export function getPokemonMainImage(pokemon: Pokemon): string | null {
  // Prioridad: official-artwork > home > front_default
  return (
    pokemon.sprites.other['official-artwork']?.front_default ||
    pokemon.sprites.other.home?.front_default ||
    pokemon.sprites.front_default ||
    null
  )
}

export default {
  getPokemonList,
  getPokemonByName,
  getPokemonById,
  getAllTypes,
  getPokemonsByType,
  searchPokemonByName,
  pokemonHasType,
  getPokemonMainImage
}