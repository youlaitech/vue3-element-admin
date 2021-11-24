import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import {store,key} from './store'
import '@styles/index.scss'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


import SvgIcon from './icons/index.vue'

const app=createApp(App)
app
    .component('svg-icon', SvgIcon)
    .use(router)
    .use(store,key)
    .use(ElementPlus)
    .mount('#app')
