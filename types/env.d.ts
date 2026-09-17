/// <reference types="vite/client" />

/**
 * Vite 环境变量类型定义
 */
interface ImportMetaEnv {
  readonly VITE_APP_PORT: string;
  readonly VITE_API_BASE: string;
  readonly VITE_PROXY_TARGET: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_TENANT_ENABLED?: string;
  readonly VITE_AI_ENABLED?: string;
  readonly VITE_MOCK_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_INFO__: {
  pkg: {
    name: string;
    version: string;
  };
  buildTimestamp: number;
};
