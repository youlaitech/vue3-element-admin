import {createApp, Directive} from 'vue'
import App from './App.vue'
import router from "@/router";

import { createPinia } from "pinia"
import Pagination from '@/components/Pagination/index.vue'

import {localStorage} from "@/utils/storage";
import 'virtual:svg-icons-register';
import '@/permission'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'

// 国际化
import i18n from "@/lang/index";

// 自定义样式
import '@/styles/index.scss'

// 全局方法
import {listDictsByCode} from '@/api/system/dict'

const app = createApp(App)

// 自定义指令
import * as directive from "@/directive";

Object.keys(directive).forEach(key => {
    app.directive(key, (directive as { [key: string]: Directive })[key]);
});

// 全局方法
app.config.globalProperties.$listDictsByCode = listDictsByCode

// 注册全局组件
app.component('Pagination', Pagination)
    .use(createPinia())
    .use(router)
    .use(ElementPlus, {size: localStorage.get('size') || 'default'})
    .use(i18n)
    .mount('#app')
