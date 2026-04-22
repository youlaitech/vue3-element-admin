import type { App } from "vue";
import { createI18n } from "vue-i18n";
import { useAppStoreHook } from "@/store/modules/app";
/* BUG: 不清楚为啥！在当前框架中，通过 vxe-pc-ui/lib/language/en-US 引入会多一层 default ... */
import enUS from "vxe-pc-ui/es/language/en-US";
import zhCN from "vxe-pc-ui/es/language/zh-CN";
// 本地语言包
import enLocale from "./package/en.json";
import zhCnLocale from "./package/zh-cn.json";

const appStore = useAppStoreHook();

const messages = {
  "zh-cn": {
    ...zhCN,
    ...zhCnLocale,
  },
  en: {
    ...enUS,
    ...enLocale,
  },
};

const i18n = createI18n({
  legacy: false,
  locale: appStore.language,
  messages,
  globalInjection: true,
});

// 全局注册 i18n
export function setupI18n(app: App<Element>) {
  app.use(i18n);
}

export default i18n;
