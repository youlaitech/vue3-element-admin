import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";

// 暗黑主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
import "vxe-table/lib/style.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 过渡动画
import "animate.css";

const app = createApp(App);
// 注册插件
app.use(setupPlugins);
app.mount("#app");
