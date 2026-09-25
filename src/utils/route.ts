// 路由路径工具

import { isExternal } from "./validate";

/**
 * 拼接路由路径
 *
 * 外链与绝对路径原样返回，相对路径挂到父级之后；顶级相对路径自动补前导斜杠
 *
 * @param basePath 父级完整路径
 * @param path     当前段路径
 */
export function joinRoutePath(basePath: string, path?: string): string {
  if (!path) return basePath || "/";
  if (isExternal(path) || path.startsWith("/")) return path;
  return `${basePath.replace(/\/+$/, "")}/${path}`;
}
