/**
 * Utilidades y helpers específicos para Pokémon
 * 
 * @description
 * Conjunto de funciones helper para formateo, conversión y manipulación
 * de datos relacionados con Pokémon, incluyendo colores, formatos,
 * estadísticas y conversiones de unidades.
 */


/**
 * Mapa de colores Tailwind para cada tipo de Pokémon
 */
const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400 text-white',
  fire: 'bg-red-500 text-white',
  water: 'bg-blue-500 text-white',
  electric: 'bg-yellow-400 text-gray-900',
  grass: 'bg-green-500 text-white',
  ice: 'bg-blue-300 text-gray-900',
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
  fairy: 'bg-pink-300 text-gray-900'
}

/**
 * Constantes para cálculos de estadísticas
 */
const STAT_MAX_VALUE = 255
const STAT_THRESHOLDS = {
  HIGH: 100,
  MEDIUM: 50
} as const

/**
 * Obtiene las clases CSS de color Tailwind para un tipo de Pokémon
 * 
 * @param {string} typeName - Nombre del tipo de Pokémon
 * @returns {string} Clases CSS de Tailwind para el tipo
 * 
 * @example
 * ```ts
 * getPokemonTypeColor('fire') // 'bg-red-500 text-white'
 * getPokemonTypeColor('water') // 'bg-blue-500 text-white'
 * getPokemonTypeColor('unknown') // 'bg-gray-400 text-white'
 * ```
 */
export function getPokemonTypeColor(typeName: string): string {
  const normalizedType = typeName.toLowerCase().trim()
  return POKEMON_TYPE_COLORS[normalizedType] ?? POKEMON_TYPE_COLORS['normal']!
}

/**
 * Formatea el ID de un Pokémon con ceros a la izquierda y prefijo #
 * 
 * @param {number} id - ID numérico del Pokémon
 * @returns {string} ID formateado con formato "#001", "#025", etc.
 * 
 * @example
 * ```ts
 * formatPokemonId(1) // '#001'
 * formatPokemonId(25) // '#025'
 * formatPokemonId(150) // '#150'
 * formatPokemonId(1000) // '#1000'
 * ```
 */
export function formatPokemonId(id: number): string {
  if (!Number.isInteger(id) || id < 0) {
    console.warn(`ID de Pokémon inválido: ${id}. Usando 0.`)
    return '#000'
  }
  
  // Pad con ceros hasta mínimo 3 dígitos
  const paddedId = id.toString().padStart(3, '0')
  return `#${paddedId}`
}

/**
 * Capitaliza la primera letra de un texto
 * 
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con la primera letra en mayúscula
 * 
 * @example
 * ```ts
 * capitalize('pikachu') // 'Pikachu'
 * capitalize('CHARIZARD') // 'Charizard'
 * capitalize('') // ''
 * capitalize('a') // 'A'
 * ```
 */
export function capitalize(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convierte decímetros a metros con formato legible
 * 
 * @param {number} decimeters - Altura en decímetros
 * @returns {string} Altura formateada en metros (ej: "1.2 m")
 * 
 * @example
 * ```ts
 * formatHeight(7) // '0.7 m'
 * formatHeight(12) // '1.2 m'
 * formatHeight(25) // '2.5 m'
 * formatHeight(0) // '0.0 m'
 * ```
 */
export function formatHeight(decimeters: number): string {
  if (!Number.isFinite(decimeters) || decimeters < 0) {
    console.warn(`Altura inválida: ${decimeters}. Usando 0.`)
    return '0.0 m'
  }
  
  const meters = decimeters / 10
  return `${meters.toFixed(1)} m`
}

/**
 * Convierte hectogramos a kilogramos con formato legible
 * 
 * @param {number} hectograms - Peso en hectogramos
 * @returns {string} Peso formateado en kilogramos (ej: "6.9 kg")
 * 
 * @example
 * ```ts
 * formatWeight(69) // '6.9 kg'
 * formatWeight(130) // '13.0 kg'
 * formatWeight(8) // '0.8 kg'
 * formatWeight(0) // '0.0 kg'
 * ```
 */
export function formatWeight(hectograms: number): string {
  if (!Number.isFinite(hectograms) || hectograms < 0) {
    console.warn(`Peso inválido: ${hectograms}. Usando 0.`)
    return '0.0 kg'
  }
  
  const kilograms = hectograms / 10
  return `${kilograms.toFixed(1)} kg`
}

/**
 * Calcula el porcentaje de una estadística base sobre el máximo posible
 * 
 * @param {number} baseStat - Valor de la estadística base
 * @returns {number} Porcentaje de 0 a 100
 * 
 * @example
 * ```ts
 * getStatPercentage(128) // 50.2 (aprox)
 * getStatPercentage(255) // 100
 * getStatPercentage(0) // 0
 * getStatPercentage(300) // 100 (máximo limitado)
 * ```
 */
export function getStatPercentage(baseStat: number): number {
  if (!Number.isFinite(baseStat) || baseStat < 0) {
    console.warn(`Estadística inválida: ${baseStat}. Usando 0.`)
    return 0
  }
  
  const percentage = (baseStat / STAT_MAX_VALUE) * 100
  return Math.min(Math.round(percentage * 10) / 10, 100) // Redondear a 1 decimal, máximo 100
}

/**
 * Obtiene las clases CSS de color para una estadística según su valor
 * 
 * @param {number} baseStat - Valor de la estadística base
 * @returns {string} Clases CSS de color Tailwind
 * 
 * @example
 * ```ts
 * getStatColor(120) // 'bg-green-500 text-white' (alto)
 * getStatColor(75) // 'bg-yellow-500 text-black' (medio)
 * getStatColor(30) // 'bg-red-500 text-white' (bajo)
 * ```
 */
export function getStatColor(baseStat: number): string {
  if (!Number.isFinite(baseStat) || baseStat < 0) {
    return 'bg-gray-400 text-white' // Color por defecto para valores inválidos
  }
  
  if (baseStat >= STAT_THRESHOLDS.HIGH) {
    return 'bg-green-500 text-white' // Alto: Verde
  } else if (baseStat >= STAT_THRESHOLDS.MEDIUM) {
    return 'bg-yellow-500 text-black' // Medio: Amarillo
  } else {
    return 'bg-red-500 text-white' // Bajo: Rojo
  }
}

/**
 * Obtiene el nombre de una estadística traducido al español
 * 
 * @param {string} statName - Nombre de la estadística en inglés
 * @returns {string} Nombre traducido al español
 * 
 * @example
 * ```ts
 * getStatName('hp') // 'HP'
 * getStatName('attack') // 'Ataque'
 * getStatName('special-defense') // 'Def. Especial'
 * ```
 */
export function getStatName(statName: string): string {
  const statTranslations: Record<string, string> = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'At. Especial',
    'special-defense': 'Def. Especial',
    speed: 'Velocidad'
  }
  
  const normalizedStatName = statName.toLowerCase().trim()
  return statTranslations[normalizedStatName] || capitalize(statName)
}

