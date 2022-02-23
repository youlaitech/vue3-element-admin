import {createApp, Directive} from 'vue'
import App from './App.vue'
import router from "@/router";

import {store} from "@/store";
import Pagination from '@/components/Pagination/index.vue'

import {localStorage} from "@/utils/storage";
import 'virtual:svg-icons-register';
import '@/permission'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'

// @see https://blog.csdn.net/qq_37213281/article/details/121422027
import * as ElIconModules from '@element-plus/icons'

// 国际化
import i18n from "@/lang/index";
import locale from 'element-plus/lib/locale/lang/zh-cn'


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

// 统一注册el-icon图标  https://blog.csdn.net/Alloom/article/details/119415984
for (let iconName in ElIconModules) {
    app.component(iconName, (ElIconModules as any)[iconName])
}

// 全局方法
app.config.globalProperties.$listDictsByCode = listDictsByCode

app.component('Pagination', Pagination) // 全局组件
    .use(store)
    .use(router)
    .use(ElementPlus, {size: localStorage.get('size') || 'small'})
    .use(i18n)
    .mount('#app')
