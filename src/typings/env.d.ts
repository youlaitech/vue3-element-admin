/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  /** 应用端口 */
  VITE_APP_PORT: string;
  /** API 基础路径 */
  VITE_APP_BASE_API: string;
  VITE_APP_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
