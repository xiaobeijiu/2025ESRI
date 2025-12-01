import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'



// 3.加载路由器
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
