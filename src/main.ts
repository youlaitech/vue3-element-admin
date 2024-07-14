import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";

// 本地SVG图标
import "virtual:svg-icons-register";

// 样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";
import { InstallCodemirro } from "codemirror-editor-vue3";

const app = createApp(App);
app.use(setupPlugins);
app.use(InstallCodemirro);
app.mount("#app");
