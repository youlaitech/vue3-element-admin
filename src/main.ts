import { createApp } from "vue";
// TODO::不引入el-input-tag样式会丢失
import "element-plus/es/components/input-tag/style/css";
import App from "./App.vue";
import setupPlugins from "@/plugins";

// 暗黑主题样式
import "element-plus/theme-chalk/dark/css-vars.css";
// 暗黑模式自定义变量
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";

// 全局引入 animate.css
import "animate.css";

// 自动为某些默认事件（如 touchstart、wheel 等）添加 { passive: true },提升滚动性能并消除控制台的非被动事件监听警告
import "default-passive-events";

const app = createApp(App);
// 注册插件
app.use(setupPlugins);
app.mount("#app");
