/**
 * 工具函数统一导出
 *
 * 本文件作为 barrel export，统一管理所有工具函数的导出
 * 各类工具函数按功能分类存放在不同文件中：
 * - dom.ts: DOM 操作相关
 * - validate.ts: 数据验证相关
 * - format.ts: 数据格式化相关
 * - download.ts: 文件下载相关
 * - auth.ts: 权限认证相关
 * - storage.ts: 本地存储相关
 * - request.ts: 网络请求相关
 * - theme.ts: 主题相关
 */

// DOM 操作
export { hasClass, addClass, removeClass } from "./dom";

// 数据验证
export { isExternal, isValidURL, isEmail, isMobile } from "./validate";

// 数据格式化
export { formatGrowthRate, formatFileSize, formatNumber, formatCurrency } from "./format";

// 文件下载
export { downloadFile } from "./download";
