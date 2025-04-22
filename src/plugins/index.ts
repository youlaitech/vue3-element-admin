import type { App } from "vue";

import { setupDirective } from "@/directive";
import { setupI18n } from "@/lang";
import { setupRouter } from "@/router";
import { setupStore } from "@/store";
import { setupElIcons } from "./icons";
import { setupPermission } from "./permission";
import { setupWebSocket } from "./websocket";
import { InstallCodeMirror } from "codemirror-editor-vue3";

export default {
  install(app: App<Element>) {
    // 自定义指令(directive)
    setupDirective(app);
    // 路由(router)
    setupRouter(app);
    // 状态管理(store)
    setupStore(app);
    // 国际化
    setupI18n(app);
    // Element-plus图标
    setupElIcons(app);
    // 路由守卫
    setupPermission();
    // WebSocket服务
    setupWebSocket();
    // 注册 CodeMirror
    app.use(InstallCodeMirror);
  },
};
