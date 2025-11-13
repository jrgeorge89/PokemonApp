/**
 * Interfaces TypeScript para PokéAPI
 * Basadas en la estructura oficial de https://pokeapi.co/api/v2/
 */

// =====================================
// ENUMS Y TYPES
// =====================================

/**
 * Object con todos los tipos de Pokémon disponibles en la PokéAPI
 * Utilizado para type safety y autocompletado en toda la aplicación
 */
export const PokemonTypeEnum = {
  NORMAL: 'normal',
  FIRE: 'fire',
  WATER: 'water',
  ELECTRIC: 'electric',
  GRASS: 'grass',
  ICE: 'ice',
  FIGHTING: 'fighting',
  POISON: 'poison',
  GROUND: 'ground',
  FLYING: 'flying',
  PSYCHIC: 'psychic',
  BUG: 'bug',
  ROCK: 'rock',
  GHOST: 'ghost',
  DRAGON: 'dragon',
  DARK: 'dark',
  STEEL: 'steel',
  FAIRY: 'fairy'
} as const

/**
 * Type union con los nombres específicos de las estadísticas de Pokémon
 * Usado para garantizar type safety al acceder a stats específicas
 */
export type PokemonStatName =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed'

/**
 * Type union con todos los nombres de tipos de Pokémon
 * Derivado del objeto PokemonTypeEnum para mantener consistencia
 */
export type PokemonTypeName = typeof PokemonTypeEnum[keyof typeof PokemonTypeEnum]

// =====================================
// INTERFACES BÁSICAS
// =====================================

/**
 * Interface estándar para recursos nombrados en PokéAPI
 * Utilizado por la mayoría de referencias a otros recursos
 */
export interface NamedAPIResource {
  /** Nombre identificador del recurso */
  name: string
  /** URL completa para obtener los detalles del recurso */
  url: string
}

/**
 * Interface básica para recursos de API
 * Utilizado cuando solo se necesita la URL del recurso
 */
export interface APIResource {
  /** URL completa del recurso */
  url: string
}

// =====================================
// INTERFACES PARA POKÉMON LIST
// =====================================

/**
 * Interface para items individuales en la lista de Pokémon de PokéAPI
 * Representa la información básica de cada Pokémon en endpoints de listado
 */
export interface PokemonListItem {
  /** Nombre del Pokémon */
  name: string
  /** URL para obtener los detalles completos del Pokémon */
  url: string
}

/**
 * Interface para la respuesta paginada de la lista de Pokémon
 * Utilizada por el endpoint GET /pokemon/ de PokéAPI
 */
export interface PokemonListResponse {
  /** Número total de Pokémon disponibles */
  count: number
  /** URL para la siguiente página (null si es la última) */
  next: string | null
  /** URL para la página anterior (null si es la primera) */
  previous: string | null
  /** Array de Pokémon en la página actual */
  results: PokemonListItem[]
}

// =====================================
// INTERFACES PARA POKÉMON DETAIL
// =====================================

export interface PokemonSprites {
  back_default: string | null
  back_female: string | null
  back_shiny: string | null
  back_shiny_female: string | null
  front_default: string | null
  front_female: string | null
  front_shiny: string | null
  front_shiny_female: string | null
  other: {
    dream_world: {
      front_default: string | null
      front_female: string | null
    }
    home: {
      front_default: string | null
      front_female: string | null
      front_shiny: string | null
      front_shiny_female: string | null
    }
    'official-artwork': {
      front_default: string | null
      front_shiny: string | null
    }
    showdown: {
      back_default: string | null
      back_female: string | null
      back_shiny: string | null
      back_shiny_female: string | null
      front_default: string | null
      front_female: string | null
      front_shiny: string | null
      front_shiny_female: string | null
    }
  }
  versions: {
    [generation: string]: {
      [game: string]: {
        back_default?: string | null
        back_female?: string | null
        back_gray?: string | null
        back_shiny?: string | null
        back_shiny_female?: string | null
        back_transparent?: string | null
        front_default?: string | null
        front_female?: string | null
        front_gray?: string | null
        front_shiny?: string | null
        front_shiny_female?: string | null
        front_transparent?: string | null
      }
    }
  }
}

