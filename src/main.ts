import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import {store,key} from './store'
import '@/styles/index.scss'

import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import 'virtual:svg-icons-register';


// @see https://blog.csdn.net/qq_37213281/article/details/121422027
import * as ElIconModules from '@element-plus/icons'


import '@/permission'

const app=createApp(App)

// 统一注册el-icon图标
for(let iconName in ElIconModules){
    // @ts-ignore
    app.component(iconName,ElIconModules[iconName] )
}

app
    .use(router)
    .use(store,key)
    .use(ElementPlus)
    .mount('#app')