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

/**
 * 解析外链地址：http(s)/mailto/tel 原样返回，站内路径补全为当前站点地址
 *
 * 站内路径拼成 hash 地址（如 /data-screen → https://host/#/data-screen），供新标签页直接打开
 *
 * @param url 菜单配置的外链地址
 */
export function resolveExternalUrl(url: string): string {
  if (isExternal(url)) return url;

  return `${window.location.origin}${window.location.pathname}#${url}`;
}
