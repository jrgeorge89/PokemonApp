import { ref, watchEffect } from 'vue'

/**
 * Composable para manejo del modo oscuro
 * 
 * @description
 * Proporciona funcionalidad completa para el modo oscuro incluyendo:
 * - Detección de preferencia del sistema
 * - Persistencia en localStorage
 * - Aplicación automática de clases CSS
 * 
 * @example
 * ```ts
 * const { isDarkMode, toggleDarkMode, initializeDarkMode } = useDarkMode()
 * 
 * // Inicializar al montar el componente
 * onMounted(() => {
 *   initializeDarkMode()
 * })
 * 
 * // Toggle manual
 * const handleToggle = () => {
 *   toggleDarkMode()
 * }
 * ```
 */

// Clave para localStorage
const DARK_MODE_KEY = 'pokemon-app-dark-mode'

// Estado reactivo del modo oscuro
const isDarkMode = ref<boolean>(false)

/**
 * Detecta la preferencia del sistema para modo oscuro
 * @returns {boolean} true si el sistema prefiere modo oscuro
 */
const getSystemPreference = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia && 
         window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Lee el tema guardado en localStorage
 * @returns {boolean | null} true/false si existe preferencia guardada, null si no existe
 */
const getSavedTheme = (): boolean | null => {
  if (typeof window === 'undefined') return null
  
  const saved = localStorage.getItem(DARK_MODE_KEY)
  if (saved === null) return null
  
  return saved === 'true'
}

/**
 * Guarda la preferencia de tema en localStorage
 * @param {boolean} darkMode - Estado del modo oscuro a guardar
 */
const saveTheme = (darkMode: boolean): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(DARK_MODE_KEY, darkMode.toString())
  } catch (error) {
    console.warn('No se pudo guardar la preferencia de tema:', error)
  }
}

/**
 * Aplica o remueve la clase 'dark' del elemento HTML
 * @param {boolean} darkMode - Si debe aplicar modo oscuro
 */
const applyDarkModeClass = (darkMode: boolean): void => {
  if (typeof window === 'undefined') return
  
  const htmlElement = document.documentElement
  
  if (darkMode) {
    htmlElement.classList.add('dark')
  } else {
    htmlElement.classList.remove('dark')
  }
}

/**
 * Inicializa el modo oscuro basado en prioridades:
 * 1. localStorage (preferencia guardada)
 * 2. Preferencia del sistema
 * 3. Modo claro por defecto
 */
const initializeDarkMode = (): void => {
  const savedTheme = getSavedTheme()
  
  if (savedTheme !== null) {
    // Usar preferencia guardada
    isDarkMode.value = savedTheme
  } else {
    // Usar preferencia del sistema o modo claro por defecto
    isDarkMode.value = getSystemPreference()
  }
  
  // Aplicar el tema inicial
  applyDarkModeClass(isDarkMode.value)
  
  // Guardar la decisión inicial si no existía
  if (savedTheme === null) {
    saveTheme(isDarkMode.value)
  }
}

/**
 * Alterna entre modo claro y oscuro
 */
const toggleDarkMode = (): void => {
  isDarkMode.value = !isDarkMode.value
}

/**
 * Establece el modo oscuro a un valor específico
 * @param {boolean} darkMode - Estado deseado del modo oscuro
 */
const setDarkMode = (darkMode: boolean): void => {
  isDarkMode.value = darkMode
}

// Watcher para sincronizar cambios automáticamente
watchEffect(() => {
  // Aplicar clase CSS cuando cambie el estado
  applyDarkModeClass(isDarkMode.value)
  
  // Guardar en localStorage cuando cambie el estado
  saveTheme(isDarkMode.value)
})

// Escuchar cambios en la preferencia del sistema
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const savedTheme = getSavedTheme()
    
    // Solo actualizar si no hay preferencia guardada del usuario
    if (savedTheme === null) {
      isDarkMode.value = e.matches
    }
  }
  
  // Escuchar cambios en la preferencia del sistema
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  // Cleanup function para remover el listener (útil en componentes)
  const cleanup = () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
  
  // Exportar cleanup para uso opcional
  Object.assign(useDarkMode, { cleanup })
}

/**
 * Hook composable para modo oscuro
 * @returns {Object} Objeto con estado y funciones del modo oscuro
 */
export function useDarkMode() {
  return {
    // Estado reactivo
    isDarkMode,
    
    // Funciones principales
    toggleDarkMode,
    setDarkMode,
    initializeDarkMode,
    
    // Funciones utilitarias
    getSavedTheme,
    getSystemPreference,
    
    // Constantes
    DARK_MODE_KEY
  }
}

// Export por defecto del composable
export default useDarkMode

// Tipos TypeScript para mejor desarrollo
export interface DarkModeComposable {
  isDarkMode: typeof isDarkMode
  toggleDarkMode: typeof toggleDarkMode
  setDarkMode: typeof setDarkMode
  initializeDarkMode: typeof initializeDarkMode
  getSavedTheme: typeof getSavedTheme
  getSystemPreference: typeof getSystemPreference
  DARK_MODE_KEY: typeof DARK_MODE_KEY
}