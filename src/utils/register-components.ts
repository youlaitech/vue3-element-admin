/**
 * 全局组件注册工具
 *
 * @description
 * 批量注册 Element Plus 图标等全局组件
 */

import type { App } from "vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

/**
 * 注册 Element Plus 所有图标为全局组件
 */
export function registerElementIcons(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}
