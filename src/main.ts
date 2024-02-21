import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import { setupStore } from "@/store";
import { setupDirective } from "@/directive";

import "@/permission";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";

// 本地SVG图标
import "virtual:svg-icons-register";

// 国际化
import i18n from "@/lang/index";

// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";

const app = createApp(App);
// 全局注册 自定义指令(directive)
setupDirective(app);
// 全局注册 状态管理(store)
setupStore(app);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(router).use(i18n).mount("#app");
