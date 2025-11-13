<script setup lang="ts">
// Aplicación principal Pokémon
</script>

<template>
  <div id="app" class="min-h-screen">
    <!-- Header de la aplicación -->
    <header class="bg-linear-to from-blue-600 to-purple-600 text-white py-6 shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-center">
          <h1 class="text-4xl font-bold text-gradient">
            🎮 Pokémon App
          </h1>
        </div>
        <p class="text-center mt-2 text-blue-100">
          Explora el mundo de los Pokémon con Vue 3 + TypeScript
        </p>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="container mx-auto px-4 py-8">
      <div class="text-center">
        <div class="pokemon-card max-w-2xl mx-auto p-8">
          <div class="mb-6">
            <div class="text-6xl mb-4">⚡</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">
              Bienvenido a la Pokédex
            </h2>
            <p class="text-gray-600 mb-6">
              Aplicación desarrollada con el stack moderno de Vue 3, TypeScript, Tailwind CSS y Vite.
              Conectada a la PokéAPI para explorar información detallada de todos los Pokémon.
            </p>
          </div>

          <!-- Características del proyecto -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl mb-2">🔧</div>
              <h3 class="font-semibold text-blue-800">Stack Tecnológico</h3>
              <ul class="text-sm text-blue-600 mt-2">
                <li>Vue 3 + Composition API</li>
                <li>TypeScript</li>
                <li>Vite + Vitest</li>
                <li>Tailwind CSS v4</li>
              </ul>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl mb-2">⚡</div>
              <h3 class="font-semibold text-green-800">Funcionalidades</h3>
              <ul class="text-sm text-green-600 mt-2">
                <li>Listado de Pokémon</li>
                <li>Búsqueda y filtros</li>
                <li>Paginación</li>
                <li>Dark Mode</li>
              </ul>
            </div>
          </div>

          <!-- Estado del proyecto -->
          <div class="bg-linear-to from-green-50 to-blue-50 p-6 rounded-lg">
            <div class="flex items-center justify-center mb-4">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span class="font-semibold text-green-700">Proyecto configurado exitosamente</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div class="text-center">
                <div class="font-semibold text-gray-700">Servicios API</div>
                <div class="text-green-600">✓ Configurado</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-gray-700">TypeScript</div>
                <div class="text-green-600">✓ Tipos completos</div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-gray-700">Testing</div>
                <div class="text-green-600">✓ Vitest listo</div>
              </div>
            </div>
          </div>

          <!-- Botón de acción (para futura navegación) -->
          <div class="mt-8">
            <button class="btn-primary">
              🚀 Comenzar exploración
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-100 py-6 mt-12">
      <div class="container mx-auto px-4 text-center text-gray-600">
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

@media (prefers-color-scheme: dark) {
  .pokemon-card {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  header {
    background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
  }
  
  footer {
    background-color: #111827;
    color: #d1d5db;
  }
}
</style>
