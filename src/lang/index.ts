import { createI18n } from "vue-i18n";
import { useAppStoreHook } from "@/store/modules/app";
// 本地语言包
import enLocale from "./package/en";
import zhCnLocale from "./package/zh-cn";

const appStore = useAppStoreHook();

const messages = {
  "zh-cn": {
    ...zhCnLocale,
  },
  en: {
    ...enLocale,
  },
};

const i18n = createI18n({
  legacy: false,
  locale: appStore.language,
  messages: messages,
  globalInjection: true,
});

export default i18n;
