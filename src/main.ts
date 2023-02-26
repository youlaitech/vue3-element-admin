import { createApp, Directive } from 'vue';
import App from './App.vue';
import router from '@/router';
import { setupStore } from '@/store';

import '@/permission';

// 本地SVG图标
import 'virtual:svg-icons-register';

// 国际化
import i18n from '@/lang/index';

import '@/styles/index.scss';
import 'element-plus/theme-chalk/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import 'uno.css';

const app = createApp(App);
// 自定义指令
import * as directive from '@/directive';
Object.keys(directive).forEach(key => {
  app.directive(key, (directive as { [key: string]: Directive })[key]);
});

// 全局方法
import { getDictionaries } from '@/api/dict';
app.config.globalProperties.$getDictionaries = getDictionaries;

// 全局挂载
setupStore(app);
app.use(router).use(i18n).mount('#app');
