/**
 * Store de Pinia para la gestión del estado de UI
 * Maneja tema dark/light mode, sidebar móvil y persistencia en localStorage
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Tipos para el tema de la aplicación
 */
type Theme = 'light' | 'dark'

/**
 * Configuración del tema y localStorage
 */
const THEME_STORAGE_KEY = 'pokemon-app-theme'
const DEFAULT_THEME: Theme = 'light'

/**
 * Store para la gestión del estado de UI
 * Utiliza Composition API de Pinia para manejo de tema y sidebar
 */
export const useUiStore = defineStore('ui', () => {
  // =====================================
  // STATE - Referencias reactivas
  // =====================================

  /** Estado del tema oscuro */
  const isDarkMode = ref<boolean>(false)

  /** Estado del sidebar en móvil */
  const sidebarOpen = ref<boolean>(false)

  /** Estado de inicialización del tema */
  const themeInitialized = ref<boolean>(false)

  // =====================================
  // GETTERS - Propiedades computadas
  // =====================================

  /**
   * Retorna la clase de tema actual ('dark' o 'light')
   * Útil para aplicar clases CSS condicionalmente
   */
  const themeClass = computed((): Theme => {
    return isDarkMode.value ? 'dark' : 'light'
  })

  /**
   * Tema opuesto al actual
   * Útil para mostrar botones de "Cambiar a tema X"
   */
  const oppositeTheme = computed((): Theme => {
    return isDarkMode.value ? 'light' : 'dark'
  })

  /**
   * Configuración completa del tema para componentes
   */
  const themeConfig = computed(() => ({
    current: themeClass.value,
    opposite: oppositeTheme.value,
    isDark: isDarkMode.value,
    isLight: !isDarkMode.value,
    initialized: themeInitialized.value
  }))

  /**
   * Estado completo de UI para debugging y componentes avanzados
   */
  const uiState = computed(() => ({
    theme: themeConfig.value,
    sidebar: {
      isOpen: sidebarOpen.value,
      isClosed: !sidebarOpen.value
    },
    viewport: {
      // Detectar si estamos en móvil basado en el ancho de pantalla
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
      isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 768 : true
    }
  }))

  // =====================================
  // ACTIONS - Funciones del store
  // =====================================

  /**
   * Cambia entre tema claro y oscuro
   * Actualiza el DOM, persiste en localStorage y emite eventos
   */
  function toggleDarkMode(): void {
    try {
      // Cambiar estado
      isDarkMode.value = !isDarkMode.value
      const newTheme = themeClass.value

      console.log(`Theme toggled to: ${newTheme}`)

      // Aplicar clase al elemento HTML root
      updateRootClass(newTheme)

      // Persistir en localStorage
      saveThemeToStorage(newTheme)

      // Emitir evento personalizado para componentes que lo necesiten
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('theme-changed', {
          detail: { theme: newTheme, isDark: isDarkMode.value }
        }))
      }

    } catch (error) {
      console.error('Error toggling dark mode:', error)
      
      // Revertir cambio en caso de error
      isDarkMode.value = !isDarkMode.value
    }
  }

  /**
   * Establece un tema específico (sin toggle)
   * 
   * @param theme - Tema a aplicar ('light' | 'dark')
   */
  function setTheme(theme: Theme): void {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`Invalid theme: ${theme}. Using default: ${DEFAULT_THEME}`)
      theme = DEFAULT_THEME
    }

    const wasChanged = isDarkMode.value !== (theme === 'dark')
    
    if (wasChanged) {
      isDarkMode.value = theme === 'dark'
      updateRootClass(theme)
      saveThemeToStorage(theme)

      console.log(`Theme set to: ${theme}`)

      // Emitir evento solo si hubo cambio
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('theme-changed', {
          detail: { theme, isDark: isDarkMode.value }
        }))
      }
    }
  }

  /**
   * Inicializa el tema cargando la preferencia guardada o detectando sistema
   * Se ejecuta automáticamente al inicializar la aplicación
   */
  function initializeTheme(): void {
    try {
      let savedTheme: Theme | null = null

      // 1. Intentar cargar desde localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(THEME_STORAGE_KEY)
        if (stored === 'light' || stored === 'dark') {
          savedTheme = stored
          console.log(`Theme loaded from localStorage: ${savedTheme}`)
        }
      }

      // 2. Si no hay tema guardado, detectar preferencia del sistema
      if (!savedTheme && typeof window !== 'undefined' && window.matchMedia) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        savedTheme = prefersDark ? 'dark' : 'light'
        console.log(`Theme detected from system preference: ${savedTheme}`)
      }

      // 3. Fallback al tema por defecto
      const themeToApply = savedTheme || DEFAULT_THEME

      // Aplicar tema sin emitir eventos (es inicialización)
      isDarkMode.value = themeToApply === 'dark'
      updateRootClass(themeToApply)

      // Marcar como inicializado
      themeInitialized.value = true

      console.log(`Theme initialized: ${themeToApply}`)

      // Configurar listener para cambios de preferencia del sistema
      setupSystemThemeListener()

    } catch (error) {
      console.error('Error initializing theme:', error)
      
      // Fallback seguro
      isDarkMode.value = DEFAULT_THEME === 'dark'
      updateRootClass(DEFAULT_THEME)
      themeInitialized.value = true
    }
  }

  /**
   * Alterna el estado del sidebar móvil
   */
  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value
    console.log(`Sidebar toggled: ${sidebarOpen.value ? 'open' : 'closed'}`)

    // Emitir evento para componentes que necesiten reaccionar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sidebar-toggled', {
        detail: { isOpen: sidebarOpen.value }
      }))
    }
  }

  /**
   * Abre el sidebar móvil
   */
  function openSidebar(): void {
    if (!sidebarOpen.value) {
      sidebarOpen.value = true
      console.log('Sidebar opened')
    }
  }

  /**
   * Cierra el sidebar móvil
   */
  function closeSidebar(): void {
    if (sidebarOpen.value) {
      sidebarOpen.value = false
      console.log('Sidebar closed')
    }
  }

  /**
   * Resetea el estado de UI a valores por defecto
   */
  function resetUiState(): void {
    sidebarOpen.value = false
    setTheme(DEFAULT_THEME)
    console.log('UI state reset to defaults')
  }

  // =====================================
  // UTILITY FUNCTIONS - Funciones privadas
  // =====================================

  /**
   * Actualiza la clase 'dark' en el elemento HTML root
   * 
   * @param theme - Tema a aplicar
   */
  function updateRootClass(theme: Theme): void {
    if (typeof document === 'undefined') return

    try {
      const htmlElement = document.documentElement

      if (theme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }

      // También actualizar atributo data-theme para CSS adicional si necesario
      htmlElement.setAttribute('data-theme', theme)

    } catch (error) {
      console.error('Error updating root class:', error)
    }
  }

  /**
   * Guarda el tema en localStorage
   * 
   * @param theme - Tema a guardar
   */
  function saveThemeToStorage(theme: Theme): void {
    if (typeof window === 'undefined' || !window.localStorage) return

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error('Error saving theme to localStorage:', error)
    }
  }

  /**
   * Configura listener para cambios de preferencia del sistema
   */
  function setupSystemThemeListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      // Listener para cambios en la preferencia del sistema
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        // Solo aplicar si no hay preferencia guardada del usuario
        const hasUserPreference = localStorage.getItem(THEME_STORAGE_KEY)
        
        if (!hasUserPreference) {
          const systemTheme: Theme = e.matches ? 'dark' : 'light'
          setTheme(systemTheme)
          console.log(`System theme changed to: ${systemTheme}`)
        }
      }

      // Usar el método apropiado según compatibilidad del navegador
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange)
      } else {
        // Fallback para navegadores más antiguos
        mediaQuery.addListener(handleSystemThemeChange)
      }

    } catch (error) {
      console.error('Error setting up system theme listener:', error)
    }
  }

  /**
   * Limpia listeners y recursos
   */
  function cleanup(): void {
    // Aquí se pueden limpiar event listeners si es necesario
    console.log('UI store cleanup completed')
  }

  // =====================================
  // INITIALIZATION
  // =====================================

  /**
   * Inicialización automática del store
   */
  function initializeStore(): void {
    // Inicializar tema solo si estamos en el lado cliente
    if (typeof window !== 'undefined') {
      initializeTheme()
    } else {
      // SSR: usar tema por defecto
      isDarkMode.value = DEFAULT_THEME === 'dark'
      themeInitialized.value = true
    }
  }

  // Ejecutar inicialización
  initializeStore()

  // =====================================
  // RETURN - API del store
  // =====================================

  return {
    // State
    isDarkMode,
    sidebarOpen,
    themeInitialized,

    // Getters
    themeClass,
    oppositeTheme,
    themeConfig,
    uiState,

    // Actions
    toggleDarkMode,
    setTheme,
    initializeTheme,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    resetUiState,
    cleanup
  }
})

// =====================================
// EXPORT TYPE
// =====================================

/**
 * Tipo para el store de UI
 * Útil para tipado en composables y componentes
 */
export type UiStore = ReturnType<typeof useUiStore>

/**
 * Export del tipo Theme para uso en componentes
 */
export type { Theme }

export default useUiStore