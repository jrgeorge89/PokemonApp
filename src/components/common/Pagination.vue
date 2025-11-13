<template>
  <div class="pagination-container flex flex-col items-center space-y-4 p-4">
    <!-- Información de página -->
    <div class="page-info text-sm text-gray-600 dark:text-gray-400 font-medium">
      Página {{ currentPage }} de {{ totalPages }}
    </div>

    <!-- Controles de navegación -->
    <div class="pagination-controls flex items-center space-x-2">
      <!-- Botón Anterior -->
      <button
        @click="goToPreviousPage"
        :disabled="currentPage <= 1"
        class="pagination-btn pagination-btn-nav"
        :class="{
          'pagination-btn-disabled': currentPage <= 1
        }"
        aria-label="Página anterior"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="hidden sm:inline ml-1">Anterior</span>
      </button>

      <!-- Números de página -->
      <div class="flex items-center space-x-1">
        <template v-for="(page, index) in visiblePages" :key="index">
          <!-- Ellipsis -->
          <span 
            v-if="page === '...'"
            class="pagination-ellipsis px-2 py-2 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
          
          <!-- Números de página -->
          <button
            v-else
            @click="goToPage(Number(page))"
            :class="[
              'pagination-btn pagination-btn-number',
              {
                'pagination-btn-active': Number(page) === currentPage,
                'pagination-btn-inactive': Number(page) !== currentPage
              }
            ]"
            :aria-label="`Ir a la página ${page}`"
            :aria-current="Number(page) === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Botón Siguiente -->
      <button
        @click="goToNextPage"
        :disabled="currentPage >= totalPages"
        class="pagination-btn pagination-btn-nav"
        :class="{
          'pagination-btn-disabled': currentPage >= totalPages
        }"
        aria-label="Página siguiente"
      >
        <span class="hidden sm:inline mr-1">Siguiente</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

// Emits
const emit = defineEmits<{
  'page-change': [page: number]
}>()

// Computed
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage
  const maxVisible = props.maxVisiblePages

  // Si hay pocas páginas, mostrar todas
  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
    return pages
  }

  // Siempre mostrar la primera página
  pages.push(1)

  // Calcular el rango alrededor de la página actual
  const halfVisible = Math.floor(maxVisible / 2)
  let startPage = Math.max(2, current - halfVisible)
  let endPage = Math.min(total - 1, current + halfVisible)

  // Ajustar si estamos cerca del inicio
  if (current <= halfVisible + 1) {
    endPage = Math.min(total - 1, maxVisible - 1)
  }

  // Ajustar si estamos cerca del final
  if (current >= total - halfVisible) {
    startPage = Math.max(2, total - maxVisible + 2)
  }

  // Agregar ellipsis del inicio si es necesario
  if (startPage > 2) {
    pages.push('...')
  }

  // Agregar páginas del rango medio
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  // Agregar ellipsis del final si es necesario
  if (endPage < total - 1) {
    pages.push('...')
  }

  // Siempre mostrar la última página (si no es la primera)
  if (total > 1) {
    pages.push(total)
  }

  return pages
})

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1)
  }
}
</script>

<style scoped>
/* Base button styles */
.pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s;
  outline: none;
}

.pagination-btn:focus {
  box-shadow: 0 0 0 2px rgb(59, 130, 246);
  outline-offset: 2px;
}

/* Navigation buttons (Anterior/Siguiente) */
.pagination-btn-nav {
  background-color: white;
  color: rgb(55, 65, 81);
  border: 1px solid rgb(209, 213, 219);
}

.pagination-btn-nav:hover:not(.pagination-btn-disabled) {
  background-color: rgb(249, 250, 251);
  color: rgb(17, 24, 39);
}

/* Number buttons - inactive */
.pagination-btn-number.pagination-btn-inactive {
  background-color: white;
  color: rgb(55, 65, 81);
  border: 1px solid rgb(209, 213, 219);
}

.pagination-btn-number.pagination-btn-inactive:hover {
  background-color: rgb(249, 250, 251);
  color: rgb(17, 24, 39);
}

/* Number buttons - active (current page) */
.pagination-btn-number.pagination-btn-active {
  background-color: rgb(59, 130, 246);
  color: white;
  border: 1px solid rgb(59, 130, 246);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pagination-btn-number.pagination-btn-active:hover {
  background-color: rgb(37, 99, 235);
  border-color: rgb(37, 99, 235);
}

/* Disabled state */
.pagination-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn-disabled:hover {
  background-color: white;
  color: rgb(55, 65, 81);
}

/* Ellipsis */
.pagination-ellipsis {
  user-select: none;
}

/* Page info */
.page-info {
  text-align: center;
}

/* Hover effects */
.pagination-btn:not(.pagination-btn-disabled):hover {
  transform: scale(1.05);
}

.pagination-btn:not(.pagination-btn-disabled):active {
  transform: scale(0.95);
}

/* Focus styles for accessibility */
.pagination-btn:focus-visible {
  box-shadow: 0 0 0 2px rgb(59, 130, 246);
  outline-offset: 2px;
}

/* Dark mode styles */
.dark .pagination-btn-nav,
.dark .pagination-btn-number.pagination-btn-inactive {
  background-color: rgb(31, 41, 55);
  color: rgb(209, 213, 219);
  border-color: rgb(75, 85, 99);
}

.dark .pagination-btn-nav:hover:not(.pagination-btn-disabled),
.dark .pagination-btn-number.pagination-btn-inactive:hover {
  background-color: rgb(75, 85, 99);
  color: white;
}

.dark .pagination-btn-number.pagination-btn-active {
  background-color: rgb(37, 99, 235);
  border-color: rgb(37, 99, 235);
}

.dark .pagination-btn-number.pagination-btn-active:hover {
  background-color: rgb(29, 78, 216);
  border-color: rgb(29, 78, 216);
}

.dark .pagination-btn-disabled:hover {
  background-color: rgb(31, 41, 55);
  color: rgb(209, 213, 219);
}

.dark .pagination-btn:focus {
  box-shadow: 0 0 0 2px rgb(59, 130, 246);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .pagination-container {
    gap: 0.75rem;
  }
  
  .pagination-controls {
    gap: 0.25rem;
  }
  
  .pagination-btn {
    min-width: 2rem;
    height: 2.25rem;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  /* Hide some page numbers on mobile */
  .pagination-btn-number:nth-child(n+4):nth-last-child(n+4) {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .pagination-btn {
    border-width: 2px;
  }
  
  .pagination-btn-active {
    border-color: rgb(29, 78, 216);
  }
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .pagination-btn {
    transition: none;
  }
  
  .pagination-btn:hover {
    transform: none;
  }
}

/* Animation for page info changes */
.page-info {
  transition: all 0.2s ease-in-out;
}

/* Loading state support */
.pagination-container.loading .pagination-btn {
  opacity: 0.5;
  pointer-events: none;
}
</style>