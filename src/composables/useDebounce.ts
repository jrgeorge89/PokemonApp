import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * Composable para debouncing de valores reactivos
 * 
 * @description
 * Proporciona funcionalidad de debouncing para valores reactivos, útil para:
 * - Campos de búsqueda
 * - Validación de formularios
 * - Llamadas a API
 * - Cualquier operación que requiera retraso
 * 
 * @example
 * ```ts
 * const searchQuery = ref('')
 * const debouncedSearch = useDebounce(searchQuery, 300)
 * 
 * // El valor debounced se actualizará 300ms después del último cambio
 * watch(debouncedSearch, (newValue) => {
 *   console.log('Realizar búsqueda:', newValue)
 * })
 * ```
 * 
 * @example
 * ```ts
 * // Con valor inicial
 * const input = ref('inicial')
 * const debounced = useDebounce(input, 500)
 * ```
 * 
 * @example
 * ```ts
 * // Con objeto reactivo
 * const form = reactive({ name: '', email: '' })
 * const debouncedForm = useDebounce(form, 1000)
 * ```
 */

/**
 * Hook composable para debouncing de valores
 * 
 * @template T - Tipo del valor a debounce
 * @param {Ref<T> | T} value - Valor reactivo o valor inicial a observar
 * @param {number} delay - Retraso en milisegundos (default: 300ms)
 * @returns {Ref<T>} Valor debounced como ref reactivo
 */
export function useDebounce<T>(
  value: Ref<T> | T, 
  delay: number = 300
): Ref<T> {
  // Convertir el valor a ref si no lo es
  const sourceRef = ref(value) as Ref<T>
  
  // Ref para el valor debounced
  const debouncedValue = ref(sourceRef.value) as Ref<T>
  
  // Referencia al timeout para poder limpiarlo
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  /**
   * Limpia el timeout existente si existe
   */
  const clearExistingTimeout = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  /**
   * Actualiza el valor debounced después del delay
   * @param newValue - Nuevo valor a asignar
   */
  const updateDebouncedValue = (newValue: T): void => {
    clearExistingTimeout()
    
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
      timeoutId = null
    }, delay)
  }
  
  // Observar cambios en el valor fuente
  const stopWatcher = watch(
    sourceRef,
    (newValue: T) => {
      updateDebouncedValue(newValue)
    },
    {
      // Opciones del watcher
      deep: true, // Para objetos y arrays
      immediate: false // No ejecutar inmediatamente
    }
  )
  
  // Cleanup cuando el componente se desmonte
  onUnmounted(() => {
    clearExistingTimeout()
    stopWatcher()
  })
  
  return debouncedValue
}

/**
 * Versión alternativa que permite cancelar manualmente el debounce
 * 
 * @template T - Tipo del valor a debounce
 * @param {Ref<T> | T} value - Valor reactivo o valor inicial
 * @param {number} delay - Retraso en milisegundos
 * @returns {Object} Objeto con valor debounced y funciones de control
 * 
 * @example
 * ```ts
 * const searchQuery = ref('')
 * const { 
 *   debouncedValue, 
 *   cancel, 
 *   flush, 
 *   isPending 
 * } = useDebounceWithControls(searchQuery, 300)
 * 
 * // Cancelar debounce pendiente
 * cancel()
 * 
 * // Forzar actualización inmediata
 * flush()
 * 
 * // Verificar si hay debounce pendiente
 * console.log(isPending.value)
 * ```
 */
export function useDebounceWithControls<T>(
  value: Ref<T> | T,
  delay: number = 300
) {
  const sourceRef = ref(value) as Ref<T>
  const debouncedValue = ref(sourceRef.value) as Ref<T>
  const isPending = ref(false)
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let latestValue: T = sourceRef.value
  
  const clearExistingTimeout = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
      isPending.value = false
    }
  }
  
  const updateDebouncedValue = (newValue: T): void => {
    latestValue = newValue
    clearExistingTimeout()
    isPending.value = true
    
    timeoutId = setTimeout(() => {
      debouncedValue.value = latestValue
      timeoutId = null
      isPending.value = false
    }, delay)
  }
  
  /**
   * Cancela el debounce pendiente sin actualizar el valor
   */
  const cancel = (): void => {
    clearExistingTimeout()
  }
  
  /**
   * Fuerza la actualización inmediata del valor debounced
   */
  const flush = (): void => {
    if (timeoutId !== null) {
      clearExistingTimeout()
      debouncedValue.value = latestValue
    }
  }
  
  const stopWatcher = watch(
    sourceRef,
    (newValue: T) => {
      updateDebouncedValue(newValue)
    },
    { deep: true, immediate: false }
  )
  
  onUnmounted(() => {
    clearExistingTimeout()
    stopWatcher()
  })
  
  return {
    debouncedValue,
    cancel,
    flush,
    isPending
  }
}

// Export por defecto del composable básico
export default useDebounce

// Tipos TypeScript para mejor desarrollo
export interface DebounceComposable<T> {
  debouncedValue: Ref<T>
}

export interface DebounceWithControlsComposable<T> {
  debouncedValue: Ref<T>
  cancel: () => void
  flush: () => void
  isPending: Ref<boolean>
}