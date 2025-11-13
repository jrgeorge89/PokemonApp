<template>
  <div class="pagination bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mt-6">
    <!-- Información de resultados -->
    <div class="flex flex-col sm:flex-row justify-between items-center mb-4">
      <div class="text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
        Mostrando 
        <span class="font-medium">{{ startIndex }}</span> 
        a 
        <span class="font-medium">{{ endIndex }}</span> 
        de 
        <span class="font-medium">{{ total }}</span> 
        resultados
        <span v-if="hasFilters" class="text-gray-500 dark:text-gray-400 ml-1">
          (filtrados de {{ originalTotal || total }})
        </span>
      </div>
      
      <!-- Items per page selector -->
      <div v-if="showPageSizeSelector" class="flex items-center gap-2">
        <label for="page-size" class="text-sm text-gray-700 dark:text-gray-300">
          Por página:
        </label>
        <select
          id="page-size"
          v-model="selectedPageSize"
          class="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <!-- Controles de paginación -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Botones principales -->
      <div class="flex items-center gap-2">
        <!-- Primera página -->
        <button
          @click="goToPage(1)"
          :disabled="currentPage <= 1"
          class="pagination-btn"
          title="Primera página"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <!-- Página anterior -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="pagination-btn"
          title="Página anterior"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Páginas numéricas -->
        <div class="flex items-center gap-1">
          <template v-for="page in visiblePages" :key="page">
            <span
              v-if="page === '...'"
              class="px-3 py-1 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
            <button
              v-else
              @click="goToPage(Number(page))"
              :class="[
                'pagination-btn',
                Number(page) === currentPage ? 'pagination-btn-active' : ''
              ]"
            >
              {{ page }}
            </button>
          </template>
        </div>

        <!-- Página siguiente -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="pagination-btn"
          title="Página siguiente"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Última página -->
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage >= totalPages"
          class="pagination-btn"
          title="Última página"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Navegación directa -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-700 dark:text-gray-300">Ir a:</span>
        <input
          v-model.number="jumpToPage"
          @keyup.enter="handleJumpToPage"
          type="number"
          :min="1"
          :max="totalPages"
          class="w-16 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1"
        >
        <button
          @click="handleJumpToPage"
          :disabled="!jumpToPage || jumpToPage < 1 || jumpToPage > totalPages"
          class="pagination-btn text-sm"
        >
          Ir
        </button>
      </div>
    </div>

    <!-- Información adicional móvil -->
    <div class="sm:hidden mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
      Página {{ currentPage }} de {{ totalPages }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Props
interface Props {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  originalTotal?: number
  hasFilters?: boolean
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasFilters: false,
  showPageSizeSelector: true,
  pageSizeOptions: () => [12, 24, 48, 96],
  loading: false
})

// Emits
const emit = defineEmits<{
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

// State
const jumpToPage = ref<number>()
const selectedPageSize = ref(props.pageSize)

// Computed
const startIndex = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endIndex = computed(() => {
  const end = props.currentPage * props.pageSize
  return Math.min(end, props.total)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage
  
  if (total <= 7) {
    // Mostrar todas las páginas si hay 7 o menos
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Lógica compleja para mostrar páginas con elipsis
    pages.push(1)
    
    if (current <= 4) {
      // Cerca del inicio
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // Cerca del final
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // En el medio
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('pageChange', page)
  }
}

const handleJumpToPage = () => {
  if (jumpToPage.value && jumpToPage.value >= 1 && jumpToPage.value <= props.totalPages) {
    goToPage(jumpToPage.value)
    jumpToPage.value = undefined
  }
}

// Watchers
watch(
  () => selectedPageSize.value,
  (newSize) => {
    if (newSize !== props.pageSize) {
      emit('pageSizeChange', newSize)
    }
  }
)

watch(
  () => props.pageSize,
  (newSize) => {
    selectedPageSize.value = newSize
  }
)
</script>

<style scoped>
.pagination-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgb(209, 213, 219);
  border-radius: 0.375rem;
  background-color: white;
  color: rgb(55, 65, 81);
  transition: all 0.2s;
}

.pagination-btn:hover {
  background-color: rgb(249, 250, 251);
}

.pagination-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgb(59, 130, 246);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dark .pagination-btn {
  border-color: rgb(75, 85, 99);
  background-color: rgb(55, 65, 81);
  color: rgb(209, 213, 219);
}

.dark .pagination-btn:hover {
  background-color: rgb(75, 85, 99);
}

.pagination-btn-active {
  background-color: rgb(59, 130, 246);
  border-color: rgb(59, 130, 246);
  color: white;
}

.pagination-btn-active:hover {
  background-color: rgb(37, 99, 235);
}

.dark .pagination-btn-active {
  background-color: rgb(37, 99, 235);
}

.dark .pagination-btn-active:hover {
  background-color: rgb(29, 78, 216);
}
</style>