/**
 * Obtiene la descripción de rareza basada en la suma total de estadísticas
 * 
 * @param {number} totalStats - Suma total de todas las estadísticas base
 * @returns {string} Descripción de rareza
 * 
 * @example
 * ```ts
 * getRarityDescription(600) // 'Legendario'
 * getRarityDescription(450) // 'Raro'
 * getRarityDescription(300) // 'Común'
 * ```
 */
export function getRarityDescription(totalStats: number): string {
  if (!Number.isFinite(totalStats) || totalStats < 0) {
    return 'Desconocido'
  }
  
  if (totalStats >= 600) {
    return 'Legendario'
  } else if (totalStats >= 500) {
    return 'Muy Raro'
  } else if (totalStats >= 400) {
    return 'Raro'
  } else if (totalStats >= 300) {
    return 'Común'
  } else {
    return 'Muy Común'
  }
}

/**
 * Formatea el nombre de una habilidad reemplazando guiones por espacios
 * 
 * @param {string} abilityName - Nombre de la habilidad
 * @returns {string} Nombre formateado y capitalizado
 * 
 * @example
 * ```ts
 * formatAbilityName('static') // 'Static'
 * formatAbilityName('lightning-rod') // 'Lightning Rod'
 * formatAbilityName('compound-eyes') // 'Compound Eyes'
 * ```
 */
export function formatAbilityName(abilityName: string): string {
  if (!abilityName || typeof abilityName !== 'string') {
    return ''
  }
  
  return abilityName
    .split('-')
    .map(word => capitalize(word))
    .join(' ')
}

/**
 * Genera un gradiente CSS personalizado para un tipo de Pokémon
 * 
 * @param {string} typeName - Nombre del tipo de Pokémon
 * @returns {string} Estilo CSS de gradiente
 * 
 * @example
 * ```ts
 * getPokemonTypeGradient('fire') // 'linear-gradient(135deg, #ef4444, #dc2626)'
 * getPokemonTypeGradient('water') // 'linear-gradient(135deg, #3b82f6, #2563eb)'
 * ```
 */
export function getPokemonTypeGradient(typeName: string): string {
  const typeGradients: Record<string, string> = {
    normal: 'linear-gradient(135deg, #9ca3af, #6b7280)',
    fire: 'linear-gradient(135deg, #ef4444, #dc2626)',
    water: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    electric: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    grass: 'linear-gradient(135deg, #10b981, #059669)',
    ice: 'linear-gradient(135deg, #93c5fd, #60a5fa)',
    fighting: 'linear-gradient(135deg, #b91c1c, #991b1b)',
    poison: 'linear-gradient(135deg, #a855f7, #9333ea)',
    ground: 'linear-gradient(135deg, #ca8a04, #a16207)',
    flying: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    psychic: 'linear-gradient(135deg, #ec4899, #db2777)',
    bug: 'linear-gradient(135deg, #22c55e, #16a34a)',
    rock: 'linear-gradient(135deg, #92400e, #78350f)',
    ghost: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    dragon: 'linear-gradient(135deg, #4338ca, #3730a3)',
    dark: 'linear-gradient(135deg, #374151, #1f2937)',
    steel: 'linear-gradient(135deg, #6b7280, #4b5563)',
    fairy: 'linear-gradient(135deg, #f9a8d4, #f472b6)'
  }
  
  const normalizedType = typeName.toLowerCase().trim()
  return typeGradients[normalizedType] ?? typeGradients['normal']!
}

// Exportar todas las constantes útiles
export {
  POKEMON_TYPE_COLORS,
  STAT_MAX_VALUE,
  STAT_THRESHOLDS
}

// Tipos TypeScript para las funciones
export type PokemonTypeColorMap = typeof POKEMON_TYPE_COLORS
export type StatThresholds = typeof STAT_THRESHOLDS