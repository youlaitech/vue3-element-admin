import type { App } from 'vue';
import { createPinia } from 'pinia';

const store = createPinia();

// 全局挂载store
export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
