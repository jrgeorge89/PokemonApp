/**
 * Configuración de Vue Router 4 para la aplicación Pokémon
 * Maneja navegación entre vistas, rutas dinámicas y meta información
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'

/**
 * Definición de rutas de la aplicación
 * Incluye lazy loading para optimizar la carga inicial
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'Pokédex - Listado de Pokémon',
      description: 'Explora todos los Pokémon con búsqueda, filtros y paginación',
      requiresAuth: false,
      showInNavigation: true,
      icon: 'home'
    }
  },
  {
    path: '/pokemon/:id',
    name: 'pokemon-detail',
    component: () => import('../views/PokemonDetailView.vue'),
    props: true, // Pasa el parámetro id como prop al componente
    meta: {
      title: 'Detalles del Pokémon',
      description: 'Información detallada del Pokémon seleccionado',
      requiresAuth: false,
      showInNavigation: false,
      parentRoute: 'home'
    },
    beforeEnter: (to, _from, next) => {
      // Validar que el ID sea un número válido
      const id = to.params.id as string
      
      // Verificar que sea un número entero positivo
      if (!/^\d+$/.test(id) || parseInt(id) < 1 || parseInt(id) > 10000) {
        console.warn(`Invalid Pokémon ID: ${id}`)
        // Redirigir al home si el ID es inválido
        next({ name: 'home', replace: true })
      } else {
        next()
      }
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchView.vue'),
    meta: {
      title: 'Búsqueda Avanzada de Pokémon',
      description: 'Busca Pokémon por nombre, tipo y características específicas',
      requiresAuth: false,
      showInNavigation: true,
      icon: 'search'
    }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue'),
    meta: {
      title: 'Pokémon Favoritos',
      description: 'Tu colección personal de Pokémon favoritos',
      requiresAuth: false,
      showInNavigation: true,
      icon: 'heart'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'Acerca de la Pokédex',
      description: 'Información sobre la aplicación y tecnologías utilizadas',
      requiresAuth: false,
      showInNavigation: true,
      icon: 'info'
    }
  },
  {
    // Manejo de rutas no encontradas (404)
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: { name: 'home' },
    meta: {
      title: 'Página no encontrada',
      description: 'La página que buscas no existe',
      requiresAuth: false,
      showInNavigation: false
    }
  }
]

/**
 * Configuración del comportamiento de scroll
 * Controla cómo se posiciona la página al navegar entre rutas
 */
const scrollBehavior = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  savedPosition: { left: number; top: number } | null
) => {
  // Si hay una posición guardada (navegación con botones de historial)
  if (savedPosition) {
    return savedPosition
  }

  // Si la ruta tiene un hash (#section), scroll a ese elemento
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth' as ScrollBehavior
    }
  }

  // Si es la misma ruta pero con diferentes parámetros, mantener posición
  if (to.name === from.name && to.params.id !== from.params.id) {
    return { left: 0, top: 0, behavior: 'smooth' as ScrollBehavior }
  }

  // Por defecto, ir al top de la página
  return { left: 0, top: 0, behavior: 'smooth' as ScrollBehavior }
}

/**
 * Crear instancia del router con configuración completa
 */
const router = createRouter({
  // Usar history mode para URLs limpias (sin #)
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // Rutas de la aplicación
  routes,
  
  // Comportamiento de scroll personalizado
  scrollBehavior,
  
  // Configuración adicional
  strict: true, // Rutas estrictas (trailing slash matters)
  sensitive: false // No distinguir entre mayúsculas y minúsculas
})

// =====================================
// GUARDS DE NAVEGACIÓN
// =====================================

/**
 * Guard global antes de cada navegación
 * Maneja autenticación, títulos y logging
 */
router.beforeEach((to, from, next) => {
  console.log(`Navigating from ${from.path} to ${to.path}`)

  // Aquí se pueden agregar verificaciones de autenticación en el futuro
  // if (to.meta.requiresAuth && !isAuthenticated()) {
  //   next({ name: 'login' })
  //   return
  // }

  next()
})

/**
 * Guard global después de cada navegación
 * Actualiza títulos de página y meta información
 */
