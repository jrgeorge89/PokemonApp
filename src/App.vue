<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUiStore } from './stores/ui.store'
import { useFilterStore } from './stores/filter.store'
import DarkModeToggle from './components/common/DarkModeToggle.vue'

// Inicializar stores
const uiStore = useUiStore()
const filterStore = useFilterStore()

// Computed para clase dinámica del wrapper
const appClass = computed(() => ({
  'bg-white dark:bg-gray-900': true,
  'text-gray-900 dark:text-gray-100': true,
  'transition-colors duration-300': true
}))

// Inicializar aplicación
onMounted(() => {
  uiStore.initializeTheme()
  // Inicializar datos necesarios
  filterStore.loadAvailableTypes()
})
</script>

<template>
  <!-- Wrapper principal con clase dinámica para dark mode -->
  <div id="app" class="min-h-screen" :class="[uiStore.themeClass, appClass]">
    
    <!-- Header con logo/título y DarkModeToggle -->
    <header class="sticky top-0 z-40 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white py-4 shadow-lg backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          
          <!-- Logo y título -->
          <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-2xl">⚡</span>
            </div>
            <div>
              <h1 class="text-xl md:text-2xl font-bold text-white">
                Pokédex
              </h1>
              <p class="text-xs text-white/80 hidden md:block">
                Explora el mundo Pokémon
              </p>
            </div>
          </router-link>
          
          <!-- Navegación principal -->
          <nav class="hidden md:flex items-center space-x-6">
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ 'active': $route.name === 'home' }"
            >
              Inicio
            </router-link>
            <router-link 
              to="/search" 
              class="nav-link"
              :class="{ 'active': $route.name === 'search' }"
            >
              Buscar
            </router-link>
            <router-link 
              to="/favorites" 
              class="nav-link"
              :class="{ 'active': $route.name === 'favorites' }"
            >
              Favoritos
            </router-link>
            <router-link 
              to="/about" 
              class="nav-link"
              :class="{ 'active': $route.name === 'about' }"
            >
              Acerca de
            </router-link>
            
            <!-- Toggle dark mode -->
            <DarkModeToggle
              size="medium"
              variant="minimal"
              :show-tooltip="false"
            />
          </nav>

          <!-- Botón menú móvil -->
          <button
            @click="uiStore.toggleSidebar"
            class="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Sidebar móvil -->
    <div 
      v-if="uiStore.sidebarOpen"
      class="fixed inset-0 z-50 md:hidden"
    >
      <!-- Overlay -->
      <div 
        class="fixed inset-0 bg-black/50"
        @click="uiStore.toggleSidebar"
      ></div>
      
      <!-- Sidebar -->
      <div class="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform">
        <div class="p-4">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold dark:text-white">Navegación</h2>
            <button
              @click="uiStore.toggleSidebar"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg class="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav class="space-y-2">
            <router-link 
              to="/" 
              class="mobile-nav-link"
              @click="uiStore.toggleSidebar"
            >
              🏠 Inicio
            </router-link>
            <router-link 
              to="/search" 
              class="mobile-nav-link"
              @click="uiStore.toggleSidebar"
            >
              🔍 Buscar
            </router-link>
            <router-link 
              to="/favorites" 
              class="mobile-nav-link"
              @click="uiStore.toggleSidebar"
            >
              ❤️ Favoritos
            </router-link>
            <router-link 
              to="/about" 
              class="mobile-nav-link"
              @click="uiStore.toggleSidebar"
            >
              ℹ️ Acerca de
            </router-link>
            
            <hr class="my-4 border-gray-200 dark:border-gray-600">
            
            <div class="flex items-center justify-between px-4 py-2">
              <span class="text-gray-700 dark:text-gray-300">
                {{ uiStore.isDarkMode ? 'Modo claro' : 'Modo oscuro' }}
              </span>
              <DarkModeToggle
                size="small"
                variant="default"
                :show-tooltip="false"
              />
            </div>
          </nav>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="flex-1 container mx-auto max-w-7xl px-4 py-6">
      <!-- Router View - aquí se renderizan las páginas -->
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="mt-auto bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <div class="flex items-center justify-center space-x-2 mb-4">
            <span class="text-2xl">⚡</span>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Pokédex</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-2">
            Construido con ❤️ usando 
            <span class="font-semibold text-blue-600 dark:text-blue-400">Vue 3</span>, 
            <span class="font-semibold text-green-600 dark:text-green-400">TypeScript</span> y 
            <span class="font-semibold text-cyan-600 dark:text-cyan-400">Tailwind CSS</span>
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Datos proporcionados por 
            <a 
              href="https://pokeapi.co/" 
              class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              PokéAPI
            </a>
          </p>
          <div class="mt-4 text-xs text-gray-400 dark:text-gray-500">
            © {{ new Date().getFullYear() }} Pokédex App. Hecho con fines educativos.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Layout con min-height 100vh */
#app {
  display: flex;
  flex-direction: column;
}

/* Header fijo o sticky con transiciones suaves para cambio de tema */
header {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  backdrop-filter: blur(8px);
}

.dark header {
  background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);
}

/* Container principal con max-width y padding */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Estilos para navegación - colores de background y text para ambos modos */
.nav-link {
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: rgb(55, 65, 81);
  transition: background-color 0.2s ease;
  text-decoration: none;
}

.dark .mobile-nav-link {
  color: rgb(229, 231, 235);
}

.mobile-nav-link:hover {
  background-color: rgb(243, 244, 246);
}

.dark .mobile-nav-link:hover {
  background-color: rgb(55, 65, 81);
}

.mobile-nav-link.router-link-active {
  background-color: rgb(239, 246, 255);
  color: rgb(37, 99, 235);
  font-weight: 500;
}

.dark .mobile-nav-link.router-link-active {
  background-color: rgba(30, 58, 138, 0.5);
  color: rgb(96, 165, 250);
}

/* Transiciones suaves para cambio de tema */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Responsive - Asegurar que toda la app sea responsive */
@media (max-width: 768px) {
  .container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  main {
    padding: 1rem 0.25rem;
  }
}
</style>
