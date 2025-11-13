<script setup lang="ts">
import { onMounted } from 'vue'
import { useUiStore } from './stores/ui.store'

// Configurar stores
const uiStore = useUiStore()

// Inicializar tema al montar la aplicación
onMounted(() => {
  uiStore.initializeTheme()
})
</script>

<template>
  <div id="app" class="min-h-screen" :class="uiStore.themeClass">
    <!-- Header de la aplicación -->
    <header class="bg-linear-to-r from-blue-600 to-purple-600 text-white py-4 shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          <!-- Logo y título -->
          <router-link to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <h1 class="text-2xl font-bold text-gradient">
              🎮 Pokémon App
            </h1>
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
            <button
              @click="uiStore.toggleDarkMode"
              class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              :title="uiStore.isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            >
              {{ uiStore.isDarkMode ? '☀️' : '🌙' }}
            </button>
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
            
            <button
              @click="uiStore.toggleDarkMode"
              class="mobile-nav-link w-full text-left"
            >
              {{ uiStore.isDarkMode ? '☀️ Modo claro' : '🌙 Modo oscuro' }}
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="flex-1">
      <!-- Router View - aquí se renderizan las páginas -->
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-100 dark:bg-gray-800 py-6 mt-auto">
      <div class="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
        <p>
          Construido con ❤️ usando 
          <span class="font-semibold text-blue-600">Vue 3</span>, 
          <span class="font-semibold text-blue-500">TypeScript</span> y 
          <span class="font-semibold text-cyan-500">Tailwind CSS</span>
        </p>
        <p class="mt-2 text-sm">
          Datos proporcionados por <a href="https://pokeapi.co/" class="text-blue-500 hover:underline" target="_blank">PokéAPI</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Estilos específicos del componente App */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Estilos para navegación */
.nav-link {
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
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
  transition: background-color 0.2s;
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

/* Asegurar que el layout sea flexible */
#app {
  display: flex;
  flex-direction: column;
}
</style>
