import { createApp } from "vue";
import App from "./App.vue";

import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";

import { setupDirective } from "@/directives";
import { setupRouter } from "@/router";
import { setupStore } from "@/stores";
import { setupI18n } from "@/lang";
import { setupFormCreate } from "@/plugins/form-create";
import * as ElementPlusIcons from "@element-plus/icons-vue";
import { setupPermissionGuard } from "@/router/guards/permission";
import { useSse } from "@/utils/sse";
import { useDictStoreHook } from "@/stores/dict";

const app = createApp(App);

setupDirective(app);
setupI18n(app);
setupRouter(app);
setupStore(app);
setupFormCreate(app);

Object.entries(ElementPlusIcons).forEach(([name, comp]) => app.component(name, comp));

setupPermissionGuard();

// 建立 SSE 连接并开启字典实时同步
useSse().connect();
useDictStoreHook().setupDictSync();

app.mount("#app");
