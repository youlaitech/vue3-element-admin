/**
 * 全局类型声明
 *
 * @deprecated 请使用 @/types 下的具名导出
 */
declare global {
  type ApiResponse<T = any> = import("@/types/api").ApiResponse<T>;
  type PageQuery = import("@/types/api").PageQuery;
  type PageResult<T> = import("@/types/api").PageResult<T>;
  type OptionType = import("@/types/api").OptionType;
  type ExcelResult = import("@/types/api").ExcelResult;
  type TagView = import("@/types/ui").TagView;
  type AppSettings = import("@/types/ui").AppSettings;
}

export {};
