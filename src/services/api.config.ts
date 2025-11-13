/**
 * Configuración centralizada de Axios para PokéAPI
 * Incluye interceptors para manejo de errores y logging
 */

import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiError } from '../types/pokemon.types'

/**
 * URL base de la PokéAPI v2
 */
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

/**
 * Timeout por defecto para las peticiones (10 segundos)
 */
const DEFAULT_TIMEOUT = 10000

/**
 * Crear instancia de Axios configurada para PokéAPI
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: POKEAPI_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // User-Agent personalizado para identificar nuestra aplicación
    'User-Agent': 'Pokemon-Vue-App/1.0.0 (https://github.com/pokemon-vue-app)',
  },
})

/**
 * Interceptor de peticiones (requests)
 * Agrega logging en desarrollo y metadatos útiles
 */
apiClient.interceptors.request.use(
  (config) => {
    // Agregar timestamp a la petición
    config.metadata = { startTime: Date.now() }
    
    // Logging solo en desarrollo
    if (import.meta.env.DEV) {
      console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      console.log('Base URL:', config.baseURL)
      console.log('Full URL:', `${config.baseURL}${config.url}`)
      console.log('Headers:', config.headers)
      if (config.params) {
        console.log('Params:', config.params)
      }
      if (config.data) {
        console.log('Data:', config.data)
      }
      console.groupEnd()
    }

    return config
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error.message)
    }
    return Promise.reject(createApiError(error, 'client'))
  }
)

/**
 * Interceptor de respuestas (responses)
 * Maneja errores centralizadamente y transforma respuestas
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calcular tiempo de respuesta
    const endTime = Date.now()
    const startTime = response.config.metadata?.startTime || endTime
    const duration = endTime - startTime

    // Logging de respuestas exitosas en desarrollo
    if (import.meta.env.DEV) {
      console.group(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
      console.log('Status:', response.status, response.statusText)
      console.log('Duration:', `${duration}ms`)
      console.log('Data size:', JSON.stringify(response.data).length, 'characters')
      if (duration > 2000) {
        console.warn('⚠️ Slow response detected (>2s)')
      }
      console.groupEnd()
    }

    // Agregar metadatos útiles a la respuesta
    response.metadata = {
      duration,
      timestamp: new Date().toISOString(),
      cached: false, // Podría ser útil para implementar cache más adelante
    }

    return response
  },
  (error: AxiosError) => {
    // Transformar error de Axios a nuestro formato ApiError
    const apiError = createApiError(error)
    
    // Logging de errores en desarrollo
    if (import.meta.env.DEV) {
      console.group('❌ API Error')
      console.error('Error details:', apiError)
      console.error('Original error:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      }
      console.groupEnd()
    }

    return Promise.reject(apiError)
  }
)

/**
 * Función para crear objetos ApiError consistentes
 * Transforma errores de Axios al formato estándar de la aplicación
 */
function createApiError(error: AxiosError, type: ApiError['type'] = 'unknown'): ApiError {
  const apiError: ApiError = {
    message: 'Error desconocido',
    timestamp: new Date().toISOString(),
    type,
  }

  if (error.response) {
    // Error de respuesta del servidor (4xx, 5xx)
    apiError.status = error.response.status
    apiError.type = error.response.status >= 500 ? 'server' : 'client'
    
    // Extraer mensaje específico de la respuesta si está disponible
    if (error.response.data && typeof error.response.data === 'object') {
      const responseData = error.response.data as any
      apiError.message = responseData.message || responseData.detail || getStatusMessage(error.response.status)
      if (responseData.field) {
        apiError.field = responseData.field
      }
    } else {
      apiError.message = getStatusMessage(error.response.status)
    }
    
    apiError.detail = `HTTP ${error.response.status}: ${error.response.statusText}`
  } else if (error.request) {
    // Error de red (sin respuesta del servidor)
    apiError.type = 'network'
    apiError.message = 'Error de conexión. Verifique su conexión a internet.'
    apiError.detail = 'No se pudo conectar con el servidor de PokéAPI'
  } else {
    // Error en la configuración de la petición
    apiError.type = 'client'
    apiError.message = error.message || 'Error en la configuración de la petición'
    apiError.detail = error.message
  }

  return apiError
}

/**
 * Obtener mensaje amigable basado en el código de estado HTTP
 */
function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Petición incorrecta. Verifique los parámetros enviados.'
    case 401:
      return 'No autorizado. Verifique sus credenciales.'
    case 403:
      return 'Acceso prohibido.'
    case 404:
      return 'Recurso no encontrado. El Pokémon o endpoint solicitado no existe.'
    case 408:
      return 'Tiempo de espera agotado. Intente nuevamente.'
    case 429:
      return 'Demasiadas peticiones. Espere un momento antes de intentar nuevamente.'
    case 500:
      return 'Error interno del servidor. Intente más tarde.'
    case 502:
      return 'Puerta de enlace incorrecta. El servidor está temporalmente no disponible.'
    case 503:
      return 'Servicio no disponible. Intente más tarde.'
    case 504:
      return 'Tiempo de espera del servidor agotado.'
    default:
      return `Error ${status}: Ocurrió un problema inesperado.`
  }
}

/**
 * Función de utilidad para verificar si un error es de tipo ApiError
 */
export function isApiError(error: any): error is ApiError {
  return error && typeof error === 'object' && 'message' in error && 'type' in error
}

/**
 * Función de utilidad para crear peticiones GET con tipo de respuesta específico
 */
export async function get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  const response = await apiClient.get<T>(url, { params })
  return response.data
}

/**
 * Función de utilidad para manejar errores de red comunes
 */
export function handleNetworkError(error: ApiError): string {
  switch (error.type) {
    case 'network':
      return 'Sin conexión a internet. Verifique su conexión y vuelva a intentar.'
    case 'server':
      return 'El servidor de PokéAPI no está disponible. Intente más tarde.'
    case 'client':
      return 'Error en la aplicación. Recargue la página e intente nuevamente.'
    case 'validation':
      return `Error de validación${error.field ? ` en ${error.field}` : ''}: ${error.message}`
    default:
      return error.message || 'Ocurrió un error inesperado.'
  }
}

// Declaración para agregar metadatos a la configuración de Axios
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: number
    }
  }
  
  interface AxiosResponse {
    metadata?: {
      duration: number
      timestamp: string
      cached: boolean
    }
  }
}

export default apiClient