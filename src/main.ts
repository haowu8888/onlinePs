import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import './styles/global.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)

// Add dark class to html element
document.documentElement.classList.add('dark')

app.mount('#app')