/**
 * Interface para tipos de Pokémon con su posición
 * Un Pokémon puede tener 1 o 2 tipos (ej: Fuego/Volador)
 */
export interface PokemonType {
  /** Posición del tipo (1 para primario, 2 para secundario) */
  slot: number
  /** Referencia al tipo de Pokémon */
  type: NamedAPIResource
}

/**
 * Interface para habilidades de Pokémon
 * Incluye habilidades normales y ocultas
 */
export interface PokemonAbility {
  /** Referencia a la habilidad */
  ability: NamedAPIResource
  /** Verdadero si es una habilidad oculta */
  is_hidden: boolean
  /** Posición de la habilidad */
  slot: number
}

/**
 * Interface para estadísticas base de Pokémon
 * Incluye las 6 stats principales (HP, Ataque, Defensa, etc.)
 */
export interface PokemonStat {
  /** Valor base de la estadística */
  base_stat: number
  /** Puntos de esfuerzo ganados al derrotar este Pokémon */
  effort: number
  /** Referencia al tipo de estadística */
  stat: NamedAPIResource
}

export interface PokemonHeldItem {
  item: NamedAPIResource
  version_details: {
    rarity: number
    version: NamedAPIResource
  }[]
}

export interface PokemonMove {
  move: NamedAPIResource
  version_group_details: {
    level_learned_at: number
    move_learn_method: NamedAPIResource
    version_group: NamedAPIResource
  }[]
}

export interface PokemonGameIndex {
  game_index: number
  version: NamedAPIResource
}

export interface PokemonPastType {
  generation: NamedAPIResource
  types: PokemonType[]
}

export interface PokemonCries {
  latest: string
  legacy: string
}

// =====================================
// INTERFACE PRINCIPAL DE POKÉMON
// =====================================

export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  is_default: boolean
  order: number
  weight: number
  abilities: PokemonAbility[]
  forms: NamedAPIResource[]
  game_indices: PokemonGameIndex[]
  held_items: PokemonHeldItem[]
  location_area_encounters: string
  moves: PokemonMove[]
  past_types: PokemonPastType[]
  sprites: PokemonSprites
  cries: PokemonCries
  species: NamedAPIResource
  stats: PokemonStat[]
  types: PokemonType[]
}

// =====================================
// INTERFACES PARA TYPES
// =====================================

export interface TypeEffectiveness {
  damage_relations: {
    double_damage_from: NamedAPIResource[]
    double_damage_to: NamedAPIResource[]
    half_damage_from: NamedAPIResource[]
    half_damage_to: NamedAPIResource[]
    no_damage_from: NamedAPIResource[]
    no_damage_to: NamedAPIResource[]
  }
}

export interface PokemonTypeDetail {
  id: number
  name: string
  damage_relations: {
    double_damage_from: NamedAPIResource[]
    double_damage_to: NamedAPIResource[]
    half_damage_from: NamedAPIResource[]
    half_damage_to: NamedAPIResource[]
    no_damage_from: NamedAPIResource[]
    no_damage_to: NamedAPIResource[]
  }
  game_indices: {
    game_index: number
    generation: NamedAPIResource
  }[]
  generation: NamedAPIResource
  move_damage_class: NamedAPIResource | null
  names: {
    language: NamedAPIResource
    name: string
  }[]
  pokemon: {
    pokemon: NamedAPIResource
    slot: number
  }[]
  moves: NamedAPIResource[]
}

// =====================================
// INTERFACES PARA SPECIES
// =====================================

