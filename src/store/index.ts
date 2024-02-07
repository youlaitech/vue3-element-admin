import type { App } from "vue";
import { createPinia } from "pinia";

const store = createPinia();

// 全局注册 store
export function setupStore(app: App<Element>) {
  app.use(store);
}

export * from "./modules/app";
export * from "./modules/permission";
export * from "./modules/settings";
export * from "./modules/tagsView";
export * from "./modules/user";
export { store };
