import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import {store,key} from './store'
import '@styles/index.scss'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app=createApp(App)
app
    .use(router)
    .use(store,key)
    .use(ElementPlus)
    .mount('#app')