export interface PokemonSpecies {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: NamedAPIResource
  pokedex_numbers: {
    entry_number: number
    pokedex: NamedAPIResource
  }[]
  egg_groups: NamedAPIResource[]
  color: NamedAPIResource
  shape: NamedAPIResource
  evolves_from_species: NamedAPIResource | null
  evolution_chain: APIResource
  habitat: NamedAPIResource | null
  generation: NamedAPIResource
  names: {
    language: NamedAPIResource
    name: string
  }[]
  flavor_text_entries: {
    flavor_text: string
    language: NamedAPIResource
    version: NamedAPIResource
  }[]
  form_descriptions: {
    description: string
    language: NamedAPIResource
  }[]
  genera: {
    genus: string
    language: NamedAPIResource
  }[]
  varieties: {
    is_default: boolean
    pokemon: NamedAPIResource
  }[]
}

// =====================================
// INTERFACES PARA FILTROS Y UTILIDADES
// =====================================

export interface PokemonFilters {
  type?: string
  generation?: string
  search?: string
}

export interface PaginationInfo {
  offset: number
  limit: number
  total: number
  hasNext: boolean
  hasPrevious: boolean
}

// =====================================
// TYPES AUXILIARES
// =====================================
// (Types movidos al inicio del archivo para evitar duplicados)

// =====================================
// INTERFACES PARA UI/UX
// =====================================

/**
 * Interface simplificada para datos de tarjetas de Pokémon en la UI
 * Optimizada para rendimiento en listas y grids de Pokémon
 */
export interface PokemonCardData {
  /** ID único del Pokémon */
  id: number
  /** Nombre del Pokémon */
  name: string
  /** URL de la imagen principal del Pokémon */
  image: string
  /** Array de tipos del Pokémon */
  types: string[]
}

/**
 * Interface extendida para páginas de detalle de Pokémon
 * Incluye información adicional necesaria para la vista de detalle
 */
export interface PokemonDetailData extends PokemonCardData {
  /** Altura del Pokémon en decímetros */
  height: number
  /** Peso del Pokémon en hectogramos */
  weight: number
  /** Estadísticas base simplificadas */
  stats: {
    /** Nombre de la estadística */
    name: string
    /** Valor base de la estadística */
    value: number
  }[]
  /** Array de nombres de habilidades */
  abilities: string[]
  /** Nombre de la especie */
  species: string
}

// =====================================
// INTERFACES PARA API RESPONSES
// =====================================

/**
 * Interface para manejo consistente de errores en toda la aplicación
 * Proporciona información estructurada sobre errores de API y de la aplicación
 */
export interface ApiError {
  /** Mensaje principal del error */
  message: string
  /** Código de estado HTTP del error (si aplica) */
  status?: number
  /** Información adicional sobre el error */
  detail?: string
  /** Tipo de error para categorización */
  type?: 'network' | 'validation' | 'server' | 'client' | 'unknown'
  /** Timestamp del error */
  timestamp?: string
  /** Campo específico que causó el error (para errores de validación) */
  field?: string
}

/**
 * Interface genérica para respuestas de API con manejo de estados
 * Utilizada en composables y stores para mantener consistencia
 */
export interface APIResponse<T> {
  /** Datos de la respuesta (null si hay error o está cargando) */
  data: T | null
  /** Información del error (null si no hay error) */
  error: ApiError | null
  /** Estado de carga de la petición */
  loading: boolean
}

/**
 * Interface mejorada para información detallada de tipos de Pokémon
 * Extiende la información básica con datos adicionales para la UI
 */
export interface PokemonTypeDetailEnhanced extends PokemonTypeDetail {
  /** Color asociado al tipo (desde Tailwind config) */
  color?: string
  /** Descripción en español del tipo */
  description?: string
  /** Efectividad resumida contra otros tipos */
  effectiveness?: {
    /** Tipos contra los que es súper efectivo */
    strongAgainst: string[]
    /** Tipos contra los que es poco efectivo */
    weakAgainst: string[]
    /** Tipos que no afecta */
    noEffectAgainst: string[]
    /** Tipos de los que recibe doble daño */
    weakTo: string[]
    /** Tipos de los que recibe medio daño */
    resistantTo: string[]
    /** Tipos de los que no recibe daño */
    immuneTo: string[]
  }
}