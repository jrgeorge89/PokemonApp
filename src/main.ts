import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

// Configurar Pinia para state management
app.use(createPinia())

// Configurar Vue Router
app.use(router)

// Montar la aplicación
app.mount('#app')
