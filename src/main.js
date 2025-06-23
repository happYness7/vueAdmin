import { createApp } from 'vue'
import SvgIcon from '@/icons'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/border.css'
import '@/assets/styles/reset.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import '@/assets/styles/global.scss'
import { createPinia } from 'pinia'





// createApp(App).use(store).use(router).use(ElementPlus).mount('#app')

const app=createApp(App)
const pinia = createPinia()
SvgIcon(app);

app.use(store)
app.use(pinia)

app.use(router)

app.use(ElementPlus, {
    locale: zhCn,
})
const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.classList.toggle('dark', savedTheme === 'dark')
app.mount('#app')


