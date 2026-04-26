import type { App } from "vue";
import { createPinia } from "pinia";

const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
}

export * from "./app";
export * from "./dict";
export * from "./permission";
export * from "./settings";
export * from "./tags-view";
export * from "./tenant";
export * from "./user";
export { store };