router.afterEach((to) => {
  // Actualizar título de la página
  const baseTitle = 'Pokédex App'
  const routeTitle = to.meta.title as string
  
  if (routeTitle) {
    document.title = `${routeTitle} | ${baseTitle}`
  } else {
    document.title = baseTitle
  }

  // Actualizar meta description
  const metaDescription = document.querySelector('meta[name="description"]')
  const routeDescription = to.meta.description as string
  
  if (metaDescription && routeDescription) {
    metaDescription.setAttribute('content', routeDescription)
  }

  // Log de navegación exitosa
  console.log(`Navigation completed: ${to.path}`)

  // Emitir evento personalizado para componentes que lo necesiten
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('route-changed', {
      detail: {
        to: to.path,
        name: to.name,
        params: to.params,
        query: to.query
      }
    }))
  }
})

/**
 * Guard para manejar errores de navegación
 */
router.onError((error) => {
  console.error('Router error:', error)
  
  // En producción, se podría enviar a un servicio de logging
  // logError('Router Navigation Error', error)
})

// =====================================
// FUNCIONES DE UTILIDAD
// =====================================

/**
 * Función helper para navegar programáticamente con validación
 *
 * @param routeName - Nombre de la ruta
 * @param params - Parámetros de la ruta
 * @param query - Query parameters
 */
const navigateTo = (
  routeName: string,
  params?: Record<string, string | number>,
  query?: Record<string, string | number>
) => {
  try {
    router.push({
      name: routeName,
      params,
      query
    })
  } catch (error) {
    console.error(`Error navigating to ${routeName}:`, error)
    // Fallback al home
    router.push({ name: 'home' })
  }
}

/**
 * Función para navegar al detalle de un Pokémon
 *
 * @param pokemonId - ID del Pokémon
 */
const navigateToPokemon = (pokemonId: string | number) => {
  const id = typeof pokemonId === 'string' ? pokemonId : pokemonId.toString()
  navigateTo('pokemon-detail', { id })
}

/**
 * Función para obtener rutas de navegación (para menús)
 */
const getNavigationRoutes = () => {
  return routes.filter(route => route.meta?.showInNavigation)
}

/**
 * Función para verificar si una ruta está activa
 *
 * @param routeName - Nombre de la ruta a verificar
 */
const isRouteActive = (routeName: string) => {
  return router.currentRoute.value.name === routeName
}

/**
 * Función para obtener la ruta padre de la ruta actual
 */
const getParentRoute = () => {
  const currentRoute = router.currentRoute.value
  const parentRouteName = currentRoute.meta?.parentRoute as string
  
  if (parentRouteName) {
    return routes.find(route => route.name === parentRouteName)
  }
  
  return null
}

/**
 * Función para generar breadcrumbs
 */
const getBreadcrumbs = () => {
  const currentRoute = router.currentRoute.value
  const breadcrumbs = []
  
  // Agregar home si no estamos en home
  if (currentRoute.name !== 'home') {
    breadcrumbs.push({
      name: 'home',
      title: 'Inicio',
      path: '/'
    })
  }
  
  // Agregar ruta padre si existe
  const parentRoute = getParentRoute()
  if (parentRoute && parentRoute.name !== 'home') {
    breadcrumbs.push({
      name: parentRoute.name,
      title: parentRoute.meta?.title,
      path: parentRoute.path
    })
  }
  
  // Agregar ruta actual
  if (currentRoute.name !== 'home') {
    breadcrumbs.push({
      name: currentRoute.name,
      title: currentRoute.meta?.title,
      path: currentRoute.path,
      active: true
    })
  }
  
  return breadcrumbs
}

// =====================================
// TYPES
// =====================================

/**
 * Extensión de meta información para rutas
 */
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    requiresAuth?: boolean
    showInNavigation?: boolean
    icon?: string
    parentRoute?: string
  }
}

// =====================================
// EXPORT
// =====================================

export default router

// Exportar también las funciones de utilidad
export {
  navigateTo,
  navigateToPokemon,
  getNavigationRoutes,
  isRouteActive,
  getParentRoute,
  getBreadcrumbs
}