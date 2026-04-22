import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { createPersistedStatePlugin } from './plugins/persistedState.js'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(createPersistedStatePlugin())
app.use(pinia)
app.use(router)
app.mount('#app')
