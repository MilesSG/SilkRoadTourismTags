import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// ECharts 全局引入（也可按需引入以减小打包体积）
import * as echarts from 'echarts'

const app = createApp(App)

// 将 echarts 挂载到全局属性
app.config.globalProperties.$echarts = echarts

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { size: 'default' })

app.mount('#app')
