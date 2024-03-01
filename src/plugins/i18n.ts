// 国际化
import i18n from "@/lang/index";
import type { App } from "vue";

export function setupI18n(app: App<Element>) {
  app.use(i18n);
}
