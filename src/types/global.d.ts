/**
 * 全局类型声明
 *
 * @deprecated 请使用 @/types 下的具名导出
 */
declare global {
  type TagView = import("@/types/ui").TagView;
  type AppSettings = import("@/types/ui").AppSettings;
}

export {};
