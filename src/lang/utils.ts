/**
 * 国际化工具函数
 */
import i18n from "./index";

/**
 * 翻译路由标题
 * 用于面包屑、侧边栏、标签页等场景
 */
export function translateRouteTitle(title: string): string {
  const key = `route.${title}`;
  return i18n.global.te(key) ? i18n.global.t(key) : title;
}
